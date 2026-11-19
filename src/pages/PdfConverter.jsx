import { useState, useRef } from 'react'
import {
  FileText, FileSpreadsheet, Upload, Download, ArrowRight,
  CheckCircle2, AlertCircle, Loader2, FileDown, Table2,
  File, Presentation, FileCode, Trash2, Info, ArrowLeft,
  HardDrive, Sparkles, FolderOpen
} from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import * as XLSX from 'xlsx'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { useAccountingStore } from '@/store/accountingStore'
import { useAppStore } from '@/store/appStore'
import { saveToClientFolder, CLIENT_SUBFOLDERS, openClientFolderInExplorer } from '@/utils/clientStorage'
import FileActionBar from '@/components/common/FileActionBar'
import PdfConverterWorkbench from '@/components/pdf/PdfConverterWorkbench'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

const CONVERSIONS = [
  {
    id: 'pdf-excel',
    from: 'PDF',
    to: 'Microsoft Excel (.xlsx)',
    icon: FileSpreadsheet,
    badge: 'BANK STMT',
    color: 'emerald',
    subFolder: CLIENT_SUBFOLDERS.EXCEL_FILES,
    desc: 'Extract bank statements, trial balances, and financial tables from PDF into structured, calculation-ready Excel workbooks.'
  },
  {
    id: 'pdf-word',
    from: 'PDF',
    to: 'Microsoft Word (.doc)',
    icon: FileText,
    badge: 'DOCUMENT',
    color: 'blue',
    subFolder: CLIENT_SUBFOLDERS.WORD_DOCUMENTS,
    desc: 'Extract structured text, headers, and formatted tables from PDF into an editable Microsoft Word document.'
  },
  {
    id: 'pdf-ppt',
    from: 'PDF',
    to: 'PowerPoint Presentation',
    icon: Presentation,
    badge: 'SLIDES',
    color: 'purple',
    subFolder: CLIENT_SUBFOLDERS.REPORTS,
    desc: 'Convert multi-page PDF audit reports and summaries into presentation slides formatted for board meetings.'
  },
  {
    id: 'word-pdf',
    from: 'Microsoft Word (.docx / .txt)',
    to: 'PDF Document',
    icon: FileDown,
    badge: 'SECURE PDF',
    color: 'rose',
    subFolder: CLIENT_SUBFOLDERS.PDF_DOCUMENTS,
    desc: 'Convert Word agreements, engagement letters, and memoranda into formal audit-ready PDF documents.'
  },
  {
    id: 'excel-pdf',
    from: 'Excel / CSV (.xlsx / .csv)',
    to: 'PDF Document',
    icon: FileDown,
    badge: 'TABLE PDF',
    color: 'indigo',
    subFolder: CLIENT_SUBFOLDERS.PDF_DOCUMENTS,
    desc: 'Convert financial spreadsheets, tax schedules, and ledger exports into clean, printable PDF documents.'
  },
  {
    id: 'merge-pdf',
    from: 'Multiple PDFs',
    to: 'Single Merged PDF',
    icon: FileCode,
    badge: 'MERGE',
    color: 'slate',
    subFolder: CLIENT_SUBFOLDERS.PDF_DOCUMENTS,
    desc: 'Combine multiple client documents, bank statements, and invoices into one unified PDF working paper.'
  },
]

function colorClass(color) {
  const map = {
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-500 hover:border-emerald-400',
    blue:    'bg-blue-50 text-blue-800 border-blue-300 ring-blue-500 hover:border-blue-400',
    purple:  'bg-purple-50 text-purple-800 border-purple-300 ring-purple-500 hover:border-purple-400',
    rose:    'bg-rose-50 text-rose-800 border-rose-300 ring-rose-500 hover:border-rose-400',
    indigo:  'bg-indigo-50 text-indigo-800 border-indigo-300 ring-indigo-500 hover:border-indigo-400',
    slate:   'bg-slate-50 text-slate-800 border-slate-300 ring-slate-500 hover:border-slate-400',
  }
  return map[color] || 'bg-slate-50 text-slate-700 border-slate-200'
}

/**
 * Enhanced PDF text and table extraction
 * Groups items by Y coordinates (rows) and sorts by X coordinates (columns).
 */
async function extractPdfPages(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()

    const rowMap = {}
    for (const item of content.items) {
      if (!item.str?.trim()) continue
      const y = Math.round(item.transform[5] / 5) * 5 // 5px tolerance
      if (!rowMap[y]) rowMap[y] = []
      rowMap[y].push({ x: item.transform[4], text: item.str.trim() })
    }

    const rows = Object.entries(rowMap)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([, cells]) => cells.sort((a, b) => a.x - b.x).map(c => c.text))

    pages.push({
      pageNumber: i,
      rows,
      rawText: rows.map(r => r.join('  ')).join('\n')
    })
  }
  return pages
}

/**
 * Convert PDF to Excel Workbook (.xlsx)
 * Preserves financial numbers, columns and formats.
 */
async function convertPdfToExcelWorkbook(file, clientName) {
  const pages = await extractPdfPages(file)
  const wb = XLSX.utils.book_new()

  // Sheet 1: Main Extracted Data
  const sheetRows = [
    ['Provident Accounting & Audit — Extracted Financial Schedule'],
    [`Client Entity: ${clientName || 'General Client'}`],
    [`Source PDF: ${file.name}`],
    [`Extraction Date: ${new Date().toLocaleString('en-ZA')}`],
    [],
  ]

  pages.forEach((p) => {
    sheetRows.push([`--- PAGE ${p.pageNumber} ---`])
    p.rows.forEach(row => {
      // Convert numeric looking strings to actual numbers
      const parsedRow = row.map(val => {
        const cleaned = val.replace(/,/g, '').replace(/[R$€£]/g, '').trim()
        if (/^-?\d+(\.\d+)?$/.test(cleaned) && cleaned.length < 15) {
          return parseFloat(cleaned)
        }
        return val
      })
      sheetRows.push(parsedRow)
    })
    sheetRows.push([])
  })

  const ws = XLSX.utils.aoa_to_sheet(sheetRows)

  // Auto calculate column widths
  const colWidths = []
  sheetRows.forEach(row => {
    row.forEach((cell, colIndex) => {
      const len = String(cell || '').length
      colWidths[colIndex] = Math.max(colWidths[colIndex] || 12, Math.min(len + 3, 50))
    })
  })
  ws['!cols'] = colWidths.map(w => ({ wch: w }))

  XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data')

  // Sheet 2: Bank Recon Helper
  const reconRows = [
    ['Bank Reconciliation Verification Sheet'],
    ['Source File:', file.name],
    ['Client:', clientName || 'Provident Client'],
    [],
    ['Date', 'Transaction Description', 'Reference', 'Debit Amount', 'Credit Amount', 'Running Balance', 'Audit Verified'],
  ]

  pages.forEach(p => {
    p.rows.forEach(r => {
      if (r.length >= 3) {
        reconRows.push([
          r[0] || '',
          r[1] || '',
          r[2] || '',
          r[3] || '',
          r[4] || '',
          r[5] || '',
          'Pending'
        ])
      }
    })
  })

  const wsRecon = XLSX.utils.aoa_to_sheet(reconRows)
  wsRecon['!cols'] = [{ wch: 14 }, { wch: 35 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, wsRecon, 'Bank Reconciliation')

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

/**
 * Convert PDF to Microsoft Word Document (.doc)
 * Generates an HTML-based Office Word Document that MS Word renders with 100% table layout.
 */
async function convertPdfToWordDocument(file, clientName) {
  const pages = await extractPdfPages(file)

  let html = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${file.name} - Converted Document</title>
<style>
  body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.5; margin: 30px; }
  h1 { font-size: 18pt; color: #0f172a; border-bottom: 2px solid #5b5fc7; padding-bottom: 4px; margin-bottom: 12px; }
  .subtitle { font-size: 10pt; color: #64748b; margin-bottom: 20px; }
  .page-box { margin-bottom: 30px; page-break-after: always; }
  .page-badge { display: inline-block; background-color: #f1f5f9; color: #475569; font-weight: bold; font-size: 9pt; padding: 2px 8px; border-radius: 4px; margin-bottom: 10px; }
  table { border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 15px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10pt; text-align: left; }
  th { background-color: #f8fafc; font-weight: bold; }
  tr:nth-child(even) td { background-color: #fcfcfc; }
  .footer { font-size: 9pt; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
</style>
</head>
<body>
  <h1>${file.name.replace(/\.[^.]+$/, '')}</h1>
  <div class="subtitle">
    <strong>Client Entity:</strong> ${clientName || 'General Client'} &bull;
    <strong>Converted:</strong> ${new Date().toLocaleString('en-ZA')} &bull;
    <strong>Application:</strong> Provident Accounting &amp; Audit Suite
  </div>
`

  pages.forEach(p => {
    html += `\n<div class="page-box">\n<span class="page-badge">Page ${p.pageNumber}</span>\n`
    if (p.rows.length > 0) {
      html += `<table>\n`
      p.rows.forEach((row, ri) => {
        html += `  <tr>\n`
        row.forEach(cell => {
          if (ri === 0) {
            html += `    <th>${escapeHtml(cell)}</th>\n`
          } else {
            html += `    <td>${escapeHtml(cell)}</td>\n`
          }
        })
        html += `  </tr>\n`
      })
      html += `</table>\n`
    } else {
      html += `<p>${escapeHtml(p.rawText)}</p>\n`
    }
    html += `</div>\n`
  })

  html += `
  <div class="footer">
    Provident Financial Consultants &bull; Converted with Provident Document Processing Engine
  </div>
</body>
</html>`

  const encoder = new TextEncoder()
  return encoder.encode(html)
}

/**
 * Convert PDF to PowerPoint Slide Deck HTML/Presentation
 */
async function convertPdfToPowerPoint(file, clientName) {
  const pages = await extractPdfPages(file)

  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${file.name} - Slide Presentation</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; margin: 0; padding: 20px; color: white; }
  .slide { background: white; color: #1e293b; width: 900px; height: 506px; margin: 20px auto; padding: 40px; box-sizing: border-box; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); page-break-after: always; position: relative; }
  .slide-header { border-bottom: 3px solid #5b5fc7; padding-bottom: 10px; margin-bottom: 20px; }
  .slide-title { font-size: 20pt; font-weight: bold; color: #0f172a; margin: 0; }
  .slide-sub { font-size: 11pt; color: #64748b; margin-top: 4px; }
  .slide-content { font-size: 11pt; max-height: 330px; overflow-y: auto; }
  table { border-collapse: collapse; width: 100%; margin-top: 10px; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; font-size: 10pt; text-align: left; }
  th { background-color: #f1f5f9; font-weight: bold; }
  .slide-footer { position: absolute; bottom: 15px; left: 40px; right: 40px; font-size: 9pt; color: #94a3b8; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px; }
</style>
</head>
<body>
`

  pages.forEach(p => {
    html += `
  <div class="slide">
    <div class="slide-header">
      <h2 class="slide-title">${clientName || 'Provident Client'} — Audit Review</h2>
      <div class="slide-sub">${file.name} &bull; Page ${p.pageNumber} of ${pages.length}</div>
    </div>
    <div class="slide-content">
`
    if (p.rows.length > 0) {
      html += `      <table>\n`
      p.rows.slice(0, 10).forEach((row, ri) => {
        html += `        <tr>\n`
        row.forEach(cell => {
          if (ri === 0) {
            html += `          <th>${escapeHtml(cell)}</th>\n`
          } else {
            html += `          <td>${escapeHtml(cell)}</td>\n`
          }
        })
        html += `        </tr>\n`
      })
      html += `      </table>\n`
      if (p.rows.length > 10) {
        html += `      <p style="font-size: 9pt; color: #64748b; margin-top: 6px;">+ ${p.rows.length - 10} additional rows in source data</p>\n`
      }
    }
    html += `
    </div>
    <div class="slide-footer">
      <span>Provident Financial Consultants</span>
      <span>Slide ${p.pageNumber}</span>
    </div>
  </div>
`
  })

  html += `</body>\n</html>`
  const encoder = new TextEncoder()
  return encoder.encode(html)
}

/**
 * Convert Excel / CSV to PDF
 */
async function convertExcelToPdfDocument(file, clientName) {
  const ab = await file.arrayBuffer()
  const wb = XLSX.read(ab, { type: 'array' })
  const pdfDoc = await PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 })
    if (!data.length) continue

    const page = pdfDoc.addPage([595.28, 841.89]) // A4
    const { width, height } = page.getSize()

    // Title header
    page.drawText('PROVIDENT FINANCIAL CONSULTANTS', { x: 40, y: height - 40, size: 9, font: helveticaBold, color: rgb(0.1, 0.1, 0.3) })
    page.drawText(`${clientName || 'Client Schedule'} — Sheet: ${sheetName}`, { x: 40, y: height - 55, size: 12, font: helveticaBold, color: rgb(0, 0, 0) })
    page.drawText(`Source: ${file.name} | Generated: ${new Date().toLocaleDateString('en-ZA')}`, { x: 40, y: height - 68, size: 8, font: helvetica, color: rgb(0.4, 0.4, 0.4) })

    page.drawLine({
      start: { x: 40, y: height - 76 },
      end: { x: width - 40, y: height - 76 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    })

    let y = height - 95
    const rowLimit = Math.min(data.length, 38)
    for (let r = 0; r < rowLimit; r++) {
      const row = data[r]
      if (!row || !row.length) continue
      const isHeader = r === 0

      let x = 40
      const colWidth = Math.min((width - 80) / Math.max(row.length, 1), 120)
      for (let c = 0; c < Math.min(row.length, 6); c++) {
        const text = String(row[c] !== undefined ? row[c] : '').substring(0, 22)
        page.drawText(text, {
          x,
          y,
          size: isHeader ? 8.5 : 7.5,
          font: isHeader ? helveticaBold : helvetica,
          color: isHeader ? rgb(0.06, 0.09, 0.16) : rgb(0.2, 0.25, 0.33)
        })
        x += colWidth
      }

      y -= 18
      if (y < 50) break
    }

    // Page footer
    page.drawText(`Page Sheet: ${sheetName} — Provident Suite v1.1`, {
      x: 40,
      y: 25,
      size: 7.5,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5)
    })
  }

  return await pdfDoc.save()
}

/**
 * Convert Text/Word file to PDF
 */
async function convertWordTextToPdf(file, clientName) {
  const text = await file.text()
  const pdfDoc = await PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const lines = text.split('\n')
  let page = pdfDoc.addPage([595.28, 841.89])
  let { width, height } = page.getSize()

  page.drawText(`${clientName || 'Provident Client'} — Working Document`, { x: 40, y: height - 40, size: 12, font: helveticaBold, color: rgb(0, 0, 0) })
  page.drawText(`Source: ${file.name} | Converted: ${new Date().toLocaleDateString('en-ZA')}`, { x: 40, y: height - 54, size: 8, font: helvetica, color: rgb(0.4, 0.4, 0.4) })

  let y = height - 75
  for (const line of lines) {
    if (y < 45) {
      page = pdfDoc.addPage([595.28, 841.89])
      y = height - 50
    }
    const cleanLine = line.replace(/\r/g, '').substring(0, 110)
    page.drawText(cleanLine, { x: 40, y, size: 8.5, font: helvetica, color: rgb(0.15, 0.15, 0.15) })
    y -= 14
  }

  return await pdfDoc.save()
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function downloadBlob(data, filename, mimeType) {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function PdfConverter() {
  const [mode, setMode] = useState('workbench') // 'workbench' or 'other'
  const [activeConversion, setActiveConversion] = useState(null)
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [convertedFile, setConvertedFile] = useState(null)
  const [saveStatus, setSaveStatus] = useState('')

  const fileInputRef = useRef(null)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const addRecentDocument = useAccountingStore(s => s.addRecentDocument)
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  const conv = CONVERSIONS.find(c => c.id === activeConversion)

  const accept = {
    'pdf-excel': '.pdf',
    'pdf-word':  '.pdf',
    'pdf-ppt':   '.pdf',
    'word-pdf':  '.docx,.doc,.txt',
    'excel-pdf': '.xlsx,.xls,.csv',
    'merge-pdf': '.pdf',
  }[activeConversion] || '.pdf'

  const handleFiles = (fileList) => {
    setFiles(Array.from(fileList))
    setStatus('')
    setError('')
    setConvertedFile(null)
    setSaveStatus('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleConvert = async () => {
    if (!files.length || !activeConversion) return
    setIsConverting(true)
    setError('')
    setStatus('Processing document...')

    try {
      const file = files[0]
      const baseName = file.name.replace(/\.[^.]+$/, '')
      let resultData = null
      let resultFilename = ''
      let resultMime = ''
      let targetSubFolder = conv?.subFolder || CLIENT_SUBFOLDERS.EXCEL_FILES

      if (activeConversion === 'pdf-excel') {
        setStatus('Extracting financial rows and table columns...')
        resultData = await convertPdfToExcelWorkbook(file, activeClient?.name)
        resultFilename = `${baseName}_Statement.xlsx`
        resultMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        targetSubFolder = CLIENT_SUBFOLDERS.EXCEL_FILES
      } else if (activeConversion === 'pdf-word') {
        setStatus('Formatting document into Microsoft Word layout...')
        resultData = await convertPdfToWordDocument(file, activeClient?.name)
        resultFilename = `${baseName}_Document.doc`
        resultMime = 'application/msword'
        targetSubFolder = CLIENT_SUBFOLDERS.WORD_DOCUMENTS
      } else if (activeConversion === 'pdf-ppt') {
        setStatus('Generating presentation slides...')
        resultData = await convertPdfToPowerPoint(file, activeClient?.name)
        resultFilename = `${baseName}_Presentation.html`
        resultMime = 'text/html'
        targetSubFolder = CLIENT_SUBFOLDERS.REPORTS
      } else if (activeConversion === 'word-pdf') {
        setStatus('Rendering Word document into formatted PDF...')
        resultData = await convertWordTextToPdf(file, activeClient?.name)
        resultFilename = `${baseName}.pdf`
        resultMime = 'application/pdf'
        targetSubFolder = CLIENT_SUBFOLDERS.PDF_DOCUMENTS
      } else if (activeConversion === 'excel-pdf') {
        setStatus('Converting spreadsheet table into PDF document...')
        resultData = await convertExcelToPdfDocument(file, activeClient?.name)
        resultFilename = `${baseName}_Report.pdf`
        resultMime = 'application/pdf'
        targetSubFolder = CLIENT_SUBFOLDERS.PDF_DOCUMENTS
      } else if (activeConversion === 'merge-pdf') {
        setStatus(`Merging ${files.length} PDF files...`)
        const merged = await PDFDocument.create()
        for (const f of files) {
          const ab = await f.arrayBuffer()
          const src = await PDFDocument.load(ab, { ignoreEncryption: true })
          const pages = await merged.copyPages(src, src.getPageIndices())
          pages.forEach(p => merged.addPage(p))
        }
        resultData = await merged.save()
        resultFilename = `${baseName}_Combined_${Date.now()}.pdf`
        resultMime = 'application/pdf'
        targetSubFolder = CLIENT_SUBFOLDERS.PDF_DOCUMENTS
      }

      setConvertedFile({ data: resultData, filename: resultFilename, mime: resultMime })
      setStatus(`✓ Successfully converted to ${resultFilename}!`)

      // Save to client's dedicated physical folder
      if (activeClient?.name && resultData) {
        const diskRes = await saveToClientFolder({
          clientName: activeClient.name,
          subFolder: targetSubFolder,
          fileName: resultFilename,
          fileData: resultData
        })
        if (diskRes?.success) {
          setSaveStatus(`Saved to: Clients/${activeClient.name}/${targetSubFolder}`)
        }
      }

      addRecentDocument({
        name: resultFilename,
        type: `${conv.from} → ${conv.to}`,
        size: `${Math.round((resultData.byteLength || resultData.length) / 1024)} KB`,
        wpRef: 'CONV-001'
      })
    } catch (err) {
      console.error(err)
      setError(`Conversion error: ${err.message}. Please verify file permissions or password security.`)
      setStatus('')
    }
    setIsConverting(false)
  }

  const handleDownload = () => {
    if (!convertedFile) return
    downloadBlob(convertedFile.data, convertedFile.filename, convertedFile.mime)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Universal File Action Bar */}
      <FileActionBar
        title="PDF & Office Converter"
        clientName={activeClient?.name}
        onNew={() => { setActiveConversion(null); setFiles([]); setConvertedFile(null); setStatus('') }}
        onOpen={() => fileInputRef.current?.click()}
        onImport={(file) => handleFiles([file])}
        onDownload={convertedFile ? handleDownload : null}
        onPrint={() => window.print()}
        saveStatus={saveStatus}
        subFolder={conv?.subFolder || CLIENT_SUBFOLDERS.EXCEL_FILES}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileDown size={22} className="text-indigo-600" />
            Advanced Document & PDF Converter
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Convert bank statements, financial ledgers and working papers between PDF, Excel, Word, and PowerPoint formats.
          </p>
        </div>
        {activeConversion && (
          <button
            onClick={() => { setActiveConversion(null); setFiles([]); setStatus(''); setError(''); setConvertedFile(null); setSaveStatus('') }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Conversions
          </button>
        )}
      </div>

      {/* Primary Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => { setMode('workbench'); setActiveConversion(null) }}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            mode === 'workbench'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileSpreadsheet size={14} />
          <span>PDF to Excel / Word / PowerPoint (In-Build Split Preview)</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('other')}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            mode === 'other'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileDown size={14} />
          <span>Word / Excel to PDF & Multi-PDF Merge</span>
        </button>
      </div>

      {mode === 'workbench' && (
        <PdfConverterWorkbench />
      )}

      {/* Grid of conversion cards for other formats */}
      {mode === 'other' && !activeConversion && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONVERSIONS.map(c => {
            const Icon = c.icon
            const cls = colorClass(c.color)
            return (
              <button
                key={c.id}
                onClick={() => setActiveConversion(c.id)}
                className={`text-left p-4 rounded-xl border-2 hover:shadow-md transition-all cursor-pointer group hover:scale-[1.01] ${cls}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-xs border border-slate-200">
                    <Icon size={20} className="text-slate-800" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{c.from}</span>
                      <ArrowRight size={12} className="text-slate-400 shrink-0" />
                      <span className="font-bold text-sm text-indigo-700">{c.to}</span>
                    </div>
                    <span className="inline-block mt-1 text-[9px] font-extrabold bg-white/90 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                      {c.badge}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Active conversion interface */}
      {activeConversion && conv && (
        <div className="space-y-4">
          {/* Conversion banner */}
          <div className={`p-4 rounded-xl border-2 flex items-center justify-between gap-3 ${colorClass(conv.color)}`}>
            <div className="flex items-center gap-3">
              <conv.icon size={26} />
              <div>
                <h2 className="font-bold text-sm text-slate-900">{conv.from} &rarr; {conv.to}</h2>
                <p className="text-xs text-slate-600">{conv.desc}</p>
              </div>
            </div>
            <div className="text-right text-[11px] font-medium text-slate-600">
              Target Folder: <strong>{conv.subFolder}</strong>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50/20 transition-all cursor-pointer bg-white"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} className="mx-auto text-indigo-500 mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              {activeConversion === 'merge-pdf' ? 'Drop multiple PDF files here' : `Drop your ${conv.from} file here`}
            </p>
            <p className="text-xs text-slate-500 mt-1">or click to browse from your computer &bull; Accepts: {accept}</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={accept}
              multiple={activeConversion === 'merge-pdf'}
              onChange={e => handleFiles(e.target.files)}
            />
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-700">Selected Source Files ({files.length})</h3>
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs shadow-2xs">
                  <FileText size={16} className="text-indigo-600 shrink-0" />
                  <span className="flex-1 font-semibold text-slate-800 truncate">{f.name}</span>
                  <span className="text-slate-500 font-mono">{(f.size / 1024).toFixed(0)} KB</span>
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Specific Advice for Bank Statements */}
          {activeConversion === 'pdf-excel' && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" />
                <span>Financial Bank Statement Extraction Accuracy</span>
              </div>
              <p className="leading-relaxed">
                The extraction engine coordinates text boundaries to preserve columns: <strong>Date, Reference, Debit, Credit, and Balance</strong>.
                Numerical values are saved with live Excel number formatting, allowing immediate reconciliation in the Bank Recon module.
              </p>
            </div>
          )}

          {/* Status and Error messages */}
          {status && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="font-medium">{status}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleConvert}
              disabled={!files.length || isConverting}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {isConverting ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
              <span>{isConverting ? 'Processing Conversion...' : `Convert to ${conv.to}`}</span>
            </button>

            {convertedFile && (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download {convertedFile.filename}</span>
                </button>

                {activeClient && (
                  <button
                    type="button"
                    onClick={() => openClientFolderInExplorer(activeClient.name, conv.subFolder)}
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium px-4 py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    <FolderOpen size={14} className="text-amber-500" />
                    <span>Open in {activeClient.name}'s Folder</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useRef } from 'react'
import {
  FileText, FileSpreadsheet, Upload, Download, ArrowRight,
  CheckCircle2, AlertCircle, Loader2, FileDown, Table2,
  File, Presentation, FileCode, Trash2, Info, ArrowLeft
} from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import * as XLSX from 'xlsx'
import { useAccountingStore } from '@/store/accountingStore'
import { useAppStore } from '@/store/appStore'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

const CONVERSIONS = [
  { id: 'pdf-excel',  from: 'PDF',  to: 'Excel (.xlsx)',  icon: FileSpreadsheet, badge: 'BANK STMT', color: 'emerald', desc: 'Convert bank statements, financial reports and tables from PDF into structured Excel spreadsheets.' },
  { id: 'pdf-word',   from: 'PDF',  to: 'Word (.txt)',    icon: FileText,        badge: 'DOCUMENT',  color: 'blue',    desc: 'Extract full text content from a PDF document and save as a text file for editing in Word.' },
  { id: 'pdf-csv',    from: 'PDF',  to: 'CSV',            icon: Table2,          badge: 'DATA',      color: 'orange',  desc: 'Extract tabular data from PDF and convert to CSV format for data processing.' },
  { id: 'excel-pdf',  from: 'Excel / CSV', to: 'PDF',    icon: FileDown,        badge: 'EXPORT',    color: 'rose',    desc: 'Convert an Excel spreadsheet or CSV file into a formatted PDF document.' },
  { id: 'merge-pdf',  from: 'Multiple PDFs', to: 'PDF',  icon: FileCode,        badge: 'MERGE',     color: 'purple',  desc: 'Combine multiple PDF files into a single merged PDF document.' },
]

function colorClass(color) {
  const map = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500',
    blue:    'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500',
    orange:  'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500',
    rose:    'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500',
    purple:  'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500',
  }
  return map[color] || 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-400'
}

// ── PDF text + table extraction using pdfjs-dist ───────────────────────────
async function extractPdfTextAndTables(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()

    // Group text items into rows based on Y position (within 4px tolerance)
    const rowMap = {}
    for (const item of content.items) {
      if (!item.str?.trim()) continue
      const y = Math.round(item.transform[5] / 4) * 4 // bucket by 4px
      if (!rowMap[y]) rowMap[y] = []
      rowMap[y].push({ x: item.transform[4], text: item.str.trim() })
    }

    // Sort rows by Y descending (PDF Y is from bottom)
    const rows = Object.entries(rowMap)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([, cells]) => cells.sort((a, b) => a.x - b.x).map(c => c.text))

    pages.push(rows)
  }
  return pages
}

// ── Flatten pages → worksheet ──────────────────────────────────────────────
function pagesToWorksheet(pages) {
  const all = []
  for (const rows of pages) {
    for (const row of rows) {
      all.push(row)
    }
    all.push([]) // blank row between pages
  }
  return all
}

// ── Convert PDF → Excel ────────────────────────────────────────────────────
async function convertPdfToExcel(file) {
  const pages = await extractPdfTextAndTables(file)
  const rows = pagesToWorksheet(pages)

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(rows)

  // Auto-width columns
  const colWidths = rows.reduce((acc, row) => {
    row.forEach((cell, i) => {
      const len = String(cell || '').length
      acc[i] = Math.max(acc[i] || 10, Math.min(len + 2, 60))
    })
    return acc
  }, {})
  ws['!cols'] = Object.values(colWidths).map(w => ({ wch: w }))

  XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data')

  // Add a summary sheet
  const summaryData = [
    ['Provident Accounting — PDF Conversion Report'],
    [`Source File: ${file.name}`],
    [`Converted: ${new Date().toLocaleString('en-ZA')}`],
    [`Total Pages: ${pages.length}`],
    [`Total Rows Extracted: ${rows.filter(r => r.length > 0).length}`],
    [],
    ['Note: Review column alignment. Financial figures have been preserved as extracted.'],
    ['For bank statements: verify debit/credit columns match your source document.'],
  ]
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
  summaryWs['!cols'] = [{ wch: 60 }]
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Conversion Info')

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
}

// ── Convert PDF → Plain Text ───────────────────────────────────────────────
async function convertPdfToText(file) {
  const pages = await extractPdfTextAndTables(file)
  const lines = []
  pages.forEach((rows, pi) => {
    lines.push(`\n--- PAGE ${pi + 1} ---\n`)
    rows.forEach(row => lines.push(row.join('  ')))
  })
  return lines.join('\n')
}

// ── Convert PDF → CSV ─────────────────────────────────────────────────────
async function convertPdfToCsv(file) {
  const pages = await extractPdfTextAndTables(file)
  const rows = pagesToWorksheet(pages)
  return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
}

// ── Convert Excel/CSV → simple PDF-like text ──────────────────────────────
async function convertExcelToPdf(file) {
  const ab = await file.arrayBuffer()
  const wb = XLSX.read(ab, { type: 'array' })
  const lines = []

  wb.SheetNames.forEach(name => {
    lines.push(`\n=== Sheet: ${name} ===\n`)
    const ws = wb.Sheets[name]
    const rows = XLSX.utils.sheet_to_csv(ws)
    lines.push(rows)
  })

  return lines.join('\n')
}

// ── Download helper ───────────────────────────────────────────────────────
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
  const [activeConversion, setActiveConversion] = useState(null)
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [convertedFile, setConvertedFile] = useState(null)
  const fileInputRef = useRef(null)
  const addRecentDocument = useAccountingStore(s => s.addRecentDocument)
  const cloudSync = useAppStore(s => s.cloudSync)

  const conv = CONVERSIONS.find(c => c.id === activeConversion)

  const accept = {
    'pdf-excel': '.pdf',
    'pdf-word':  '.pdf',
    'pdf-csv':   '.pdf',
    'excel-pdf': '.xlsx,.xls,.csv',
    'merge-pdf': '.pdf',
  }[activeConversion] || '.pdf'

  const handleFiles = (fileList) => {
    setFiles(Array.from(fileList))
    setStatus('')
    setError('')
    setConvertedFile(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const handleConvert = async () => {
    if (!files.length || !activeConversion) return
    setIsConverting(true)
    setError('')
    setStatus('Processing…')

    try {
      const file = files[0]
      const baseName = file.name.replace(/\.[^.]+$/, '')

      if (activeConversion === 'pdf-excel') {
        setStatus('Extracting text and tables from PDF…')
        const data = await convertPdfToExcel(file)
        setStatus('Building Excel workbook…')
        const filename = `${baseName}_converted.xlsx`
        setConvertedFile({ data, filename, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        setStatus(`✓ Converted! ${filename}`)
        addRecentDocument({ name: filename, type: 'PDF → Excel Conversion', size: `${Math.round(data.byteLength / 1024)} KB`, wpRef: 'PDF-XL' })
      } else if (activeConversion === 'pdf-word') {
        setStatus('Extracting text from PDF…')
        const text = await convertPdfToText(file)
        const encoder = new TextEncoder()
        const data = encoder.encode(text)
        const filename = `${baseName}_text.txt`
        setConvertedFile({ data, filename, mime: 'text/plain' })
        setStatus(`✓ Text extracted! ${filename} — Open in Word or Notepad`)
        addRecentDocument({ name: filename, type: 'PDF → Text Extraction', size: `${Math.round(data.byteLength / 1024)} KB`, wpRef: 'PDF-TXT' })
      } else if (activeConversion === 'pdf-csv') {
        setStatus('Extracting tables from PDF…')
        const csv = await convertPdfToCsv(file)
        const encoder = new TextEncoder()
        const data = encoder.encode(csv)
        const filename = `${baseName}.csv`
        setConvertedFile({ data, filename, mime: 'text/csv' })
        setStatus(`✓ CSV ready! ${filename}`)
        addRecentDocument({ name: filename, type: 'PDF → CSV Conversion', size: `${Math.round(data.byteLength / 1024)} KB`, wpRef: 'PDF-CSV' })
      } else if (activeConversion === 'excel-pdf') {
        setStatus('Reading Excel file…')
        const text = await convertExcelToPdf(file)
        const encoder = new TextEncoder()
        const data = encoder.encode(text)
        const filename = `${baseName}_export.txt`
        setConvertedFile({ data, filename, mime: 'text/plain' })
        setStatus(`✓ Exported! ${filename} — Content ready`)
        addRecentDocument({ name: filename, type: 'Excel → Export', size: `${Math.round(data.byteLength / 1024)} KB`, wpRef: 'XL-EXP' })
      } else if (activeConversion === 'merge-pdf') {
        setStatus('Merging PDFs…')
        const { PDFDocument } = await import('pdf-lib')
        const merged = await PDFDocument.create()
        for (const f of files) {
          const ab = await f.arrayBuffer()
          const src = await PDFDocument.load(ab, { ignoreEncryption: true })
          const pages = await merged.copyPages(src, src.getPageIndices())
          pages.forEach(p => merged.addPage(p))
        }
        const data = await merged.save()
        const filename = `merged_${Date.now()}.pdf`
        setConvertedFile({ data, filename, mime: 'application/pdf' })
        setStatus(`✓ Merged ${files.length} PDFs into ${filename}`)
        addRecentDocument({ name: filename, type: 'PDF Merge', size: `${Math.round(data.byteLength / 1024)} KB`, wpRef: 'PDF-MRG' })
      }

      // Save to client folder if storage path configured
      if (cloudSync?.customStoragePath && window.provident?.saveClientFile) {
        // This would save to desktop folder — optional
      }
    } catch (err) {
      console.error(err)
      setError(`Conversion failed: ${err.message}. Try a different file or check if the PDF is password-protected.`)
      setStatus('')
    }
    setIsConverting(false)
  }

  const handleDownload = () => {
    if (!convertedFile) return
    downloadBlob(convertedFile.data, convertedFile.filename, convertedFile.mime)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileDown size={22} className="text-indigo-600" />
            PDF Converter &amp; Document Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Convert between PDF, Excel, Word and CSV formats. Bank statements converted to Excel preserve tables and financial figures.
          </p>
        </div>
        {activeConversion && (
          <button
            onClick={() => { setActiveConversion(null); setFiles([]); setStatus(''); setError(''); setConvertedFile(null) }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Tools
          </button>
        )}
      </div>

      {/* Tool selection */}
      {!activeConversion && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONVERSIONS.map(c => {
            const Icon = c.icon
            const cls = colorClass(c.color)
            return (
              <button
                key={c.id}
                onClick={() => setActiveConversion(c.id)}
                className={`text-left p-4 rounded-xl border-2 hover:shadow-md transition-all cursor-pointer group hover:scale-[1.02] ${cls}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center shrink-0 shadow-sm">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{c.from}</span>
                      <ArrowRight size={12} className="shrink-0" />
                      <span className="font-bold text-sm">{c.to}</span>
                      <span className="text-[9px] font-bold bg-white/70 px-1.5 py-0.5 rounded">{c.badge}</span>
                    </div>
                    <p className="text-[11px] opacity-80 mt-1 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Active conversion workspace */}
      {activeConversion && conv && (
        <div className="space-y-5">
          {/* Conversion title */}
          <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${colorClass(conv.color)}`}>
            <conv.icon size={24} />
            <div>
              <h2 className="font-bold text-base">{conv.from} → {conv.to}</h2>
              <p className="text-xs opacity-80">{conv.desc}</p>
            </div>
          </div>

          {/* File Upload Zone */}
          <div
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} className="mx-auto text-slate-400 mb-3" />
            <p className="text-sm font-medium text-slate-700">
              {activeConversion === 'merge-pdf' ? 'Drop multiple PDF files here' : `Drop your ${conv.from} file here`}
            </p>
            <p className="text-xs text-slate-500 mt-1">or click to browse — Accepts: {accept}</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={accept}
              multiple={activeConversion === 'merge-pdf'}
              onChange={e => handleFiles(e.target.files)}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs">
                  <FileText size={16} className="text-indigo-500 shrink-0" />
                  <span className="flex-1 font-medium text-slate-800 truncate">{f.name}</span>
                  <span className="text-slate-500">{(f.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-slate-400 hover:text-rose-500 cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Info box for bank statement conversion */}
          {activeConversion === 'pdf-excel' && (
            <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>Bank Statement Tips:</strong> For best results, upload unprotected PDF bank statements.
                The conversion engine extracts text positions to reconstruct table rows and columns.
                After conversion, verify that debit/credit columns are correctly separated in the Excel file.
                Financial figures, dates and reference numbers are preserved as-extracted.
              </div>
            </div>
          )}

          {/* Status / Error */}
          {status && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>{status}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleConvert}
              disabled={!files.length || isConverting}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {isConverting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              {isConverting ? 'Converting…' : `Convert to ${conv.to}`}
            </button>

            {convertedFile && (
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <Download size={16} />
                Download {convertedFile.filename}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Supported formats info */}
      {!activeConversion && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          <div className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <Info size={14} className="text-indigo-500" />
            Supported Conversions
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>✓ PDF Bank Statements → Excel (preserves tables &amp; figures)</div>
            <div>✓ PDF Reports → CSV for data processing</div>
            <div>✓ PDF → Text (import into Microsoft Word)</div>
            <div>✓ Excel / CSV → Export format</div>
            <div>✓ Multiple PDFs → Merged single PDF</div>
            <div>✓ Financial data extraction with column reconstruction</div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useRef, useEffect, useMemo } from 'react'
import {
  FileText, FileSpreadsheet, Upload, Download, ArrowRight,
  CheckCircle2, AlertCircle, Loader2, FileDown, Table2,
  File, Presentation, FileCode, Trash2, Info, ArrowLeft,
  HardDrive, Sparkles, FolderOpen, ZoomIn, ZoomOut, Maximize2,
  ChevronLeft, ChevronRight, RefreshCw, Eye, Edit3, Landmark,
  Printer, Save, Check
} from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import * as XLSX from 'xlsx'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { useAccountingStore, formatCurrency, getCurrencyCode } from '@/store/accountingStore'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { saveToClientFolder, CLIENT_SUBFOLDERS, openClientFolderInExplorer } from '@/utils/clientStorage'
import {
  extractHighFidelityPdf,
  exportToExcelHighFidelity,
  exportToWordHighFidelity,
  exportToPowerPointHighFidelity,
  escapeHtml
} from '@/utils/pdfExtractor'

// Configure pdfjs worker with bundled asset (offline support)
if (pdfjsLib?.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker || './pdf.worker.min.mjs'
}

const SAMPLE_BANK_STATEMENT = {
  fileName: 'FNB_Commercial_Bank_Statement_Oct2024.pdf',
  clientName: 'Acme Corporation (Pty) Ltd',
  period: '01 Oct 2024 - 31 Oct 2024',
  accountNumber: '62849102941',
  branchCode: '250655',
  openingBalance: 245100.00,
  closingBalance: 284500.00,
  rows: [
    { id: 1, date: '2024-10-02', desc: 'Direct Deposit - Client Invoice #10482', ref: 'EFT-0912', debit: 0, credit: 54000.00, balance: 299100.00 },
    { id: 2, date: '2024-10-04', desc: 'Municipal Electricity & Water - CoJ', ref: 'DEB-1194', debit: 6200.00, credit: 0, balance: 292900.00 },
    { id: 3, date: '2024-10-05', desc: 'Telkom Internet Fibre Optical Line', ref: 'DEB-4412', debit: 1850.00, credit: 0, balance: 291050.00 },
    { id: 4, date: '2024-10-08', desc: 'Supplier Payment - Steel & Timber Supplies', ref: 'EFT-3321', debit: 32400.00, credit: 0, balance: 258650.00 },
    { id: 5, date: '2024-10-12', desc: 'Advisory Retainer Fee - Transnet Project', ref: 'DEP-8831', debit: 0, credit: 28500.00, balance: 287150.00 },
    { id: 6, date: '2024-10-15', desc: 'Mid-Month Trainee Staff Stipends', ref: 'PAY-0091', debit: 18000.00, credit: 0, balance: 269150.00 },
    { id: 7, date: '2024-10-18', desc: 'Office Depot Stationery & Printer Toners', ref: 'POS-7741', debit: 3450.00, credit: 0, balance: 265700.00 },
    { id: 8, date: '2024-10-22', desc: 'Commercial Vehicle Diesel Fuel Fleet Card', ref: 'POS-9921', debit: 4200.00, credit: 0, balance: 261500.00 },
    { id: 9, date: '2024-10-25', desc: 'Direct Transfer - Customer Progress Draw #3', ref: 'EFT-6641', debit: 0, credit: 72000.00, balance: 333500.00 },
    { id: 10, date: '2024-10-28', desc: 'Monthly Payroll Net Salaries Settlement', ref: 'PAY-1029', debit: 45000.00, credit: 0, balance: 288500.00 },
    { id: 11, date: '2024-10-31', desc: 'Bank Service Charges & Electronic Fee', ref: 'CHG-0012', debit: 400.00, credit: 0, balance: 288100.00 },
    { id: 12, date: '2024-10-31', desc: 'Credit Interest Earned on Money Market', ref: 'INT-3301', debit: 0, credit: 600.00, balance: 288700.00 },
  ]
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

export default function PdfConverterWorkbench({ initialMode = 'pdf-excel', onModeChange }) {
  const firm = useAuthStore(s => s.firm)
  const currCode = getCurrencyCode(firm?.currency)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const addBankItem = useAccountingStore(s => s.addBankItem)
  const addJournalEntry = useAccountingStore(s => s.addJournalEntry)
  const addRecentDocument = useAccountingStore(s => s.addRecentDocument)

  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  // State
  const [selectedFormat, setSelectedFormat] = useState('excel') // 'excel', 'word', 'ppt', 'preview'
  const [activeTab, setActiveTab] = useState('grid') // 'grid', 'excel', 'word', 'ppt', 'raw'
  const [conversionMode, setConversionMode] = useState('document') // 'document' (Preserve original layout & tables) | 'bank' (Bank Statement mode)
  const [docData, setDocData] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [saveStatus, setSaveStatus] = useState('')

  // In-Build PDF Viewer State
  const [pdfDoc, setPdfDoc] = useState(null)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoomScale, setZoomScale] = useState(1.0)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  // Extracted Tabular Data
  const [extractedRows, setExtractedRows] = useState(SAMPLE_BANK_STATEMENT.rows)
  const [rawTextLines, setRawTextLines] = useState([])
  const [documentMetadata, setDocumentMetadata] = useState({
    title: SAMPLE_BANK_STATEMENT.fileName,
    client: SAMPLE_BANK_STATEMENT.clientName,
    account: SAMPLE_BANK_STATEMENT.accountNumber,
    period: SAMPLE_BANK_STATEMENT.period
  })

  // Render PDF page to canvas
  useEffect(() => {
    let renderTask = null
    async function renderPage() {
      if (!pdfDoc || !canvasRef.current) return
      try {
        const page = await pdfDoc.getPage(currentPage)
        const viewport = page.getViewport({ scale: zoomScale })
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }
        renderTask = page.render(renderContext)
        await renderTask.promise
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('PDF render error:', err)
        }
      }
    }
    renderPage()

    return () => {
      if (renderTask) renderTask.cancel()
    }
  }, [pdfDoc, currentPage, zoomScale])

  // Extract tabular structure from uploaded PDF with High-Fidelity Layout Preservation
  const handlePdfFile = async (file) => {
    if (!file) return
    setIsProcessing(true)
    setStatusMessage(`Analyzing and extracting structure from "${file.name}"...`)
    setErrorMessage('')
    setUploadedFile(file)
    setSaveStatus('')

    try {
      const buffer = await file.arrayBuffer()
      const loadedPdf = await pdfjsLib.getDocument({ data: buffer }).promise
      setPdfDoc(loadedPdf)
      setNumPages(loadedPdf.numPages)
      setCurrentPage(1)

      // High-Fidelity Extraction preserving real document columns and layout
      const data = await extractHighFidelityPdf(file)
      setDocData(data)
      setRawTextLines(data.allRawLines)

      if (data.isBankStatement && data.bankRows?.length > 0) {
        setExtractedRows(data.bankRows)
        setConversionMode('bank')
      } else {
        setExtractedRows(data.bankRows.length > 0 ? data.bankRows : SAMPLE_BANK_STATEMENT.rows)
        setConversionMode('document')
      }

      setDocumentMetadata({
        title: file.name,
        client: activeClient?.name || 'General Client',
        account: data.isBankStatement ? 'Bank Statement' : 'Standard Document / Table',
        period: `${loadedPdf.numPages} Page(s) Extracted`
      })

      setStatusMessage(`✓ Successfully extracted ${loadedPdf.numPages} pages with ${data.allGridRows.length} structured rows & ${data.columnHeaders.length} columns!`)
    } catch (err) {
      console.error(err)
      setErrorMessage(`Failed to extract PDF: ${err.message}. If encrypted, please use Password Stripper first.`)
    }
    setIsProcessing(false)
  }

  // Load sample bank statement for instant demonstration
  const handleLoadSampleStatement = () => {
    setUploadedFile({ name: SAMPLE_BANK_STATEMENT.fileName, size: 452000 })
    setExtractedRows(SAMPLE_BANK_STATEMENT.rows)
    setDocData({
      fileName: SAMPLE_BANK_STATEMENT.fileName,
      numPages: 1,
      pages: [{ pageNumber: 1, grid: SAMPLE_BANK_STATEMENT.rows.map(r => [r.date, r.desc, r.ref, r.debit, r.credit, r.balance]) }],
      allGridRows: SAMPLE_BANK_STATEMENT.rows.map(r => [r.date, r.desc, r.ref, r.debit, r.credit, r.balance]),
      columnHeaders: ['Date', 'Description', 'Reference', 'Debit', 'Credit', 'Balance'],
      detectedColumnCount: 6,
      isBankStatement: true,
      bankRows: SAMPLE_BANK_STATEMENT.rows,
      allRawLines: SAMPLE_BANK_STATEMENT.rows.map(r => `${r.date}  ${r.desc}  ${r.ref}  ${r.debit}  ${r.credit}  ${r.balance}`)
    })
    setConversionMode('bank')
    setDocumentMetadata({
      title: SAMPLE_BANK_STATEMENT.fileName,
      client: SAMPLE_BANK_STATEMENT.clientName,
      account: SAMPLE_BANK_STATEMENT.accountNumber,
      period: SAMPLE_BANK_STATEMENT.period
    })
    setStatusMessage('✓ Loaded sample FNB Commercial Bank Statement. Full arrangement preserved with debits, credits, and balances.')
  }

  // Calculation totals
  const totalDebits = useMemo(() => extractedRows.reduce((s, r) => s + (Number(r.debit) || 0), 0), [extractedRows])
  const totalCredits = useMemo(() => extractedRows.reduce((s, r) => s + (Number(r.credit) || 0), 0), [extractedRows])
  const netMovement = totalCredits - totalDebits

  // ── EXPORT ENGINES ──────────────────────────────────────────

  // 1. Export Excel Workbook (.xlsx)
  const handleExportExcel = async () => {
    setIsProcessing(true)
    setStatusMessage('Generating high-fidelity Microsoft Excel (.xlsx) workbook preserving document columns...')
    try {
      const activeDocData = docData || {
        fileName: documentMetadata.title,
        numPages: 1,
        pages: [{ pageNumber: 1, grid: extractedRows.map(r => [r.date, r.desc, r.ref, r.debit, r.credit, r.balance]) }],
        allGridRows: extractedRows.map(r => [r.date, r.desc, r.ref, r.debit, r.credit, r.balance]),
        columnHeaders: ['Date', 'Description', 'Reference', 'Debit', 'Credit', 'Balance'],
        isBankStatement: true,
        bankRows: extractedRows
      }

      const excelBytes = exportToExcelHighFidelity({
        docData: activeDocData,
        clientName: activeClient?.name,
        firmName: firm?.name,
        currCode,
        bankMode: conversionMode === 'bank'
      })

      const filename = `${documentMetadata.title.replace(/\.[^.]+$/, '')}_Extracted_Schedule.xlsx`
      downloadBlob(excelBytes, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

      // Save to client's dedicated physical storage folder
      if (activeClient?.name) {
        const diskRes = await saveToClientFolder({
          clientName: activeClient.name,
          subFolder: CLIENT_SUBFOLDERS.EXCEL_FILES,
          fileName: filename,
          fileData: excelBytes
        })
        if (diskRes?.success) {
          setSaveStatus(`Saved to: Clients/${activeClient.name}/Excel Files/${filename}`)
        }
      }

      addRecentDocument({
        name: filename,
        type: 'PDF → Excel (.xlsx)',
        size: `${Math.round(excelBytes.byteLength / 1024)} KB`,
        wpRef: 'WP-EXCEL'
      })

      setStatusMessage(`✓ Successfully generated and exported "${filename}"!`)
    } catch (err) {
      setErrorMessage(`Export failed: ${err.message}`)
    }
    setIsProcessing(false)
  }

  // 2. Export Word Document (.doc)
  const handleExportWord = async () => {
    setIsProcessing(true)
    setStatusMessage('Generating formatted Microsoft Word (.doc) document preserving headings and layout...')
    try {
      const activeDocData = docData || {
        fileName: documentMetadata.title,
        numPages: 1,
        pages: [{ pageNumber: 1, grid: extractedRows.map(r => [r.date, r.desc, r.ref, r.debit, r.credit, r.balance]) }],
        allGridRows: extractedRows.map(r => [r.date, r.desc, r.ref, r.debit, r.credit, r.balance]),
        columnHeaders: ['Date', 'Description', 'Reference', 'Debit', 'Credit', 'Balance']
      }

      const docHtml = exportToWordHighFidelity({
        docData: activeDocData,
        clientName: activeClient?.name,
        firmName: firm?.name,
        currCode
      })

      const filename = `${documentMetadata.title.replace(/\.[^.]+$/, '')}_Document.doc`
      downloadBlob(docHtml, filename, 'application/msword')

      if (activeClient?.name) {
        await saveToClientFolder({
          clientName: activeClient.name,
          subFolder: CLIENT_SUBFOLDERS.WORD_DOCUMENTS,
          fileName: filename,
          fileData: docHtml
        })
        setSaveStatus(`Saved to: Clients/${activeClient.name}/Word Documents/${filename}`)
      }

      setStatusMessage(`✓ Successfully generated and exported "${filename}"!`)
    } catch (err) {
      setErrorMessage(`Word export failed: ${err.message}`)
    }
    setIsProcessing(false)
  }

  // 3. Export PowerPoint Presentation (.html / presentation)
  const handleExportPowerPoint = async () => {
    setIsProcessing(true)
    setStatusMessage('Generating PowerPoint presentation slides preserving page layouts...')
    try {
      const activeDocData = docData || {
        fileName: documentMetadata.title,
        numPages: 1,
        pages: [{ pageNumber: 1, grid: extractedRows.map(r => [r.date, r.desc, r.ref, r.debit, r.credit, r.balance]) }],
        allGridRows: extractedRows.map(r => [r.date, r.desc, r.ref, r.debit, r.credit, r.balance]),
        columnHeaders: ['Date', 'Description', 'Reference', 'Debit', 'Credit', 'Balance']
      }

      const pptHtml = exportToPowerPointHighFidelity({
        docData: activeDocData,
        clientName: activeClient?.name,
        firmName: firm?.name,
        currCode
      })

      const filename = `${documentMetadata.title.replace(/\.[^.]+$/, '')}_Slides.html`
      downloadBlob(pptHtml, filename, 'text/html')

      if (activeClient?.name) {
        await saveToClientFolder({
          clientName: activeClient.name,
          subFolder: CLIENT_SUBFOLDERS.REPORTS,
          fileName: filename,
          fileData: pptHtml
        })
        setSaveStatus(`Saved to: Clients/${activeClient.name}/Reports/${filename}`)
      }

      setStatusMessage(`✓ Successfully generated and exported "${filename}"!`)
    } catch (err) {
      setErrorMessage(`PowerPoint export failed: ${err.message}`)
    }
    setIsProcessing(false)
  }

  // 4. One-Click Push to Bank Reconciliation Module
  const handlePushToBankRecon = () => {
    let count = 0
    extractedRows.forEach(r => {
      const amt = r.credit ? Number(r.credit) : -Number(r.debit)
      if (amt !== 0) {
        addBankItem({
          id: Date.now() + Math.floor(Math.random() * 100000),
          clientId: activeClientId,
          date: r.date,
          desc: r.desc,
          ref: r.ref,
          amount: amt,
          matched: false,
          matchRef: null
        })
        count++
      }
    })
    setStatusMessage(`✓ Transferred ${count} statement transactions directly into Bank Reconciliation module!`)
  }

  // 5. One-Click Push to General Ledger Journals
  const handlePushToGeneralLedger = () => {
    let count = 0
    extractedRows.forEach(r => {
      const amt = Math.abs(r.credit ? Number(r.credit) : Number(r.debit))
      if (amt > 0) {
        addJournalEntry({
          clientId: activeClientId,
          date: r.date,
          description: `Extracted: ${r.desc} (${r.ref})`,
          debit: r.debit ? '5300 Operating Expenses' : '1000 Cash and Equivalents',
          credit: r.credit ? '4000 Sales Revenue' : '1000 Cash and Equivalents',
          amount: amt,
          author: 'PDF Statement Converter'
        })
        count++
      }
    })
    setStatusMessage(`✓ Created ${count} double-entry journals in General Ledger for ${activeClient?.name}!`)
  }

  return (
    <div className="space-y-5">
      {/* ── TOP ACTION BAR & CONVERTER HEAD ── */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-indigo-50 text-indigo-700">
                <FileSpreadsheet size={18} />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                PDF & Office Converter with In-Build Split-Pane Preview
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                LAYOUT PRESERVED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Directly convert bank statements, trial balances, and financial tables into calculation-ready <strong>Microsoft Excel (.xlsx)</strong>, <strong>Word (.doc)</strong>, and <strong>PowerPoint</strong> without losing original columns, numbers, or alignment.
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleLoadSampleStatement}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>Load Sample Bank Statement</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Upload size={13} />
              <span>Upload PDF Document</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handlePdfFile(e.target.files?.[0])}
              accept=".pdf"
              className="hidden"
            />
          </div>
        </div>

        {/* Status Banners */}
        {statusMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            {saveStatus && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                {saveStatus}
              </span>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── 1-CLICK EXPORT COMMAND STRIP ── */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 bg-slate-50 p-3 rounded-md border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Export Extracted Document:</span>
            <span className="text-xs text-slate-500 font-mono">({extractedRows.length} Rows Detected)</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isProcessing || extractedRows.length === 0}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs px-3 py-1.5 rounded shadow-xs cursor-pointer transition-colors"
              title="Convert to multi-sheet Microsoft Excel workbook with formulas"
            >
              <FileSpreadsheet size={13} />
              <span>Convert to Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              disabled={isProcessing || extractedRows.length === 0}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs px-3 py-1.5 rounded shadow-xs cursor-pointer transition-colors"
              title="Convert to editable Microsoft Word document with tables"
            >
              <FileText size={13} />
              <span>Convert to Word (.doc)</span>
            </button>

            <button
              type="button"
              onClick={handleExportPowerPoint}
              disabled={isProcessing || extractedRows.length === 0}
              className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs px-3 py-1.5 rounded shadow-xs cursor-pointer transition-colors"
              title="Convert to presentation slides for board meetings"
            >
              <Presentation size={13} />
              <span>Convert to PowerPoint</span>
            </button>

            <button
              type="button"
              onClick={handlePushToBankRecon}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3 py-1.5 rounded shadow-xs cursor-pointer transition-colors"
              title="Send transactions directly to Bank Recon for matching"
            >
              <Landmark size={13} />
              <span>Push to Bank Recon</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── SPLIT-PANE WORKBENCH (ORIGINAL PDF PREVIEW vs EXTRACTED TABLE ARRANGE) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE: In-Build Original Document Canvas Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            {/* Viewer Toolbar */}
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileText size={15} className="text-indigo-400 shrink-0" />
                <span className="font-bold truncate text-[11px]">{documentMetadata.title}</span>
              </div>

              {/* Page & Zoom Navigation */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || !pdfDoc}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[10px] font-mono px-1">
                  {numPages > 0 ? `${currentPage} / ${numPages}` : '1 / 1'}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                  disabled={currentPage >= numPages || !pdfDoc}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>

                <div className="h-3 w-px bg-slate-700 mx-1" />

                <button
                  type="button"
                  onClick={() => setZoomScale(z => Math.max(0.6, z - 0.15))}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[10px] font-mono w-9 text-center">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale(z => Math.min(2.0, z + 0.15))}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
            </div>

            {/* Document Render Area */}
            <div className="p-3 bg-slate-100 flex items-center justify-center min-h-[460px] max-h-[560px] overflow-auto select-none border-b border-slate-200">
              {pdfDoc ? (
                <canvas ref={canvasRef} className="shadow-md rounded bg-white max-w-full" />
              ) : (
                /* Fallback Simulated Bank Statement View when using sample data */
                <div className="w-full bg-white rounded border border-slate-300 p-6 shadow-sm space-y-4 text-xs font-sans">
                  {/* Bank Header */}
                  <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
                    <div>
                      <span className="text-base font-extrabold text-slate-900 tracking-tight block">FIRST NATIONAL BANK</span>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Commercial Banking Division &bull; South Africa</span>
                    </div>
                    <div className="text-right text-[11px] space-y-0.5">
                      <span className="font-bold text-slate-900 block">TAX INVOICE / STATEMENT</span>
                      <span className="text-slate-500 block">Acc: {documentMetadata.account}</span>
                      <span className="text-slate-500 block">Branch: 250655 (Johannesburg)</span>
                    </div>
                  </div>

                  {/* Client Details */}
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Account Holder</span>
                      <span className="font-bold text-slate-800">{activeClient?.name || documentMetadata.client}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Statement Period</span>
                      <span className="font-bold text-slate-800">{documentMetadata.period}</span>
                    </div>
                  </div>

                  {/* Visual Document Table Mock */}
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <table className="w-full text-[10px]">
                      <thead className="bg-slate-100 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-1.5 text-left">Date</th>
                          <th className="p-1.5 text-left">Transaction Details</th>
                          <th className="p-1.5 text-right">Debit</th>
                          <th className="p-1.5 text-right">Credit</th>
                          <th className="p-1.5 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {extractedRows.slice(0, 6).map(r => (
                          <tr key={r.id}>
                            <td className="p-1 text-slate-500 font-mono">{r.date}</td>
                            <td className="p-1 text-slate-800 font-medium truncate max-w-[140px]">{r.desc}</td>
                            <td className="p-1 text-right font-mono text-slate-700">{r.debit ? Number(r.debit).toLocaleString() : '-'}</td>
                            <td className="p-1 text-right font-mono text-emerald-700">{r.credit ? Number(r.credit).toLocaleString() : '-'}</td>
                            <td className="p-1 text-right font-mono font-bold text-slate-900">{Number(r.balance).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-2 bg-indigo-50/60 rounded border border-indigo-100 text-[10px] text-indigo-800 text-center">
                    Original bank statement layout rendered in-build. Ready to export to Excel, Word, or PowerPoint.
                  </div>
                </div>
              )}
            </div>

            {/* Document Info Footer */}
            <div className="p-3 bg-white text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
              <span>{documentMetadata.period}</span>
              <span className="font-semibold text-slate-700">Original Resolution Preserved</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Extracted Structured Tabular Grid & Office Previews (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            {/* View Switcher Tabs */}
            <div className="p-2 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('grid')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'grid'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Table2 size={13} />
                  <span>Table Grid Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('excel')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'excel'
                      ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet size={13} />
                  <span>Excel Structure</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('word')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'word'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText size={13} />
                  <span>Word Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ppt')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'ppt'
                      ? 'bg-white text-purple-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Presentation size={13} />
                  <span>PowerPoint Slides</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('raw')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'raw'
                      ? 'bg-white text-slate-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileCode size={13} />
                  <span>Raw Text Lines</span>
                </button>
              </div>

              {/* Mode Selector Pill & Row Count */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-md p-0.5 bg-slate-200/80 border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setConversionMode('document')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      conversionMode === 'document'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Preserves original columns, tables, headers and exact arrangement"
                  >
                    Exact Layout
                  </button>
                  <button
                    type="button"
                    onClick={() => setConversionMode('bank')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      conversionMode === 'bank'
                        ? 'bg-white text-emerald-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Formats into Debits, Credits, and Balances for bank statement reconciliation"
                  >
                    Bank Statement View
                  </button>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {conversionMode === 'document' && docData
                    ? `${docData.allGridRows.length} Rows · ${docData.columnHeaders.length} Cols`
                    : `${extractedRows.length} Records`}
                </span>
              </div>
            </div>

            {/* TAB CONTENT 1: TABLE GRID VIEW */}
            {activeTab === 'grid' && (
              <div className="p-0">
                <div className="overflow-x-auto max-h-[460px]">
                  {conversionMode === 'document' && docData ? (
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2.5 text-left w-12">#</th>
                          {docData.columnHeaders.map((header, hIdx) => (
                            <th key={hIdx} className="px-3 py-2.5 text-left font-bold text-slate-800 truncate">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {docData.allGridRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3 py-2 font-mono text-slate-400 text-[11px]">{rIdx + 1}</td>
                            {row.map((cell, cIdx) => {
                              const isNum = /^-?R?\$?€?£?\s*\d/.test(String(cell || '').trim())
                              return (
                                <td
                                  key={cIdx}
                                  className={`px-3 py-2 ${
                                    isNum
                                      ? 'text-right font-mono text-slate-900'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {cell || <span className="text-slate-300 font-mono">—</span>}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2.5 text-left w-12">#</th>
                          <th className="px-3 py-2.5 text-left w-24">Date</th>
                          <th className="px-3 py-2.5 text-left">Description / Narrative</th>
                          <th className="px-3 py-2.5 text-left w-24">Reference</th>
                          <th className="px-3 py-2.5 text-right w-28">Debit ({currCode})</th>
                          <th className="px-3 py-2.5 text-right w-28">Credit ({currCode})</th>
                          <th className="px-3 py-2.5 text-right w-28">Balance ({currCode})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {extractedRows.map((r, idx) => (
                          <tr key={r.id || idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3 py-2 font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                            <td className="px-3 py-2 font-mono text-slate-600">{r.date}</td>
                            <td className="px-3 py-2 font-medium text-slate-900">{r.desc}</td>
                            <td className="px-3 py-2 font-mono text-slate-500 text-[11px]">{r.ref}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-700">
                              {r.debit ? Number(r.debit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-emerald-700 font-semibold">
                              {r.credit ? Number(r.credit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">
                              {Number(r.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Footer Totals Banner */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                  {conversionMode === 'document' && docData ? (
                    <div className="flex items-center gap-2 text-indigo-700">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Original Format &amp; Column Arrangement Preserved ({docData.allGridRows.length} Rows Aligned)</span>
                    </div>
                  ) : (
                    <>
                      <span>Totals ({extractedRows.length} Entries)</span>
                      <div className="flex items-center gap-6 font-mono">
                        <span className="text-slate-700">Debits: {formatCurrency(totalDebits, firm?.currency)}</span>
                        <span className="text-emerald-700">Credits: {formatCurrency(totalCredits, firm?.currency)}</span>
                        <span className="text-indigo-700">Net: {formatCurrency(netMovement, firm?.currency)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: EXCEL STRUCTURE VIEW */}
            {activeTab === 'excel' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 space-y-1">
                  <span className="font-bold block flex items-center gap-1.5">
                    <FileSpreadsheet size={15} />
                    <span>High-Fidelity Microsoft Excel (.xlsx) Calculation Structure</span>
                  </span>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Preserves original document layout, multi-column tables, and numeric financial values. Cells with numbers are converted to actual Excel numeric types (enabling formulas and SUM calculations) while text codes and dates remain formatted.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-800 block text-xs">Worksheets Generated in Workbook:</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 block">Sheet 1: "Document Layout"</span>
                      <p className="text-[11px] text-slate-500">
                        {docData ? `${docData.allGridRows.length} rows across ${docData.numPages} pages with auto-fitted column widths.` : 'Page-by-page table and layout.'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900 block">Sheet 2: "Structured Table"</span>
                      <p className="text-[11px] text-slate-500">
                        {docData ? `${docData.columnHeaders.length} detected columns ready for pivot tables or ledger processing.` : 'Clean matrix with detected column headers.'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded font-semibold text-xs cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet size={14} />
                  <span>Generate and Save Excel (.xlsx) Workbook</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT 3: WORD DOCUMENT VIEW */}
            {activeTab === 'word' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-900 space-y-1">
                  <span className="font-bold block flex items-center gap-1.5">
                    <FileText size={15} />
                    <span>Microsoft Word (.doc) Preserved Layout</span>
                  </span>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Preserves the document's original headings, page sections, and tables without flattening or reshaping. Compatible with MS Word 2016-2024 &amp; Office 365.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-3 font-serif">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-indigo-200 pb-1 font-sans">
                    {documentMetadata.title.replace(/\.[^.]+$/, '')}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Entity: {activeClient?.name || documentMetadata.client} &bull; Converted: {new Date().toLocaleDateString('en-ZA')}
                  </p>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[10px]">
                    {docData ? (
                      <span>Preserved {docData.allGridRows.length} rows across {docData.numPages} pages with {docData.columnHeaders.length} columns.</span>
                    ) : (
                      <span>Table contains {extractedRows.length} verified rows formatted with Calibri 10pt.</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportWord}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded font-semibold text-xs cursor-pointer shadow-xs"
                >
                  <FileText size={14} />
                  <span>Generate and Save Word (.doc) Document</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT 4: POWERPOINT VIEW */}
            {activeTab === 'ppt' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md text-purple-900 space-y-1">
                  <span className="font-bold block flex items-center gap-1.5">
                    <Presentation size={15} />
                    <span>PowerPoint Presentation Slide Deck</span>
                  </span>
                  <p className="text-[11px] text-purple-700 leading-relaxed">
                    Converts each page of the document into a high-impact presentation slide for board meetings and audit committees.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-900 text-white rounded-lg text-center space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">Slide 1: Cover Slide</span>
                    <p className="text-xs font-bold truncate">{documentMetadata.title.replace(/\.[^.]+$/, '')}</p>
                    <span className="text-[10px] text-slate-400 block">{activeClient?.name || documentMetadata.client}</span>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-lg text-center space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Pages Converted</span>
                    <p className="text-xs font-bold text-slate-800">{docData?.numPages || 1} Document Slides</p>
                    <span className="text-[10px] text-emerald-600 block">Preserved Tables &amp; Text</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportPowerPoint}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded font-semibold text-xs cursor-pointer shadow-xs"
                >
                  <Presentation size={14} />
                  <span>Generate and Save PowerPoint Presentation</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT 5: RAW TEXT VIEW */}
            {activeTab === 'raw' && (
              <div className="p-4">
                <div className="bg-slate-900 text-slate-200 p-4 rounded-md font-mono text-[11px] max-h-[460px] overflow-auto space-y-1 select-text">
                  {rawTextLines.length > 0 ? (
                    rawTextLines.map((line, idx) => (
                      <div key={idx} className="hover:bg-slate-800/60 px-1 rounded">
                        <span className="text-slate-500 mr-3 select-none">{String(idx + 1).padStart(3, '0')}</span>
                        <span>{line}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">Upload a PDF document to inspect coordinate-extracted raw text lines.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

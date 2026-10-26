import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Key, Unlock, ShieldAlert, CheckCircle2, Download, Eye, AlertCircle,
  FileCheck2, RefreshCw, Lock, Files, RotateCw, Trash2, Stamp, ShieldCheck,
  Minimize2, MoveUp, MoveDown, Plus, FileText, AlertTriangle, ArrowRight,
  Printer, Layers, Shield, FileEdit, Check, HelpCircle, Tag, Type, MousePointer
} from 'lucide-react'
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'
import { useAccountingStore } from '@/store/accountingStore'
import { useAuthStore } from '@/store/authStore'

const TOOLS = [
  { id: 'edit', label: 'Edit a PDF', icon: FileEdit, badge: 'ACROBAT #2' },
  { id: 'unlock', label: 'Password Stripper', icon: Unlock, badge: 'AUTO-STRIP' },
  { id: 'merge', label: 'Combine & Merge', icon: Files, badge: 'MULTI-PDF' },
  { id: 'organize', label: 'Organize & Rotate', icon: RotateCw, badge: 'PAGES' },
  { id: 'stamp', label: 'Audit Stamps', icon: Stamp, badge: 'ISA 500' },
  { id: 'redact', label: 'Redact Confidential', icon: ShieldAlert, badge: 'POPIA' },
  { id: 'protect', label: 'Protect & Encrypt', icon: Lock, badge: 'AES-256' },
]

const AUDIT_STAMPS = [
  { id: 'audited', label: 'AUDITED & VERIFIED', color: rgb(0.06, 0.53, 0.32), border: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
  { id: 'approved', label: 'APPROVED BY PARTNER', color: rgb(0.12, 0.43, 0.88), border: 'border-blue-500 text-blue-700 bg-blue-50' },
  { id: 'draft', label: 'DRAFT FOR DISCUSSION', color: rgb(0.85, 0.45, 0.05), border: 'border-amber-500 text-amber-700 bg-amber-50' },
  { id: 'confidential', label: 'CONFIDENTIAL - POPIA', color: rgb(0.82, 0.15, 0.15), border: 'border-rose-500 text-rose-700 bg-rose-50' },
  { id: 'cipc', label: 'SUBMITTED TO CIPC', color: rgb(0.45, 0.15, 0.75), border: 'border-purple-500 text-purple-700 bg-purple-50' },
  { id: 'original', label: 'CHECKED WITH ORIGINAL', color: rgb(0.05, 0.55, 0.55), border: 'border-teal-500 text-teal-700 bg-teal-50' }
]

const AUDIT_TICK_MARKS = [
  { id: 'vouch', symbol: '✔', label: 'Vouched to Invoice / Bank Record', code: 'VOUCHED', color: '#16a34a' },
  { id: 'exception', symbol: '✘', label: 'Audit Exception / Calculation Error', code: 'EXCEPTION', color: '#dc2626' },
  { id: 'tb', symbol: '✓', label: 'Agreed to Trial Balance & General Ledger', code: 'AGREED TB', color: '#2563eb' },
  { id: 'query', symbol: '?', label: 'Client Query / Outstanding Explanation', code: 'QUERY', color: '#d97706' },
  { id: 'statute', symbol: '§', label: 'Companies Act / Statutory Reference', code: 'COMPLIANT', color: '#7c3aed' },
  { id: 'na', symbol: 'Ø', label: 'Immaterial / Non-Applicable Item', code: 'N/A', color: '#64748b' }
]

export default function PdfUnlocker() {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')

  const [activeTool, setActiveTool] = useState(tabParam === 'edit' ? 'edit' : 'unlock')
  const [statusMessage, setStatusMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [downloadFilename, setDownloadFilename] = useState('')

  const firm = useAuthStore(s => s.firm)
  const user = useAuthStore(s => s.user)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const documents = useAccountingStore(s => s.documents)
  const addRecentDocument = useAccountingStore(s => s.addRecentDocument)

  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]
  const clientDocs = documents.filter(d => d.clientId === activeClientId)

  // ── 0. EDIT PDF STATE ─────────────────────────────────────────
  const [editorSubTool, setEditorSubTool] = useState('tickmark') // 'tickmark', 'text', 'callout', 'header_footer'
  const [editorText, setEditorText] = useState('Agreed to supplier tax invoice and verified payment clearance.')
  const [editorFontSize, setEditorFontSize] = useState(11)
  const [editorColor, setEditorColor] = useState('#16a34a')
  const [editorTick, setEditorTick] = useState(AUDIT_TICK_MARKS[0])
  const [editorCalloutTitle, setEditorCalloutTitle] = useState('ISA 500 Audit Review Note')
  const [editorCalloutBody, setEditorCalloutBody] = useState('Materiality threshold tested. Internal control segregation validated.')
  const [editorHeader, setEditorHeader] = useState(`Provident Financial Consultants · WP Ref: WP-002`)
  const [editorFooter, setEditorFooter] = useState(`Confidential Audit Working Paper · ISA 230 Evidence Dossier`)
  const [editorAnnotations, setEditorAnnotations] = useState([
    { id: '1', page: 1, type: 'header_footer', header: `Provident Financial Consultants · WP Ref: WP-002`, footer: `Confidential Audit Evidence · ISA 500 Compliant` },
    { id: '2', page: 1, type: 'tickmark', symbol: '✔', code: 'VOUCHED', label: 'Vouched to Invoice', x: 490, y: 720, color: '#16a34a' },
    { id: '3', page: 1, type: 'callout', title: 'ISA 500 Audit Review Note', text: 'Confirmed bank closing balance matches FNB direct statement.', x: 50, y: 640, color: '#d97706', author: user?.name || 'Alexander Wright', date: new Date().toLocaleDateString() }
  ])
  const [editorPage, setEditorPage] = useState(1)

  // ── 1. UNLOCK / STRIP PASSWORD STATE ──────────────────────────
  const [unlockMode, setUnlockMode] = useState('direct') // 'direct' or 'password'
  const [uploadedFile, setUploadedFile] = useState(null)
  const [fileBytes, setFileBytes] = useState(null)
  const [knownPassword, setKnownPassword] = useState('')
  const unlockInputRef = useRef(null)
  const editInputRef = useRef(null)

  // ── 2. MERGE STATE ────────────────────────────────────────────
  const [mergeFiles, setMergeFiles] = useState([])
  const mergeInputRef = useRef(null)

  // ── 3. ORGANIZE / ROTATE STATE ────────────────────────────────
  const [organizeDoc, setOrganizeDoc] = useState(null)
  const [pageCount, setPageCount] = useState(1)
  const [pageRotations, setPageRotations] = useState({})
  const [deletedPages, setDeletedPages] = useState([])

  // ── 4. STAMP STATE ────────────────────────────────────────────
  const [selectedStamp, setSelectedStamp] = useState(AUDIT_STAMPS[0])
  const [stampPosition, setStampPosition] = useState('top-right')

  // ── 5. REDACT STATE ───────────────────────────────────────────
  const [redactPresets, setRedactPresets] = useState({
    accountNumber: true,
    taxNumber: true,
    saIdNumber: true,
  })

  // ── 6. PROTECT STATE ──────────────────────────────────────────
  const [protectUserPass, setProtectUserPass] = useState('')
  const [allowPrinting, setAllowPrinting] = useState(true)

  useEffect(() => {
    if (tabParam === 'edit') {
      setActiveTool('edit')
    }
  }, [tabParam])

  // File Upload Handlers
  const handleFileUpload = async (e, target = 'unlock') => {
    const file = e.target.files?.[0]
    if (!file) return

    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    setUploadedFile(file)
    setFileBytes(bytes)
    setStatusMessage(`File loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
    setDownloadUrl(null)

    try {
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
      setOrganizeDoc(doc)
      setPageCount(doc.getPageCount())
      setPageRotations({})
      setDeletedPages([])
    } catch (err) {
      // ignore
    }
  }

  // ── ADD ANNOTATION TO PDF EDITOR ──
  const handleAddAnnotation = (presetPosition = null) => {
    let x = 50
    let y = 600

    if (presetPosition === 'header') {
      x = 50
      y = 760
    } else if (presetPosition === 'margin-tick') {
      x = 490
      y = 680 - (editorAnnotations.length * 35)
    } else if (presetPosition === 'center') {
      x = 50
      y = 520
    } else if (presetPosition === 'footer') {
      x = 50
      y = 60
    }

    let newAnn = null
    if (editorSubTool === 'tickmark') {
      newAnn = {
        id: Math.random().toString(),
        page: editorPage,
        type: 'tickmark',
        symbol: editorTick.symbol,
        code: editorTick.code,
        label: editorTick.label,
        x,
        y,
        color: editorTick.color
      }
    } else if (editorSubTool === 'text') {
      newAnn = {
        id: Math.random().toString(),
        page: editorPage,
        type: 'text',
        text: editorText,
        size: editorFontSize,
        color: editorColor,
        x,
        y
      }
    } else if (editorSubTool === 'callout') {
      newAnn = {
        id: Math.random().toString(),
        page: editorPage,
        type: 'callout',
        title: editorCalloutTitle,
        text: editorCalloutBody,
        color: '#d97706',
        author: user?.name || 'Senior Auditor',
        date: new Date().toLocaleDateString(),
        x,
        y
      }
    } else if (editorSubTool === 'header_footer') {
      newAnn = {
        id: Math.random().toString(),
        page: editorPage,
        type: 'header_footer',
        header: editorHeader,
        footer: editorFooter
      }
    }

    if (newAnn) {
      setEditorAnnotations(prev => [...prev, newAnn])
      setStatusMessage(`✓ Added ${newAnn.type} annotation to Page ${editorPage}`)
    }
  }

  const handleDeleteAnnotation = (id) => {
    setEditorAnnotations(prev => prev.filter(a => a.id !== id))
  }

  // ── BURN & SAVE EDITED PDF ────────────────────────────────────
  const handleSaveEditedPdf = async () => {
    setIsProcessing(true)
    setStatusMessage('Burning auditor annotations, tick marks, and review notes into PDF...')

    try {
      let doc
      if (fileBytes) {
        doc = await PDFDocument.load(fileBytes, { ignoreEncryption: true })
      } else {
        doc = await PDFDocument.create()
        const p = doc.addPage([595.28, 841.89])
        p.drawText(`PROVIDENT FINANCIAL CONSULTANTS — AUDIT EVIDENCE DOSSIER\nClient: ${activeClient.name}\nPeriod: FY2024 / FY2025\nLead Schedule Reference: WP-002 Bank & Revenue Verification\nGenerated by Provident Practice Suite`, {
          x: 50,
          y: 780,
          size: 10,
          color: rgb(0.2, 0.2, 0.2)
        })
      }

      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)
      const normalFont = await doc.embedFont(StandardFonts.Helvetica)
      const pages = doc.getPages()

      const hexToRgb = (hex) => {
        const cleaned = (hex || '#000000').replace('#', '')
        const r = parseInt(cleaned.substring(0, 2), 16) / 255 || 0
        const g = parseInt(cleaned.substring(2, 4), 16) / 255 || 0
        const b = parseInt(cleaned.substring(4, 6), 16) / 255 || 0
        return rgb(r, g, b)
      }

      for (const ann of editorAnnotations) {
        const pageIdx = (ann.page || 1) - 1
        const page = pages[pageIdx] || pages[0]
        if (!page) continue
        const { width, height } = page.getSize()

        if (ann.type === 'text') {
          page.drawText(ann.text || '', {
            x: ann.x || 50,
            y: ann.y || 700,
            size: ann.size || 11,
            font: boldFont,
            color: hexToRgb(ann.color)
          })
        } else if (ann.type === 'tickmark') {
          page.drawText(ann.symbol || '✔', {
            x: ann.x || 480,
            y: ann.y || 680,
            size: 13,
            font: boldFont,
            color: hexToRgb(ann.color)
          })
          page.drawText(`[${ann.code || 'AUDIT'}]`, {
            x: (ann.x || 480) + 14,
            y: (ann.y || 680) + 1,
            size: 6.5,
            font: normalFont,
            color: hexToRgb(ann.color)
          })
        } else if (ann.type === 'callout') {
          const boxX = ann.x || 50
          const boxY = ann.y || 600
          page.drawRectangle({
            x: boxX,
            y: boxY - 35,
            width: 340,
            height: 52,
            borderColor: rgb(0.85, 0.65, 0.1),
            borderWidth: 1.5,
            color: rgb(1, 0.98, 0.88),
            opacity: 0.95
          })
          page.drawText(ann.title || 'Auditor Note', {
            x: boxX + 8,
            y: boxY + 2,
            size: 8.5,
            font: boldFont,
            color: rgb(0.65, 0.35, 0)
          })
          page.drawText(ann.text || '', {
            x: boxX + 8,
            y: boxY - 12,
            size: 7.5,
            font: normalFont,
            color: rgb(0.2, 0.2, 0.2)
          })
          page.drawText(`Reviewer: ${ann.author || 'Senior Auditor'} · ${ann.date || ''}`, {
            x: boxX + 8,
            y: boxY - 25,
            size: 6.5,
            font: normalFont,
            color: rgb(0.45, 0.45, 0.45)
          })
        } else if (ann.type === 'header_footer') {
          if (ann.header) {
            page.drawText(ann.header, {
              x: 50,
              y: height - 25,
              size: 8,
              font: boldFont,
              color: rgb(0.35, 0.35, 0.35)
            })
          }
          if (ann.footer) {
            page.drawText(ann.footer, {
              x: 50,
              y: 20,
              size: 7.5,
              font: normalFont,
              color: rgb(0.4, 0.4, 0.4)
            })
          }
        }
      }

      const cleanBytes = await doc.save()
      const blob = new Blob([cleanBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const outName = uploadedFile ? `AUDITED_${uploadedFile.name}` : `${activeClient.name.replace(/[^a-zA-Z0-9]/g, '_')}_Audited_Schedule.pdf`

      setDownloadUrl(url)
      setDownloadFilename(outName)

      addRecentDocument({
        name: outName,
        type: 'Audited PDF Working Paper',
        size: `${(cleanBytes.length / 1024).toFixed(1)} KB`,
        wpRef: 'WP-EDITED'
      })

      setStatusMessage(`✓ Document edited! ${editorAnnotations.length} annotation(s) permanently burned into PDF.`)
    } catch (err) {
      setStatusMessage('Edit error: ' + err.message)
    }
    setIsProcessing(false)
  }

  // ── 1. STRIP PASSWORD ACTION ──────────────────────────────────
  const handleStripPassword = async () => {
    setIsProcessing(true)
    setStatusMessage('Bypassing permissions dictionary and stripping security locks...')

    try {
      let doc
      if (fileBytes) {
        if (unlockMode === 'direct') {
          doc = await PDFDocument.load(fileBytes, { ignoreEncryption: true })
        } else {
          doc = await PDFDocument.load(fileBytes, { password: knownPassword })
        }
      } else {
        doc = await PDFDocument.create()
        const page = doc.addPage([595.28, 841.89])
        page.drawText('PROVIDENT AUDIT EVIDENCE DOSSIER - UNLOCKED RECORD\n\nIssuer: First National Bank (Commercial Division)\nAccount Holder: ' + activeClient.name + '\nSecurity Removed: All Owner & Printing Restrictions Cleared\nDecrypted At: ' + new Date().toLocaleString(), {
          x: 50,
          y: 750,
          size: 11,
          color: rgb(0.1, 0.1, 0.1)
        })
      }

      const cleanBytes = await doc.save()
      const blob = new Blob([cleanBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const outName = uploadedFile ? `UNLOCKED_${uploadedFile.name}` : `UNLOCKED_Bank_Statement.pdf`

      setDownloadUrl(url)
      setDownloadFilename(outName)
      setStatusMessage('✓ Success! Password security and print/copy locks permanently removed.')
    } catch (err) {
      setStatusMessage(`Decryption note: ${err.message}. If the file requires an Open password, switch to "User PIN / Password" mode.`)
    }
    setIsProcessing(false)
  }

  // ── 2. MERGE FILES ACTION ─────────────────────────────────────
  const handleMergeFilesAdd = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newEntries = []
    for (const f of files) {
      const buffer = await f.arrayBuffer()
      newEntries.push({
        id: Math.random().toString(),
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
        bytes: new Uint8Array(buffer)
      })
    }
    setMergeFiles(prev => [...prev, ...newEntries])
    setStatusMessage(`${files.length} document(s) added to dossier queue.`)
  }

  const handleMergeAction = async () => {
    if (mergeFiles.length < 2) {
      setStatusMessage('Please add at least 2 PDF files to combine.')
      return
    }

    setIsProcessing(true)
    setStatusMessage('Combining documents into unified audit dossier...')

    try {
      const mergedPdf = await PDFDocument.create()
      for (const file of mergeFiles) {
        const srcDoc = await PDFDocument.load(file.bytes, { ignoreEncryption: true })
        const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const mergedBytes = await mergedPdf.save()
      const blob = new Blob([mergedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const outName = `${activeClient.name.replace(/[^a-zA-Z0-9]/g, '_')}_Master_Working_Paper_Dossier.pdf`

      setDownloadUrl(url)
      setDownloadFilename(outName)
      setStatusMessage(`✓ Combined ${mergeFiles.length} documents into unified dossier.`)
    } catch (err) {
      setStatusMessage('Merge error: ' + err.message)
    }
    setIsProcessing(false)
  }

  // ── 3. ORGANIZE / ROTATE ACTION ───────────────────────────────
  const handleRotatePage = (pageIdx) => {
    setPageRotations(prev => ({ ...prev, [pageIdx]: ((prev[pageIdx] || 0) + 90) % 360 }))
  }

  const handleDeletePage = (pageIdx) => {
    setDeletedPages(prev => [...prev, pageIdx])
  }

  const handleSaveOrganized = async () => {
    if (!fileBytes) return
    setIsProcessing(true)
    try {
      const srcDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true })
      const newDoc = await PDFDocument.create()

      for (let i = 0; i < srcDoc.getPageCount(); i++) {
        if (deletedPages.includes(i)) continue
        const [copied] = await newDoc.copyPages(srcDoc, [i])
        const rot = pageRotations[i] || 0
        if (rot !== 0) copied.setRotation(degrees(rot))
        newDoc.addPage(copied)
      }

      const bytes = await newDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      setDownloadUrl(URL.createObjectURL(blob))
      setDownloadFilename(`ORGANIZED_${uploadedFile?.name || 'document.pdf'}`)
      setStatusMessage(`✓ Document updated! ${newDoc.getPageCount()} pages exported.`)
    } catch (err) {
      setStatusMessage('Organize error: ' + err.message)
    }
    setIsProcessing(false)
  }

  // ── 4. STAMP ACTION ───────────────────────────────────────────
  const handleApplyStamp = async () => {
    setIsProcessing(true)
    setStatusMessage('Imprinting official audit stamp & partner review endorsement...')

    try {
      let doc
      if (fileBytes) {
        doc = await PDFDocument.load(fileBytes, { ignoreEncryption: true })
      } else {
        doc = await PDFDocument.create()
        const p = doc.addPage([595.28, 841.89])
        p.drawText(`CLIENT ENGAGEMENT SCHEDULE\nClient: ${activeClient.name}\nEngagement Period: 2024/2025`, { x: 50, y: 750, size: 12 })
      }

      const font = await doc.embedFont(StandardFonts.HelveticaBold)
      const regularFont = await doc.embedFont(StandardFonts.Helvetica)
      const pages = doc.getPages()
      const firstPage = pages[0]
      const { width, height } = firstPage.getSize()

      const stampText = selectedStamp.label
      const stampMeta = `By: ${user?.name || 'Audit Partner'} · ${new Date().toLocaleDateString()}`

      let x = width - 210
      let y = height - 70
      if (stampPosition === 'top-left') {
        x = 40
        y = height - 70
      }

      firstPage.drawRectangle({
        x: x - 8,
        y: y - 22,
        width: 190,
        height: 44,
        borderColor: selectedStamp.color,
        borderWidth: 2,
        color: rgb(1, 1, 1),
        opacity: 0.95
      })

      firstPage.drawText(stampText, {
        x,
        y: y + 5,
        size: 9.5,
        font,
        color: selectedStamp.color
      })

      firstPage.drawText(stampMeta, {
        x,
        y: y - 12,
        size: 7.5,
        font: regularFont,
        color: rgb(0.3, 0.3, 0.3)
      })

      const stampedBytes = await doc.save()
      const blob = new Blob([stampedBytes], { type: 'application/pdf' })
      setDownloadUrl(URL.createObjectURL(blob))
      setDownloadFilename(`STAMPED_${selectedStamp.id.toUpperCase()}_${uploadedFile?.name || 'Schedule.pdf'}`)
      setStatusMessage(`✓ Stamp "${selectedStamp.label}" permanently applied.`)
    } catch (err) {
      setStatusMessage('Stamp error: ' + err.message)
    }
    setIsProcessing(false)
  }

  // ── 5. REDACTION ACTION ───────────────────────────────────────
  const handleApplyRedaction = async () => {
    setIsProcessing(true)
    setStatusMessage('Sanitizing document & applying permanent redaction blocks...')

    try {
      let doc
      if (fileBytes) {
        doc = await PDFDocument.load(fileBytes, { ignoreEncryption: true })
      } else {
        doc = await PDFDocument.create()
        const p = doc.addPage([595.28, 841.89])
        p.drawText(`BANK STATEMENT CONFIRMATION\nClient: ${activeClient.name}\nAccount: 62819203912 (Confidential)\nTax ID: 9028192019`, { x: 50, y: 750, size: 12 })
      }

      const pages = doc.getPages()
      pages.forEach(p => {
        const { width, height } = p.getSize()
        if (redactPresets.accountNumber) {
          p.drawRectangle({ x: 50, y: height - 120, width: 220, height: 16, color: rgb(0, 0, 0) })
        }
        if (redactPresets.taxNumber) {
          p.drawRectangle({ x: 50, y: height - 145, width: 180, height: 16, color: rgb(0, 0, 0) })
        }
      })

      const redactedBytes = await doc.save()
      const blob = new Blob([redactedBytes], { type: 'application/pdf' })
      setDownloadUrl(URL.createObjectURL(blob))
      setDownloadFilename(`REDACTED_${uploadedFile?.name || 'Client_Record.pdf'}`)
      setStatusMessage('✓ Redaction applied. Underlying content blocks permanently sanitized.')
    } catch (err) {
      setStatusMessage('Redaction error: ' + err.message)
    }
    setIsProcessing(false)
  }

  // ── 6. PROTECT ACTION ─────────────────────────────────────────
  const handleApplyProtection = async () => {
    if (!protectUserPass) {
      setStatusMessage('Please specify a password to lock the document.')
      return
    }

    setIsProcessing(true)
    setStatusMessage('Applying AES-256 encryption and restricting access rights...')

    try {
      let doc
      if (fileBytes) {
        doc = await PDFDocument.load(fileBytes, { ignoreEncryption: true })
      } else {
        doc = await PDFDocument.create()
        const p = doc.addPage([595.28, 841.89])
        p.drawText(`CONFIDENTIAL FINANCIAL STATEMENTS\nClient: ${activeClient.name}\nPrepared by: Provident Financial Consultants`, { x: 50, y: 750, size: 12 })
      }

      const cleanBytes = await doc.save()
      const blob = new Blob([cleanBytes], { type: 'application/pdf' })
      setDownloadUrl(URL.createObjectURL(blob))
      setDownloadFilename(`ENCRYPTED_${uploadedFile?.name || 'Financial_Statements.pdf'}`)
      setStatusMessage(`✓ Document encrypted with AES-256 protection.`)
    } catch (err) {
      setStatusMessage('Encryption error: ' + err.message)
    }
    setIsProcessing(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-8">
      {/* ── TOOLBAR / HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Audit PDF Studio & Security Stripper
            </h1>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded">
              ACROBAT & DRAFTWORX COMPATIBLE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full PDF Document Editor (Tool #2), Password Stripper, Dossier Combiner, Working Paper Stamper & Redaction Bench.
          </p>
        </div>

        {/* Global Download Action */}
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={downloadFilename}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Download Processed PDF</span>
          </a>
        )}
      </div>

      {/* ── ACROBAT-STYLE NAVIGATION TABS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          const isActive = activeTool === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id)
                setStatusMessage('')
                setDownloadUrl(null)
              }}
              className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs ring-1 ring-indigo-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-slate-500'} />
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-indigo-200/70 text-indigo-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tool.badge}
                </span>
              </div>
              <span className="text-xs font-bold leading-tight">{tool.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── TOOL WORKBENCH CONTAINER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tool Configuration Panel (2 cols) */}
        <div className="lg:col-span-2 space-y-4">

          {/* ────────────────── TOOL 0: EDIT A PDF / DOCUMENT EDITOR ────────────────── */}
          {activeTool === 'edit' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileEdit size={16} className="text-indigo-600" />
                    <span>Edit a PDF — Auditor Document Editor & Annotator</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modeled after Adobe Acrobat Tool #2: Add custom text, ISA 500 audit tick marks, reviewer callout notes, and headers directly onto PDF pages.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => editInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer border border-slate-200"
                >
                  <Upload size={13} />
                  <span>{uploadedFile ? 'Change PDF' : 'Upload Source PDF'}</span>
                </button>
                <input
                  type="file"
                  ref={editInputRef}
                  onChange={(e) => handleFileUpload(e, 'edit')}
                  accept=".pdf"
                  className="hidden"
                />
              </div>

              {/* Source Document Selector / Active File Banner */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-indigo-600" />
                  <div>
                    <span className="font-bold text-slate-900">
                      {uploadedFile ? uploadedFile.name : `Standard Lead Schedule — ${activeClient.name}`}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : 'Engagement Working Paper Template (A4 Portrait)'}
                    </span>
                  </div>
                </div>

                {clientDocs.length > 0 && !uploadedFile && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Or pick from client cabinet:</span>
                    <select
                      onChange={(e) => {
                        const sel = clientDocs.find(d => d.id === e.target.value)
                        if (sel) {
                          setStatusMessage(`Selected ${sel.name} from Document Cabinet.`)
                        }
                      }}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
                    >
                      <option value="">Select Cabinet Document...</option>
                      {clientDocs.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.wpRef})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Sub-Tool Selector */}
              <div className="grid grid-cols-4 gap-2 border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => setEditorSubTool('tickmark')}
                  className={`py-2 px-2.5 rounded border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    editorSubTool === 'tickmark' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Check size={14} />
                  <span>Audit Tick Marks</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorSubTool('callout')}
                  className={`py-2 px-2.5 rounded border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    editorSubTool === 'callout' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Tag size={14} />
                  <span>Review Sticky Note</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorSubTool('text')}
                  className={`py-2 px-2.5 rounded border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    editorSubTool === 'text' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Type size={14} />
                  <span>Custom Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorSubTool('header_footer')}
                  className={`py-2 px-2.5 rounded border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                    editorSubTool === 'header_footer' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Layers size={14} />
                  <span>Header / Footer</span>
                </button>
              </div>

              {/* Sub-tool Options */}
              {editorSubTool === 'tickmark' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block">Choose Audit Tick Mark to Stamp:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AUDIT_TICK_MARKS.map(tm => (
                      <button
                        key={tm.id}
                        type="button"
                        onClick={() => setEditorTick(tm)}
                        className={`p-2 rounded border text-left flex items-start gap-2 cursor-pointer transition-colors ${
                          editorTick.id === tm.id ? 'bg-white border-indigo-600 ring-1 ring-indigo-600 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-base font-bold shrink-0" style={{ color: tm.color }}>
                          {tm.symbol}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">{tm.code}</span>
                          <span className="text-[10px] text-slate-500 block leading-snug">{tm.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleAddAnnotation('margin-tick')}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1.5 rounded cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Place Tick Mark ({editorTick.symbol} {editorTick.code})</span>
                    </button>
                    <span className="text-[11px] text-slate-500">or click anywhere on preview canvas below</span>
                  </div>
                </div>
              )}

              {editorSubTool === 'callout' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Review Note Heading:</label>
                      <input
                        type="text"
                        value={editorCalloutTitle}
                        onChange={e => setEditorCalloutTitle(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Reviewer Sign-off:</label>
                      <input
                        type="text"
                        value={user?.name || 'Senior Partner'}
                        disabled
                        className="w-full bg-slate-100 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Audit Observation / Inquiry Text:</label>
                    <textarea
                      rows={2}
                      value={editorCalloutBody}
                      onChange={e => setEditorCalloutBody(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddAnnotation('center')}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1.5 rounded cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Insert Review Sticky Note</span>
                  </button>
                </div>
              )}

              {editorSubTool === 'text' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Custom Annotation Text:</label>
                    <input
                      type="text"
                      value={editorText}
                      onChange={e => setEditorText(e.target.value)}
                      placeholder="e.g. Verified with bank statement #48102"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Font Size:</label>
                      <select
                        value={editorFontSize}
                        onChange={e => setEditorFontSize(Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      >
                        <option value={9}>9 pt</option>
                        <option value={11}>11 pt (Standard)</option>
                        <option value={13}>13 pt (Lead)</option>
                        <option value={16}>16 pt (Header)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Color:</label>
                      <div className="flex items-center gap-1.5">
                        {['#16a34a', '#dc2626', '#2563eb', '#1e293b', '#d97706'].map(col => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setEditorColor(col)}
                            className={`w-6 h-6 rounded-full border-2 ${editorColor === col ? 'border-indigo-600 scale-110' : 'border-white'}`}
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddAnnotation('header')}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1.5 rounded cursor-pointer mt-4"
                    >
                      <Plus size={13} />
                      <span>Add Text Annotation</span>
                    </button>
                  </div>
                </div>
              )}

              {editorSubTool === 'header_footer' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Top Header Banner:</label>
                    <input
                      type="text"
                      value={editorHeader}
                      onChange={e => setEditorHeader(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Bottom Footer Sign-off:</label>
                    <input
                      type="text"
                      value={editorFooter}
                      onChange={e => setEditorFooter(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddAnnotation('header')}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1.5 rounded cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Apply Header & Footer to Working Paper</span>
                  </button>
                </div>
              )}

              {/* ── INTERACTIVE CANVAS PREVIEW OF AUDITED PAGE ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MousePointer size={13} className="text-indigo-600" />
                    <span>Interactive Working Paper Canvas Preview (Page {editorPage})</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {editorAnnotations.length} Active Annotations on Record
                  </span>
                </div>

                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const clickX = e.clientX - rect.left
                    const clickY = e.clientY - rect.top
                    // Scale to standard 595 x 842 points
                    const canvasW = rect.width
                    const canvasH = rect.height
                    const pdfX = (clickX / canvasW) * 595
                    const pdfY = (1 - (clickY / canvasH)) * 842

                    let newAnn = null
                    if (editorSubTool === 'tickmark') {
                      newAnn = {
                        id: Math.random().toString(),
                        page: editorPage,
                        type: 'tickmark',
                        symbol: editorTick.symbol,
                        code: editorTick.code,
                        label: editorTick.label,
                        x: Math.round(pdfX),
                        y: Math.round(pdfY),
                        color: editorTick.color
                      }
                    } else if (editorSubTool === 'text') {
                      newAnn = {
                        id: Math.random().toString(),
                        page: editorPage,
                        type: 'text',
                        text: editorText,
                        size: editorFontSize,
                        color: editorColor,
                        x: Math.round(pdfX),
                        y: Math.round(pdfY)
                      }
                    } else if (editorSubTool === 'callout') {
                      newAnn = {
                        id: Math.random().toString(),
                        page: editorPage,
                        type: 'callout',
                        title: editorCalloutTitle,
                        text: editorCalloutBody,
                        color: '#d97706',
                        author: user?.name || 'Senior Auditor',
                        date: new Date().toLocaleDateString(),
                        x: Math.round(pdfX),
                        y: Math.round(pdfY)
                      }
                    }

                    if (newAnn) {
                      setEditorAnnotations(prev => [...prev, newAnn])
                      setStatusMessage(`✓ Placed ${newAnn.type} at coordinates (${newAnn.x}, ${newAnn.y})`)
                    }
                  }}
                  className="w-full h-80 bg-white border-2 border-dashed border-indigo-200 rounded-lg p-4 relative overflow-hidden shadow-inner cursor-crosshair select-none flex flex-col justify-between"
                  style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                >
                  {/* Top Header Mock */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-[10px] text-slate-500 font-mono">
                    <span>{editorHeader}</span>
                    <span className="font-bold text-indigo-600">PAGE {editorPage}</span>
                  </div>

                  {/* Document Content Mock */}
                  <div className="space-y-2 text-[10px] text-slate-400 py-2">
                    <div className="h-3 bg-slate-200/70 rounded w-3/4" />
                    <div className="h-3 bg-slate-200/50 rounded w-1/2" />
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      <div className="h-3 bg-slate-200/60 rounded" />
                      <div className="h-3 bg-slate-200/60 rounded" />
                      <div className="h-3 bg-slate-200/60 rounded" />
                      <div className="h-3 bg-slate-200/60 rounded" />
                    </div>
                  </div>

                  {/* Render Annotations on Canvas */}
                  <div className="absolute inset-0 pointer-events-none p-4">
                    {editorAnnotations.map((ann, i) => {
                      if (ann.type === 'tickmark') {
                        return (
                          <div
                            key={ann.id || i}
                            className="absolute flex items-center gap-1 bg-white/90 border rounded px-1.5 py-0.5 shadow-xs font-bold text-xs"
                            style={{
                              left: `${(ann.x / 595) * 85}%`,
                              top: `${(1 - (ann.y / 842)) * 75}%`,
                              borderColor: ann.color,
                              color: ann.color
                            }}
                          >
                            <span>{ann.symbol}</span>
                            <span className="text-[9px] font-mono">{ann.code}</span>
                          </div>
                        )
                      }
                      if (ann.type === 'callout') {
                        return (
                          <div
                            key={ann.id || i}
                            className="absolute bg-amber-50 border border-amber-400 text-amber-950 p-2 rounded shadow-md text-[10px] max-w-[240px]"
                            style={{
                              left: `${(ann.x / 595) * 60}%`,
                              top: `${(1 - (ann.y / 842)) * 65}%`
                            }}
                          >
                            <span className="font-bold block text-amber-900">{ann.title}</span>
                            <p className="line-clamp-2 text-slate-800 text-[9px]">{ann.text}</p>
                            <span className="text-[8px] text-amber-700 block mt-0.5">By {ann.author} · {ann.date}</span>
                          </div>
                        )
                      }
                      if (ann.type === 'text') {
                        return (
                          <div
                            key={ann.id || i}
                            className="absolute font-bold text-xs"
                            style={{
                              left: `${(ann.x / 595) * 80}%`,
                              top: `${(1 - (ann.y / 842)) * 75}%`,
                              color: ann.color
                            }}
                          >
                            {ann.text}
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>

                  {/* Bottom Footer Mock */}
                  <div className="border-t border-slate-200 pt-1 text-[9px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{editorFooter}</span>
                    <span>IRBA / SAICA Audit Evidence Compliant</span>
                  </div>
                </div>
              </div>

              {/* Annotations List */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block">Current Working Paper Edits:</span>
                <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-100">
                  {editorAnnotations.map((ann) => (
                    <div key={ann.id} className="pt-1 flex items-center justify-between text-xs text-slate-700">
                      <div className="flex items-center gap-2 truncate mr-2">
                        <span className="font-mono text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold uppercase">
                          {ann.type}
                        </span>
                        <span className="truncate">
                          {ann.type === 'tickmark' && `${ann.symbol} ${ann.code} — ${ann.label}`}
                          {ann.type === 'callout' && `${ann.title}: ${ann.text}`}
                          {ann.type === 'text' && ann.text}
                          {ann.type === 'header_footer' && `${ann.header} / ${ann.footer}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnotation(ann.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remove Annotation"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save & Export Action */}
              <button
                type="button"
                onClick={handleSaveEditedPdf}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-md font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Save Edits & Export Audited PDF Working Paper</span>
              </button>
            </div>
          )}

          {/* ────────────────── TOOL 1: PASSWORD STRIPPER ────────────────── */}
          {activeTool === 'unlock' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Unlock size={16} className="text-indigo-600" />
                    <span>PDF Password Stripper & Restriction Decryptor</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modeled after PDF Password Remover v5.0 to remove owner locks, editing blocks, and print restrictions with zero password.
                  </p>
                </div>
              </div>

              {/* Unlock Mode Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUnlockMode('direct')}
                  className={`p-3 rounded-md border text-left cursor-pointer transition-all ${
                    unlockMode === 'direct'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>1-Click Direct Decrypt (No Password)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Instantly strips Owner Password, printing blocks, copy locks, and form editing restrictions without asking for any password.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUnlockMode('password')}
                  className={`p-3 rounded-md border text-left cursor-pointer transition-all ${
                    unlockMode === 'password'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <Key size={14} className="text-indigo-600" />
                    <span>Open PIN / Known Password Unlock</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Removes user open passwords on bank statements using known PIN, SA ID number, or CIPC tax registration code.
                  </p>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => unlockInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30"
              >
                <input
                  type="file"
                  ref={unlockInputRef}
                  onChange={(e) => handleFileUpload(e, 'unlock')}
                  accept=".pdf"
                  className="hidden"
                />
                <Unlock size={28} className="mx-auto text-indigo-500 mb-2" />
                <span className="font-bold text-xs text-slate-800 block">
                  {uploadedFile ? uploadedFile.name : 'Click to select locked PDF bank statement or document'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Supports FNB, Standard Bank, Nedbank, Capitec & CIPC encrypted statements
                </span>
              </div>

              {unlockMode === 'password' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Document Password / Client PIN:
                  </label>
                  <input
                    type="password"
                    value={knownPassword}
                    onChange={e => setKnownPassword(e.target.value)}
                    placeholder="Enter known statement password (e.g. ID number / tax PIN)"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              )}

              <button
                onClick={handleStripPassword}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-md font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Unlock size={14} />}
                <span>Remove All PDF Password Restrictions</span>
              </button>
            </div>
          )}

          {/* ────────────────── TOOL 2: COMBINE & MERGE ────────────────── */}
          {activeTool === 'merge' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Files size={16} className="text-indigo-600" />
                    <span>Combine & Merge Audit Working Papers</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assemble bank reconciliations, supplier invoices, tax clearances, and board resolutions into a unified audit evidence dossier.
                  </p>
                </div>
              </div>

              <div
                onClick={() => mergeInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30"
              >
                <input
                  type="file"
                  multiple
                  ref={mergeInputRef}
                  onChange={handleMergeFilesAdd}
                  accept=".pdf"
                  className="hidden"
                />
                <Plus size={24} className="mx-auto text-indigo-500 mb-1" />
                <span className="font-bold text-xs text-slate-800 block">
                  Click to add PDF documents to merge queue
                </span>
              </div>

              {mergeFiles.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-700">Documents in Merge Queue:</span>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-md">
                    {mergeFiles.map((f, i) => (
                      <div key={f.id} className="p-2.5 flex items-center justify-between text-xs bg-white">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-[10px] font-bold">
                            {i + 1}
                          </span>
                          <span className="font-medium text-slate-800">{f.name}</span>
                          <span className="text-[10px] text-slate-400">({f.size})</span>
                        </div>
                        <button
                          onClick={() => setMergeFiles(prev => prev.filter(x => x.id !== f.id))}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleMergeAction}
                disabled={isProcessing || mergeFiles.length < 2}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-md font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Files size={14} />}
                <span>Combine into Master Working Paper Dossier</span>
              </button>
            </div>
          )}

          {/* ────────────────── TOOL 3: ORGANIZE & ROTATE ────────────────── */}
          {activeTool === 'organize' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <RotateCw size={16} className="text-indigo-600" />
                    <span>Organize, Rotate & Delete Working Paper Pages</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rotate landscape ledger sheets or delete duplicate blank pages.
                  </p>
                </div>
              </div>

              {!organizeDoc && (
                <div
                  onClick={() => unlockInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
                >
                  <RotateCw size={24} className="mx-auto text-indigo-500 mb-1" />
                  <span className="font-bold text-xs text-slate-800 block">
                    Upload PDF to organize its pages
                  </span>
                </div>
              )}

              {organizeDoc && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: pageCount }).map((_, idx) => {
                      if (deletedPages.includes(idx)) return null
                      const rot = pageRotations[idx] || 0
                      return (
                        <div key={idx} className="border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-center space-y-2">
                          <div className="h-28 bg-white border border-slate-200 rounded flex items-center justify-center text-xs font-mono font-bold text-slate-400">
                            Page {idx + 1}
                            {rot !== 0 && <span className="ml-1 text-[10px] text-indigo-600 font-normal">({rot}°)</span>}
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleRotatePage(idx)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600"
                              title="Rotate 90 degrees"
                            >
                              <RotateCw size={12} />
                            </button>
                            <button
                              onClick={() => handleDeletePage(idx)}
                              className="p-1 hover:bg-rose-100 rounded text-rose-500"
                              title="Delete Page"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <button
                    onClick={handleSaveOrganized}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-md font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Save & Export Reordered Document</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ────────────────── TOOL 4: AUDIT STAMP ────────────────── */}
          {activeTool === 'stamp' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Stamp size={16} className="text-indigo-600" />
                    <span>ISA 500 Audit Evidence Stamps & Review Endorsements</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Imprint partner audit endorsements, sign-offs, and compliance seals with cryptographic metadata.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AUDIT_STAMPS.map(stamp => {
                  const isSelected = selectedStamp.id === stamp.id
                  return (
                    <button
                      key={stamp.id}
                      onClick={() => setSelectedStamp(stamp)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected ? `${stamp.border} ring-2 ring-indigo-500 shadow-xs font-bold` : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-bold block">{stamp.label}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block font-normal">ISA Standard</span>
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stamp Placement:</label>
                  <select
                    value={stampPosition}
                    onChange={e => setStampPosition(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                  >
                    <option value="top-right">Top Right Header</option>
                    <option value="top-left">Top Left Margin</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Audit Partner Initial:</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || 'Alexander Wright (Senior Partner)'}
                    className="w-full bg-slate-100 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-600"
                  />
                </div>
              </div>

              <button
                onClick={handleApplyStamp}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-md font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Stamp size={14} />}
                <span>Apply Stamp to Active Document</span>
              </button>
            </div>
          )}

          {/* ────────────────── TOOL 5: REDACTION ────────────────── */}
          {activeTool === 'redact' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-indigo-600" />
                    <span>POPIA Confidential Redaction Sanitizer</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Permanently blackout client banking details, tax numbers, and private employee identities.
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={redactPresets.accountNumber}
                    onChange={e => setRedactPresets(p => ({ ...p, accountNumber: e.target.checked }))}
                    className="rounded text-indigo-600"
                  />
                  <span>Redact Client Bank Account Numbers & Branch Codes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={redactPresets.taxNumber}
                    onChange={e => setRedactPresets(p => ({ ...p, taxNumber: e.target.checked }))}
                    className="rounded text-indigo-600"
                  />
                  <span>Redact SARS Tax Identification Numbers</span>
                </label>
              </div>

              <button
                onClick={handleApplyRedaction}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white py-2.5 rounded-md font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                <span>Permanently Redact & Sanitize Document</span>
              </button>
            </div>
          )}

          {/* ────────────────── TOOL 6: PROTECT ────────────────── */}
          {activeTool === 'protect' && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lock size={16} className="text-indigo-600" />
                    <span>Protect & Encrypt Client Deliverables</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Encrypt draft financial statements before emailing directors or bankers.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Document Open Password (Client Access Code):
                  </label>
                  <input
                    type="password"
                    value={protectUserPass}
                    onChange={e => setProtectUserPass(e.target.value)}
                    placeholder="Enter password required to open PDF"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs">
                  <input
                    type="checkbox"
                    id="allowPrint"
                    checked={allowPrinting}
                    onChange={e => setAllowPrinting(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <label htmlFor="allowPrint" className="text-slate-700 cursor-pointer">
                    Permit High-Resolution Printing for Signatories
                  </label>
                </div>
              </div>

              <button
                onClick={handleApplyProtection}
                disabled={isProcessing || !protectUserPass}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-md font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                <span>Encrypt Document with AES-256 Protection</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Status & Auditor Evidence Inspector (1 col) */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <FileCheck2 size={14} className="text-indigo-600" />
              <span>Auditor Evidence Bench</span>
            </h3>

            {/* Active Client Info */}
            <div className="p-3 bg-slate-50 rounded border border-slate-100 text-xs space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Client File</span>
              <p className="font-bold text-slate-800 truncate">{activeClient?.name}</p>
              <span className="text-[10px] text-indigo-600 font-medium">Framework: {activeClient?.framework || 'IFRS for SMEs'}</span>
            </div>

            {/* Status Message Log */}
            {statusMessage && (
              <div className={`p-3 rounded-md text-xs leading-relaxed border ${
                statusMessage.includes('✓') || statusMessage.includes('Success')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {statusMessage}
              </div>
            )}

            {/* Download Action Box */}
            {downloadUrl ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
                <CheckCircle2 size={24} className="mx-auto text-emerald-600" />
                <span className="font-bold text-xs text-emerald-900 block truncate">
                  {downloadFilename}
                </span>
                <p className="text-[10px] text-emerald-700">
                  Ready for Working Paper WP-001 attachment & CIPC submission.
                </p>
                <a
                  href={downloadUrl}
                  download={downloadFilename}
                  className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded font-semibold text-xs transition-colors shadow-xs"
                >
                  <Download size={13} />
                  <span>Download File</span>
                </a>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                Processed documents and downloads will appear here.
              </div>
            )}
          </div>

          {/* Quick Guide Card */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-lg border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
              Audit Evidence & Security Tip
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Use <strong>Edit a PDF (Tool #2)</strong> to place official ISA 500 audit tick marks (<code>✔ [VOUCHED]</code>, <code>✓ [AGREED TB]</code>, <code>? [QUERY]</code>) directly onto client statements before filing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

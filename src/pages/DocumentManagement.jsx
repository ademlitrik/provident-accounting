import { useState, useRef } from 'react'
import {
  Folder, Upload, FileText, Search, Sparkles,
  CheckCircle, Clock, Trash2, Eye, Filter, ShieldCheck, X, Download
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useAccountingStore } from '@/store/accountingStore'

export default function DocumentManagement() {
  const documents = useAccountingStore(s => s.documents)
  const addDocument = useAccountingStore(s => s.addDocument)
  const deleteDocument = useAccountingStore(s => s.deleteDocument)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)

  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  const [search, setSearch] = useState('')
  const [selectedDocId, setSelectedDocId] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [previewModalDoc, setPreviewModalDoc] = useState(null)

  const fileInputRef = useRef(null)
  const theme = useAppStore(s => s.theme)
  const isDark = theme === 'Dark Gray' || theme === 'Black'

  // Filter documents by active client, or fallback to all if none explicitly tagged
  const clientDocs = documents.filter(d => !d.clientId || d.clientId === activeClientId)
  const filtered = clientDocs.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.category && d.category.toLowerCase().includes(search.toLowerCase())) ||
    (d.wpRef && d.wpRef.toLowerCase().includes(search.toLowerCase()))
  )

  const selectedDoc = filtered.find(d => d.id === selectedDocId) || filtered[0] || null

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    const isPdf = file.name.endsWith('.pdf')
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB'

    setTimeout(() => {
      const newDoc = {
        name: file.name,
        type: isPdf ? 'PDF' : 'Image',
        size: sizeMb,
        category: 'Audit Evidence',
        wpRef: 'WP-001',
        ocrStatus: 'Processed',
        extracted: `Extracted from ${file.name}: Verified digital signatures, checksum validated. Document hash: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      }
      const created = addDocument(newDoc)
      setSelectedDocId(created.id)
      setIsScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }, 1000)
  }

  const handleSimulateScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      const newDoc = {
        name: `Vendor_Equipment_Invoice_${Math.floor(1000 + Math.random() * 9000)}.pdf`,
        type: 'PDF',
        size: '1.2 MB',
        category: 'Invoices & Receipts',
        wpRef: 'WP-004',
        ocrStatus: 'Processed',
        extracted: 'Supplier: Dell Technologies Africa | Total: R 45,800.00 | VAT: R 6,870.00 | Asset Class: IT Infrastructure'
      }
      const created = addDocument(newDoc)
      setSelectedDocId(created.id)
      setIsScanning(false)
    }, 1000)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    deleteDocument(id)
    if (selectedDocId === id) {
      setSelectedDocId(null)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6" style={{ userSelect: 'text' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b"
           style={{ borderColor: isDark ? '#333339' : '#E5E7EB' }}>
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Engagement Documents</span>
            <span>/</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{activeClient?.name}</span>
            <span>/</span>
            <span className="text-[#5B5FC7]">Audit Evidence & OCR</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Document Repository & AI OCR Scanner
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Upload size={13} />
            <span>Upload File</span>
          </button>
          <button
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 bg-[#5B5FC7] hover:bg-[#4A4EB5] disabled:opacity-50 text-white px-3.5 py-1.5 rounded text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles size={13} />
            <span>{isScanning ? 'Processing OCR...' : 'AI Sample Invoice'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Document List */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search documents, working paper references, or categories..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5FC7]"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
                <tr>
                  <th className="text-left p-3">Document Title</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-center p-3">WP Ref</th>
                  <th className="text-center p-3">OCR Status</th>
                  <th className="text-right p-3">File Size</th>
                  <th className="text-right p-3 w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(doc => {
                  const isSelected = selectedDoc?.id === doc.id
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#5B5FC7]/10 dark:bg-[#5B5FC7]/20 font-medium'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="p-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <FileText size={15} className="text-[#5B5FC7] shrink-0" />
                        <span className="truncate max-w-[240px]">{doc.name}</span>
                      </td>
                      <td className="p-3 text-slate-500">{doc.category || 'General'}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {doc.wpRef || '—'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded">
                          <CheckCircle size={10} />
                          {doc.ocrStatus || 'Verified'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-400">{doc.size || '1.0 MB'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => handleDelete(doc.id, e)}
                          title="Delete Evidence"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No audit documents found for {activeClient?.name}. Upload or generate a sample above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Document Details & Gemini OCR Preview */}
        <div className="bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
              Audit Evidence Inspector
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{selectedDoc?.id || '—'}</span>
          </div>

          {selectedDoc ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Filename</span>
                <p className="font-semibold text-slate-900 dark:text-slate-100 break-words">{selectedDoc.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block">Lead Schedule Ref</span>
                  <span className="font-bold text-[#5B5FC7]">{selectedDoc.wpRef || 'WP-001'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Upload Date</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedDoc.date || '2024-10-28'}</span>
                </div>
              </div>

              {/* Gemini Extracted Data Block */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={13} />
                  <span>AI Extracted Key Fields (OCR)</span>
                </div>
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded font-mono text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed">
                  {selectedDoc.extracted}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewModalDoc(selectedDoc)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#5B5FC7] hover:bg-[#4A4EB5] text-white py-1.5 rounded text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Preview Evidence</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a file to inspect OCR metadata
            </div>
          )}
        </div>
      </div>

      {/* Modal: Document Evidence Preview */}
      {previewModalDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E22] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <FileText className="text-[#5B5FC7]" size={18} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">
                  {previewModalDoc.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalDoc(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span>Working Paper: <strong>{previewModalDoc.wpRef}</strong></span>
                <span>Category: <strong>{previewModalDoc.category}</strong></span>
                <span>Status: <strong className="text-emerald-600">{previewModalDoc.ocrStatus}</strong></span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-sans font-semibold text-slate-700 dark:text-slate-300">
                  Extracted Document Content:
                </span>
                <p className="p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                  {previewModalDoc.extracted}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
              >
                Print Evidence
              </button>
              <button
                type="button"
                onClick={() => setPreviewModalDoc(null)}
                className="px-4 py-1.5 bg-[#5B5FC7] hover:bg-[#4A4EB5] text-white text-xs font-semibold rounded shadow-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useRef } from 'react'
import {
  FilePlus2, FolderOpen, Upload, Save, FileDown,
  Download, Printer, ChevronDown, CheckCircle2,
  FolderSync, FileSpreadsheet, FileText, Table, HardDrive
} from 'lucide-react'
import { openClientFolderInExplorer } from '@/utils/clientStorage'

/**
 * Universal File Action Bar for all accounting, audit, and document modules.
 * Provides instant access to New, Open, Import, Save, Save As, Export (Excel/PDF/Word/CSV), Download, Print.
 */
export default function FileActionBar({
  title,
  clientName,
  onNew,
  onOpen,
  onImport,
  onSave,
  onSaveAs,
  onExportPdf,
  onExportExcel,
  onExportWord,
  onExportCsv,
  onDownload,
  onPrint,
  saveStatus,
  subFolder = '',
  extraActions
}) {
  const [showExportMenu, setShowExportMenu] = useState(false)
  const fileInputRef = useRef(null)

  const handleImportClick = () => {
    if (onImport) {
      if (typeof onImport === 'function') {
        fileInputRef.current?.click()
      }
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0 && onImport) {
      onImport(e.target.files[0], e)
      e.target.value = ''
    }
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  const handleOpenFolder = () => {
    if (clientName) {
      openClientFolderInExplorer(clientName, subFolder)
    } else {
      openClientFolderInExplorer('')
    }
  }

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-2 px-3 mb-4 flex flex-wrap items-center justify-between gap-2 shadow-xs print:hidden select-none">
      {/* Hidden file input for quick import */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Left side: Context badge & Quick File Operations */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {title && (
          <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 mr-1">
            {title}
          </span>
        )}

        {/* New Document */}
        {onNew && (
          <button
            type="button"
            onClick={onNew}
            title="Create New Document (Ctrl+N)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 hover:text-indigo-600 border border-slate-200 rounded transition-colors shadow-2xs cursor-pointer"
          >
            <FilePlus2 size={13} className="text-indigo-500" />
            <span>New</span>
          </button>
        )}

        {/* Open File */}
        {onOpen && (
          <button
            type="button"
            onClick={onOpen}
            title="Open Existing File (Ctrl+O)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 hover:text-indigo-600 border border-slate-200 rounded transition-colors shadow-2xs cursor-pointer"
          >
            <FolderOpen size={13} className="text-amber-500" />
            <span>Open</span>
          </button>
        )}

        {/* Import */}
        {onImport && (
          <button
            type="button"
            onClick={handleImportClick}
            title="Import Data / File"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 hover:text-indigo-600 border border-slate-200 rounded transition-colors shadow-2xs cursor-pointer"
          >
            <Upload size={13} className="text-blue-500" />
            <span>Import</span>
          </button>
        )}

        {/* Save */}
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            title="Save to Client Folder (Ctrl+S)"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 rounded transition-colors shadow-xs cursor-pointer"
          >
            <Save size={13} />
            <span>Save</span>
          </button>
        )}

        {/* Save As */}
        {onSaveAs && (
          <button
            type="button"
            onClick={onSaveAs}
            title="Save As New File"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors shadow-2xs cursor-pointer"
          >
            <Save size={13} className="text-slate-500" />
            <span>Save As</span>
          </button>
        )}

        {/* Export Dropdown */}
        {(onExportPdf || onExportExcel || onExportWord || onExportCsv) && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors shadow-2xs cursor-pointer"
            >
              <FileDown size={13} className="text-emerald-600" />
              <span>Export</span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute left-0 mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 text-xs divide-y divide-slate-100">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Export Formats
                  </div>

                  {onExportExcel && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false)
                        onExportExcel()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <FileSpreadsheet size={15} className="text-emerald-600" />
                      <div>
                        <span className="font-medium block">Microsoft Excel (.xlsx)</span>
                        <span className="text-[10px] text-slate-400">Structured multi-sheet workbook</span>
                      </div>
                    </button>
                  )}

                  {onExportPdf && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false)
                        onExportPdf()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <FileText size={15} className="text-rose-600" />
                      <div>
                        <span className="font-medium block">Portable Document (.pdf)</span>
                        <span className="text-[10px] text-slate-400">Official statutory format</span>
                      </div>
                    </button>
                  )}

                  {onExportWord && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false)
                        onExportWord()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <FileText size={15} className="text-blue-600" />
                      <div>
                        <span className="font-medium block">Microsoft Word (.doc)</span>
                        <span className="text-[10px] text-slate-400">Editable Office document</span>
                      </div>
                    </button>
                  )}

                  {onExportCsv && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportMenu(false)
                        onExportCsv()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Table size={15} className="text-orange-500" />
                      <div>
                        <span className="font-medium block">Comma-Separated (.csv)</span>
                        <span className="text-[10px] text-slate-400">Raw tabular export</span>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Download */}
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            title="Download Document"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={13} className="text-slate-600" />
            <span>Download</span>
          </button>
        )}

        {/* Print */}
        <button
          type="button"
          onClick={handlePrint}
          title="Print Document (Ctrl+P)"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors shadow-2xs cursor-pointer"
        >
          <Printer size={13} className="text-slate-600" />
          <span>Print</span>
        </button>

        {extraActions}
      </div>

      {/* Right side: Client Folder indicator & Status */}
      <div className="flex items-center gap-2">
        {saveStatus && (
          <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            <CheckCircle2 size={12} className="text-emerald-600" />
            {saveStatus}
          </span>
        )}

        {clientName && (
          <button
            type="button"
            onClick={handleOpenFolder}
            title={`Open physical folder for ${clientName} on disk`}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-indigo-600 border border-slate-200 rounded transition-colors cursor-pointer"
          >
            <HardDrive size={13} className="text-indigo-600" />
            <span className="truncate max-w-[140px]">{clientName}</span>
          </button>
        )}
      </div>
    </div>
  )
}

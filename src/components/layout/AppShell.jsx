import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import TitleBar from './TitleBar'
import Sidebar from './Sidebar'
import AboutModal from '@/components/common/AboutModal'
import { Database, ShieldCheck, Info } from 'lucide-react'
import afrovisionLogo from '@/assets/afrovision_logo.png'
import { useAccountingStore } from '@/store/accountingStore'

export default function AppShell() {
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const navigate = useNavigate()
  const restoreFileInputRef = useRef(null)

  const activeClientId = useAccountingStore(s => s.activeClientId)
  const setActiveClientId = useAccountingStore(s => s.setActiveClientId)
  const exportEngagementBackup = useAccountingStore(s => s.exportEngagementBackup)
  const restoreEngagementBackup = useAccountingStore(s => s.restoreEngagementBackup)
  const rollForwardYear = useAccountingStore(s => s.rollForwardYear)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const handleRestoreFileSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      restoreEngagementBackup(json)
      showToast(`✓ Engagement "${json.client?.name || 'File'}" successfully restored!`)
    } catch (err) {
      showToast(`Restore Error: ${err.message}`)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.provident) {
      if (window.provident.onMenuNavigate) {
        window.provident.onMenuNavigate((route) => {
          navigate(route)
        })
      }
      if (window.provident.onMenuLoadClient) {
        window.provident.onMenuLoadClient((clientId) => {
          setActiveClientId(clientId)
          showToast(`✓ Switched active engagement file (Client ID: ${clientId})`)
        })
      }
      if (window.provident.onMenuAction) {
        window.provident.onMenuAction((action) => {
          if (action === 'about') {
            setIsAboutOpen(true)
          } else if (action === 'backup') {
            exportEngagementBackup(activeClientId)
            showToast('✓ Engagement Backup (.pvd) exported successfully.')
          } else if (action === 'restore') {
            restoreFileInputRef.current?.click()
          } else if (action === 'roll-forward') {
            const res = rollForwardYear()
            if (res) {
              showToast(`✓ Rolled forward ${res.clientName} to FY ${res.newFyEnd}! Net profit allocated.`)
            }
          }
        })
      }
    }
  }, [navigate, activeClientId, setActiveClientId, exportEngagementBackup, rollForwardYear])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 antialiased print:h-auto print:w-full print:overflow-visible print:bg-white">
      <div className="print:hidden">
        <TitleBar onOpenAbout={() => setIsAboutOpen(true)} />
      </div>
      <div className="flex flex-1 overflow-hidden relative print:h-auto print:overflow-visible print:block">
        <div className="print:hidden">
          <Sidebar onOpenAbout={() => setIsAboutOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto bg-slate-50/70 p-4 flex flex-col min-h-0 print:p-0 print:bg-white print:overflow-visible print:h-auto print:block">
          <Outlet />
        </main>
      </div>

      {/* Application Bottom Status Bar & Developer Accreditation */}
      <footer className="h-6 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 px-3 flex items-center justify-between shrink-0 select-none z-30 print:hidden">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Database size={11} className="text-slate-400" />
            <span className="text-[10px] font-medium">Local SQLite Sync Active</span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Companies Act 71 of 2008 · IRBA & SAICA ISQM 1
          </span>
        </div>

        {/* Developer Accreditation with Afro Vision Media icon */}
        <button
          onClick={() => setIsAboutOpen(true)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer group py-0.5 px-1.5 rounded hover:bg-slate-800"
          title="Designed, developed, and implemented by Tanyaradzwa Livingstone Bvute under Afro Vision Media for Provident Financial Consultants"
        >
          <span className="text-[10px] text-slate-400 group-hover:text-slate-300">Developed by</span>
          <img
            src={afrovisionLogo}
            alt="Afro Vision Media"
            className="h-3 w-auto object-contain shrink-0"
          />
          <span className="text-[10px] font-semibold text-slate-300 group-hover:text-indigo-400">
            Afro Vision Media
          </span>
          <Info size={11} className="text-slate-500 group-hover:text-slate-300 ml-0.5" />
        </button>
      </footer>

      {/* Hidden Restore File Input for native menu or toolbar */}
      <input
        type="file"
        ref={restoreFileInputRef}
        onChange={handleRestoreFileSelected}
        accept=".pvd,.json"
        className="hidden"
      />

      {/* System Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-6 z-50 bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Global About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  )
}

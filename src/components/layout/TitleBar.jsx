import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Bell, ChevronDown, ChevronRight, Check, Info, Settings as SettingsIcon,
  LogOut, Building2, FolderOpen, Save, Scale, FileText, ClipboardList,
  FileCode, Key, Calculator, Clock, HelpCircle, Laptop, ShieldCheck, Printer,
  FileEdit, History, Download, Upload, RefreshCw, ZoomIn, ZoomOut, Maximize2,
  ExternalLink, Code2, Globe, Shield
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAccountingStore } from '@/store/accountingStore'
import providentLogo from '@/assets/provident_logo_raw.png'

export default function TitleBar({ onOpenAbout }) {
  const navigate = useNavigate()
  const firm = useAuthStore(s => s.firm)
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)

  const clients = useAccountingStore(s => s.clients)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const setActiveClientId = useAccountingStore(s => s.setActiveClientId)
  const recentEngagements = useAccountingStore(s => s.recentEngagements) || []
  const recentDocuments = useAccountingStore(s => s.recentDocuments) || []
  const exportEngagementBackup = useAccountingStore(s => s.exportEngagementBackup)
  const restoreEngagementBackup = useAccountingStore(s => s.restoreEngagementBackup)
  const rollForwardYear = useAccountingStore(s => s.rollForwardYear)

  // Top Menu Bar state
  const [activeMenu, setActiveMenu] = useState(null) // 'file', 'edit', 'view', 'engagement', 'statutory', 'tools', 'help'
  const [activeSubmenu, setActiveSubmenu] = useState(null) // 'recent-engagements', 'recent-docs'
  
  // Entity & Profile Dropdowns
  const [isEntityMenuOpen, setIsEntityMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [bannerAlert, setBannerAlert] = useState('')

  const fileInputRef = useRef(null)
  const headerRef = useRef(null)

  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  const showBanner = (msg) => {
    setBannerAlert(msg)
    setTimeout(() => setBannerAlert(''), 3000)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveMenu(null)
        setActiveSubmenu(null)
        setIsEntityMenuOpen(false)
        setIsNotificationOpen(false)
        setIsUserMenuOpen(false)
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = (e) => {
    const q = e.target.value
    setSearchQuery(q)
    if (!q.trim()) {
      setSearchResults([])
      setIsSearchOpen(false)
      return
    }
    const qLower = q.toLowerCase()
    const results = []

    clients.forEach(c => {
      if (c.name.toLowerCase().includes(qLower)) {
        results.push({ type: 'Client', title: c.name, link: '/clients', sub: c.location, action: () => setActiveClientId(c.id) })
      }
    })

    const routes = [
      { type: 'Tool', title: 'Edit a PDF / Document Editor', link: '/unlock-pdf?tab=edit', sub: 'Annotate, tick marks & reviewer notes' },
      { type: 'Navigation', title: 'Chart of Accounts', link: '/accounts', sub: 'Master COA & balances' },
      { type: 'Navigation', title: 'General Ledger', link: '/ledger', sub: 'Journal entries & adjustments' },
      { type: 'Navigation', title: 'Financial Statements (IFRS)', link: '/financials', sub: 'Balance Sheet & P&L' },
      { type: 'Navigation', title: 'Audit Working Papers (Probe MMX)', link: '/working-papers', sub: 'ISA 230 lead schedules' },
      { type: 'Navigation', title: 'CIPC iXBRL E-Filing', link: '/cipc-ixbrl', sub: 'Taxonomy validator' },
      { type: 'Navigation', title: 'SA Audit Scoping & PIS', link: '/sa-audit', sub: 'Companies Act PIS calculator' },
      { type: 'Navigation', title: 'Audit PDF Studio & Stripper', link: '/unlock-pdf', sub: 'Unlock, combine & stamp statements' },
      { type: 'Navigation', title: 'ISA 210 Client Acceptance', link: '/acceptance', sub: 'Independence & engagement letter' },
      { type: 'Navigation', title: 'Practice Management & Timesheets', link: '/practice', sub: 'Hours, WIP & fee billing' },
      { type: 'Navigation', title: 'Settings & Firm Preferences', link: '/settings', sub: 'Currency & practice details' }
    ]
    routes.forEach(r => {
      if (r.title.toLowerCase().includes(qLower) || r.sub.toLowerCase().includes(qLower)) {
        results.push(r)
      }
    })

    setSearchResults(results)
    setIsSearchOpen(true)
  }

  const handleBackup = () => {
    exportEngagementBackup(activeClientId)
    showBanner('✓ Engagement File (.pvd) Exported')
    setActiveMenu(null)
  }

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      restoreEngagementBackup(json)
      showBanner(`✓ Engagement "${json.client?.name || 'File'}" Restored!`)
    } catch (err) {
      showBanner(`Error: ${err.message}`)
    }
    setActiveMenu(null)
  }

  const handleRollForward = () => {
    const res = rollForwardYear()
    if (res) {
      showBanner(`✓ Rolled forward ${res.clientName} to FY ${res.newFyEnd}`)
    }
    setActiveMenu(null)
  }

  return (
    <div ref={headerRef} className="shrink-0 flex flex-col select-none text-slate-800 bg-white border-b border-slate-200 z-40 relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleRestoreFile}
        accept=".pvd,.json"
        className="hidden"
      />

      {/* ── UNIFIED COMMAND BAR: Clean Logo, Entity Selector, Quick Actions, Search & Profile ── */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 text-slate-300 gap-3">
        {/* Left: Official Provident Logo & Client Entity Selector */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="flex items-center gap-2 cursor-pointer py-1 px-1 rounded hover:bg-slate-800/80 transition-colors"
            onClick={() => navigate('/dashboard')}
            title="Provident Accounting & Audit — Go to Dashboard"
          >
            <img
              src={providentLogo}
              alt="Provident Accounting"
              className="h-5 w-auto object-contain shrink-0"
            />
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-tight text-white">Provident</span>
              <span className="text-[9px] bg-indigo-500/30 text-indigo-300 px-1 py-0.2 rounded font-mono font-bold">DESKTOP</span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* Active Client Entity Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsEntityMenuOpen(!isEntityMenuOpen)
                setIsNotificationOpen(false)
                setIsUserMenuOpen(false)
                setActiveMenu(null)
              }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              <Building2 size={12} className="text-indigo-400 shrink-0" />
              <span className="font-semibold text-white truncate max-w-[170px]">
                {activeClient?.name || 'Select Client Entity'}
              </span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {isEntityMenuOpen && (
              <div className="absolute left-0 mt-1 w-72 bg-white rounded-md shadow-2xl border border-slate-200 py-1 text-slate-800 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 font-bold text-[10px] uppercase text-slate-400 tracking-wider">
                  Switch Active Audit Client
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {clients.map(c => {
                    const isCurrent = c.id === activeClient?.id
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveClientId(c.id)
                          setIsEntityMenuOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                          isCurrent ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <span className="block truncate">{c.name}</span>
                          <span className="text-[10px] text-slate-400 block">{c.location}</span>
                        </div>
                        {isCurrent && <Check size={14} className="text-indigo-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
                <div className="p-2 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => {
                      setIsEntityMenuOpen(false)
                      navigate('/clients')
                    }}
                    className="w-full text-center py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Manage All Client Files
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-sm mx-2 relative hidden md:block">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search clients, working papers, accounts (Ctrl+K)..."
              className="w-full bg-slate-800 border border-slate-700 rounded text-xs pl-8 pr-3 py-0.5 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white rounded-md shadow-2xl border border-slate-200 py-1 text-slate-800 z-50 text-xs max-h-72 overflow-y-auto">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    r.action?.()
                    navigate(r.link)
                    setIsSearchOpen(false)
                    setSearchQuery('')
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">{r.title}</span>
                    <span className="text-[10px] text-slate-400 block">{r.sub}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {r.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Notifications, Save Indicator & User Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {bannerAlert && (
            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-700/60 px-2 py-0.5 rounded animate-in fade-in">
              {bannerAlert}
            </span>
          )}

          {/* User Profile Capsule */}
          <div className="relative">
            <div
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen)
                setIsNotificationOpen(false)
                setIsEntityMenuOpen(false)
                setActiveMenu(null)
              }}
              className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <span className="text-xs text-slate-200 font-medium">{user?.name?.split(' ')[0] ?? 'Auditor'}</span>
              <ChevronDown size={11} className="text-slate-400" />
            </div>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-2xl border border-slate-200 py-1 text-slate-800 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 block">{user?.name || 'Alexander Wright'}</span>
                  <span className="text-[10px] text-slate-500 block">{user?.email || 'admin@provident.com'}</span>
                  <span className="text-[9px] text-indigo-600 font-medium block mt-0.5">{user?.role || 'Senior Audit Partner'}</span>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      navigate('/settings')
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                  >
                    <SettingsIcon size={13} className="text-slate-400" />
                    <span>Practice Settings & Preferences</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      onOpenAbout?.()
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                  >
                    <Info size={13} className="text-indigo-500" />
                    <span>About & Developer Credits</span>
                  </button>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false)
                      logout()
                      navigate('/login')
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-medium"
                  >
                    <LogOut size={13} className="text-rose-500" />
                    <span>Sign Out Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DESKTOP WINDOWS MENU BAR: File, Edit, View, Engagement, Statutory, Tools, Help ── */}
      <div className="h-6 bg-slate-200/90 border-b border-slate-300 flex items-center px-2 text-[11px] font-medium text-slate-700 gap-0.5 relative z-30">
        
        {/* 1. FILE MENU */}
        <div className="relative">
          <button
            onClick={() => {
              setActiveMenu(activeMenu === 'file' ? null : 'file')
              setActiveSubmenu(null)
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${activeMenu === 'file' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-300/80'}`}
          >
            File
          </button>

          {activeMenu === 'file' && (
            <div className="absolute left-0 mt-0.5 w-64 bg-white rounded-md shadow-2xl border border-slate-200 py-1 text-slate-800 z-50 text-xs">
              <button
                onClick={() => { navigate('/clients'); setActiveMenu(null) }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>New Engagement File...</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+N</span>
              </button>
              <button
                onClick={() => { navigate('/clients'); setActiveMenu(null) }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Open Engagement...</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+O</span>
              </button>
              <button
                onClick={() => { showBanner('✓ Engagement File Saved'); setActiveMenu(null) }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Save Engagement Data</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              {/* Submenu: Recent Engagements */}
              <div
                className="relative"
                onMouseEnter={() => setActiveSubmenu('recent-engagements')}
              >
                <div className="px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <History size={12} className="text-indigo-600" />
                    <span className="font-semibold">Recent Engagements</span>
                  </div>
                  <ChevronRight size={12} className="text-slate-400" />
                </div>

                {activeSubmenu === 'recent-engagements' && (
                  <div className="absolute left-full top-0 ml-0.5 w-64 bg-white rounded-md shadow-2xl border border-slate-200 py-1 text-xs z-50">
                    <div className="px-3 py-1 text-[9px] font-bold uppercase text-slate-400 border-b border-slate-100">
                      Recent Client Engagements
                    </div>
                    {recentEngagements.map((re, idx) => (
                      <button
                        key={re.id || idx}
                        onClick={() => {
                          setActiveClientId(re.id)
                          showBanner(`✓ Switched to ${re.name}`)
                          setActiveMenu(null)
                          setActiveSubmenu(null)
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-indigo-50 flex items-center justify-between ${re.id === activeClientId ? 'bg-indigo-50/60 font-semibold text-indigo-700' : 'text-slate-700'}`}
                      >
                        <div className="truncate mr-2">
                          <span className="block truncate">{re.name}</span>
                          <span className="text-[9px] text-slate-400 block">{re.lastOpened || re.location}</span>
                        </div>
                        {re.id === activeClientId && <Check size={12} className="text-indigo-600 shrink-0" />}
                      </button>
                    ))}
                    <div className="p-1 border-t border-slate-100">
                      <button
                        onClick={() => { navigate('/clients'); setActiveMenu(null) }}
                        className="w-full text-center py-1 text-[11px] text-indigo-600 hover:underline"
                      >
                        All Engagements...
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submenu: Recent Documents */}
              <div
                className="relative"
                onMouseEnter={() => setActiveSubmenu('recent-docs')}
              >
                <div className="px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <FileText size={12} className="text-amber-600" />
                    <span className="font-semibold">Recent Documents & Papers</span>
                  </div>
                  <ChevronRight size={12} className="text-slate-400" />
                </div>

                {activeSubmenu === 'recent-docs' && (
                  <div className="absolute left-full top-6 ml-0.5 w-72 bg-white rounded-md shadow-2xl border border-slate-200 py-1 text-xs z-50">
                    <div className="px-3 py-1 text-[9px] font-bold uppercase text-slate-400 border-b border-slate-100">
                      Recent Working Papers & Statements
                    </div>
                    {recentDocuments.map((rd, idx) => (
                      <button
                        key={rd.id || idx}
                        onClick={() => {
                          navigate('/unlock-pdf?tab=edit')
                          showBanner(`✓ Opened ${rd.name} in PDF Editor`)
                          setActiveMenu(null)
                          setActiveSubmenu(null)
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-amber-50 flex items-center justify-between text-slate-700"
                      >
                        <div className="truncate mr-2">
                          <span className="block truncate font-medium text-slate-900">{rd.name}</span>
                          <span className="text-[9px] text-slate-400 block">{rd.type} · {rd.wpRef || rd.size}</span>
                        </div>
                        <FileEdit size={12} className="text-indigo-600 shrink-0" />
                      </button>
                    ))}
                    <div className="p-1 border-t border-slate-100 flex items-center justify-between px-2">
                      <button
                        onClick={() => { navigate('/documents'); setActiveMenu(null) }}
                        className="text-[10px] text-slate-600 hover:text-indigo-600"
                      >
                        Document Cabinet
                      </button>
                      <button
                        onClick={() => { navigate('/unlock-pdf?tab=edit'); setActiveMenu(null) }}
                        className="text-[10px] font-semibold text-indigo-600 hover:underline"
                      >
                        PDF Document Editor
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={handleBackup}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 text-slate-700"
              >
                <Download size={13} className="text-emerald-600" />
                <span>Backup Engagement File (.pvd)...</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 text-slate-700"
              >
                <Upload size={13} className="text-blue-600" />
                <span>Restore Engagement File (.pvd)...</span>
              </button>
              <button
                onClick={handleRollForward}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 text-slate-700"
              >
                <RefreshCw size={13} className="text-purple-600" />
                <span>Roll Forward to Next FY...</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => { navigate('/trial-balance'); setActiveMenu(null) }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Import Trial Balance (CSV / Excel)...</span>
              </button>
              <button
                onClick={() => { navigate('/financials'); setActiveMenu(null) }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Export Financial Statements (PDF)...</span>
              </button>
              <button
                onClick={() => { navigate('/cipc-ixbrl'); setActiveMenu(null) }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Export CIPC iXBRL (.xhtml)...</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => { window.print(); setActiveMenu(null) }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Print Schedule / Working Paper...</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+P</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. EDIT MENU */}
        <div className="relative">
          <button
            onClick={() => {
              setActiveMenu(activeMenu === 'edit' ? null : 'edit')
              setActiveSubmenu(null)
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${activeMenu === 'edit' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-300/80'}`}
          >
            Edit
          </button>

          {activeMenu === 'edit' && (
            <div className="absolute left-0 mt-0.5 w-52 bg-white rounded-md shadow-2xl border border-slate-200 py-1 text-slate-800 z-50 text-xs">
              <button onClick={() => { document.execCommand('undo'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between">
                <span>Undo</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+Z</span>
              </button>
              <button onClick={() => { document.execCommand('redo'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between">
                <span>Redo</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+Y</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button onClick={() => { document.execCommand('cut'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between">
                <span>Cut</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+X</span>
              </button>
              <button onClick={() => { document.execCommand('copy'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between">
                <span>Copy</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+C</span>
              </button>
              <button onClick={() => { document.execCommand('selectAll'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between">
                <span>Select All</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+A</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. VIEW MENU */}
        <div className="relative">
          <button
            onClick={() => {
              setActiveMenu(activeMenu === 'view' ? null : 'view')
              setActiveSubmenu(null)
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${activeMenu === 'view' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-300/80'}`}
          >
            View
          </button>

          {activeMenu === 'view' && (
            <div className="absolute left-0 mt-0.5 w-60 bg-white rounded-md shadow-2xl border border-slate-200 py-1 text-slate-800 z-50 text-xs">
              <button onClick={() => { navigate('/dashboard'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Overview Dashboard</button>
              <button onClick={() => { navigate('/accounts'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Chart of Accounts</button>
              <button onClick={() => { navigate('/ledger'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">General Ledger</button>
              <button onClick={() => { navigate('/trial-balance'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Trial Balance Sheet</button>
              <button onClick={() => { navigate('/bank-recon'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">Bank Reconciliation</button>
              <div className="border-t border-slate-100 my-1" />
              <button onClick={() => { document.body.style.zoom = '100%'; setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between">
                <span>Actual Size (100%)</span>
              </button>
              <button onClick={() => { document.body.style.zoom = '125%'; setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between">
                <span>Zoom In (125%)</span>
              </button>
              <button onClick={() => { document.body.style.zoom = '90%'; setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between">
                <span>Zoom Out (90%)</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. ENGAGEMENT MENU */}
        <div className="relative">
          <button
            onClick={() => {
              setActiveMenu(activeMenu === 'engagement' ? null : 'engagement')
              setActiveSubmenu(null)
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${activeMenu === 'engagement' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-300/80'}`}
          >
            Engagement
          </button>

          {activeMenu === 'engagement' && (
            <div className="absolute left-0 mt-0.5 w-72 bg-white rounded-md shadow-2xl border border-slate-200 py-1 text-slate-800 z-50 text-xs">
              <button onClick={() => { navigate('/acceptance'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                ISA 210 Client Acceptance & Independence
              </button>
              <button onClick={() => { navigate('/sa-audit'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                SA Audit Scoping & PIS Calculator (Companies Act)
              </button>
              <button onClick={() => { navigate('/working-papers'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                Probe MMX Lead Schedules (ISA 230)
              </button>
              <button onClick={() => { navigate('/sampling'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                ISA 530 Substantive Audit Sampling
              </button>
              <button onClick={() => { navigate('/practice'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                Practice Timesheet & WIP Billing
              </button>
            </div>
          )}
        </div>

        {/* 5. STATUTORY & TAX */}
        <div className="relative">
          <button
            onClick={() => {
              setActiveMenu(activeMenu === 'statutory' ? null : 'statutory')
              setActiveSubmenu(null)
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${activeMenu === 'statutory' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-300/80'}`}
          >
            Statutory & Tax
          </button>

          {activeMenu === 'statutory' && (
            <div className="absolute left-0 mt-0.5 w-64 bg-white rounded-md shadow-2xl border border-slate-200 py-1 text-slate-800 z-50 text-xs">
              <button onClick={() => { navigate('/financials'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                Annual Financial Statements (IFRS / SME)
              </button>
              <button onClick={() => { navigate('/tax'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                SARS Corporate Income Tax (CIT 27%)
              </button>
              <button onClick={() => { navigate('/cipc-ixbrl'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                CIPC iXBRL E-Filing Validation
              </button>
              <button onClick={() => { navigate('/documents'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                Evidence OCR & Document Cabinet
              </button>
              <button onClick={() => { navigate('/unlock-pdf'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                PDF Password Stripper & Security
              </button>
            </div>
          )}
        </div>

        {/* 6. TOOLS MENU */}
        <div className="relative">
          <button
            onClick={() => {
              setActiveMenu(activeMenu === 'tools' ? null : 'tools')
              setActiveSubmenu(null)
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${activeMenu === 'tools' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-300/80'}`}
          >
            Tools
          </button>

          {activeMenu === 'tools' && (
            <div className="absolute left-0 mt-0.5 w-64 bg-white rounded-md shadow-2xl border border-slate-200 py-1 text-slate-800 z-50 text-xs">
              <button
                onClick={() => { navigate('/unlock-pdf?tab=edit'); setActiveMenu(null) }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 font-semibold text-indigo-700 flex items-center gap-2"
              >
                <FileEdit size={13} className="text-indigo-600" />
                <span>PDF Document Editor & Annotator</span>
              </button>
              <button onClick={() => { navigate('/migrate'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                External File Migration Hub (.cwp)
              </button>
              <button onClick={() => { navigate('/security'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                ISQM 1 Security & Compliance Center
              </button>
              <button onClick={() => { navigate('/settings'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                Practice Settings & Firm Preferences
              </button>
            </div>
          )}
        </div>

        {/* 7. HELP MENU */}
        <div className="relative">
          <button
            onClick={() => {
              setActiveMenu(activeMenu === 'help' ? null : 'help')
              setActiveSubmenu(null)
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${activeMenu === 'help' ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-300/80'}`}
          >
            Help
          </button>

          {activeMenu === 'help' && (
            <div className="absolute left-0 mt-0.5 w-72 bg-white rounded-md shadow-2xl border border-slate-200 py-1 text-slate-800 z-50 text-xs">
              <a
                href="https://github.com/ademlitrik"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveMenu(null)}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 flex items-center justify-between text-indigo-700 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Code2 size={13} className="text-indigo-600" />
                  <span>Developer GitHub: ademlitrik</span>
                </div>
                <ExternalLink size={11} className="text-indigo-400" />
              </a>
              <a
                href="https://pfconsultants.co.za/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveMenu(null)}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between text-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Globe size={13} className="text-slate-500" />
                  <span>Provident Firm Website (pfconsultants.co.za)</span>
                </div>
                <ExternalLink size={11} className="text-slate-400" />
              </a>
              <div className="border-t border-slate-100 my-1" />
              <button onClick={() => { navigate('/sa-audit'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                South African Regulatory Standards (IRBA/SAICA)
              </button>
              <button onClick={() => { navigate('/migrate'); setActiveMenu(null) }} className="w-full text-left px-3 py-1.5 hover:bg-slate-100">
                Legacy .CWP File Import Guide
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => { onOpenAbout?.(); setActiveMenu(null) }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 text-indigo-700 font-bold"
              >
                <Info size={13} className="text-indigo-600" />
                <span>About Provident & Developer Credits...</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── CASEWARE DESKTOP QUICK-ACTION RIBBON ── */}
      <div className="h-8 bg-slate-100 border-b border-slate-300 flex items-center px-2 gap-1 overflow-x-auto text-[11px] font-medium text-slate-700">
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="Open Client Engagement"
        >
          <FolderOpen size={13} className="text-indigo-600" />
          <span>Open Client</span>
        </button>

        <button
          onClick={() => showBanner('✓ Active Engagement Data Saved')}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="Save Active Engagement Data (Ctrl+S)"
        >
          <Save size={13} className="text-emerald-600" />
          <span>Save File</span>
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1 shrink-0" />

        <button
          onClick={() => navigate('/trial-balance')}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="Trial Balance Sheet & Mapping"
        >
          <Scale size={13} className="text-blue-600" />
          <span>Trial Balance</span>
        </button>

        <button
          onClick={() => navigate('/working-papers')}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="Probe MMX Working Papers & Lead Schedules"
        >
          <ClipboardList size={13} className="text-amber-600" />
          <span>Probe MMX</span>
        </button>

        <button
          onClick={() => navigate('/financials')}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="Annual Financial Statements (IFRS)"
        >
          <FileText size={13} className="text-purple-600" />
          <span>Financials</span>
        </button>

        <button
          onClick={() => navigate('/cipc-ixbrl')}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="CIPC iXBRL E-Filing Module"
        >
          <FileCode size={13} className="text-teal-600" />
          <span>CIPC iXBRL</span>
        </button>

        {/* ── HIGHLIGHTED PDF DOCUMENT EDITOR TOOL ── */}
        <button
          onClick={() => navigate('/unlock-pdf?tab=edit')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors cursor-pointer shrink-0"
          title="Audit PDF Document Editor: Add text, auditor tick marks, notes & stamp"
        >
          <FileEdit size={13} className="text-indigo-600" />
          <span className="font-bold">Edit a PDF</span>
          <span className="text-[8px] bg-indigo-200 text-indigo-900 px-1 rounded font-mono font-bold">TOOL #2</span>
        </button>

        <button
          onClick={() => navigate('/unlock-pdf')}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="Audit PDF Studio: Strip Passwords, Merge & Stamp"
        >
          <Key size={13} className="text-orange-600" />
          <span>PDF Studio</span>
        </button>

        <button
          onClick={() => navigate('/tax')}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="SARS CIT Tax Calculation"
        >
          <Calculator size={13} className="text-emerald-600" />
          <span>Tax (CIT)</span>
        </button>

        <button
          onClick={() => navigate('/practice')}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="Timesheet & WIP Tracking"
        >
          <Clock size={13} className="text-indigo-600" />
          <span>Timesheet</span>
        </button>

        <div className="h-4 w-px bg-slate-300 mx-1 shrink-0" />

        <button
          onClick={handleBackup}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="Backup Engagement File (.pvd)"
        >
          <Download size={13} className="text-emerald-700" />
          <span>Backup (.pvd)</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="Print Active Schedule"
        >
          <Printer size={13} className="text-slate-600" />
          <span>Print</span>
        </button>

        <button
          onClick={onOpenAbout}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0 ml-auto"
          title="About Provident & Developer Credits"
        >
          <HelpCircle size={13} className="text-indigo-600" />
          <span>About & Credits</span>
        </button>
      </div>
    </div>
  )
}

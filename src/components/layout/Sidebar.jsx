import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, Scale, FileText,
  ClipboardList, Bot, Settings, ChevronLeft, ChevronRight,
  LogOut, Landmark, List, Calculator, FolderGit2, ShieldCheck,
  Database, Key, FileCode, FileSpreadsheet, Clock, UserCheck, Info
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import providentLogo from '@/assets/provident_logo_raw.png'
import afrovisionLogo from '@/assets/afrovision_logo.png'

const sections = [
  {
    title: 'PRACTICE & GENERAL',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
      { to: '/clients', icon: Users, label: 'Entities & Clients' },
      { to: '/practice', icon: Clock, label: 'Practice Timesheets & WIP' },
      { to: '/users', icon: UserCheck, label: 'User Management', badge: 'ADMIN' },
    ]
  },
  {
    title: 'ACCOUNTING CORE',
    items: [
      { to: '/accounts', icon: List, label: 'Chart of Accounts' },
      { to: '/ledger', icon: BookOpen, label: 'General Ledger' },
      { to: '/trial-balance', icon: Scale, label: 'Trial Balance' },
      { to: '/bank-recon', icon: Landmark, label: 'Bank Reconciliation' },
    ]
  },
  {
    title: 'AUDIT & STATUTORY',
    items: [
      { to: '/acceptance', icon: UserCheck, label: 'ISA 210 Client Acceptance', badge: 'ISA 210' },
      { to: '/sa-audit', icon: Scale, label: 'SA Audit Scoping & PIS', badge: 'SAICA' },
      { to: '/cipc-ixbrl', icon: FileCode, label: 'CIPC iXBRL E-Filing', badge: 'CIPC' },
      { to: '/sampling', icon: FileSpreadsheet, label: 'ISA 530 Audit Sampling', badge: 'ISA' },
      { to: '/financials', icon: FileText, label: 'Financial Statements' },
      { to: '/working-papers', icon: ClipboardList, label: 'Audit Working Papers' },
      { to: '/tax', icon: Calculator, label: 'Tax Computations' },
      { to: '/documents', icon: FolderGit2, label: 'Document & OCR Evidence' },
      { to: '/unlock-pdf', icon: Key, label: 'Audit PDF Studio', badge: 'PRO' },
    ]
  },
  {
    title: 'SECURITY, MIGRATION & AI',
    items: [
      { to: '/migrate', icon: Database, label: 'Legacy File Migration Hub', badge: 'IMPORT' },
      { to: '/security', icon: ShieldCheck, label: 'Security & Compliance', badge: 'PRO' },
      { to: '/ai', icon: Bot, label: 'AI Assistant', badge: 'AI' },
    ]
  }
]

export default function Sidebar({ onOpenAbout }) {
  const collapsed = useAppStore(s => s.sidebarCollapsed)
  const toggleSidebar = useAppStore(s => s.toggleSidebar)
  const logout = useAuthStore(s => s.logout)

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col shrink-0 select-none transition-all duration-200 relative ${
        collapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Sidebar Brand Header */}
      <div className="p-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <img src={providentLogo} alt="Provident" className="h-5 w-auto object-contain shrink-0 mx-auto" />
        {!collapsed && (
          <div className="truncate flex-1">
            <span className="font-bold text-[11px] text-slate-800 block truncate">Provident Working Papers</span>
            <span className="text-[9px] text-indigo-600 font-medium block truncate">South Africa Standard (ISA)</span>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <p className="px-2.5 text-[10px] font-semibold text-slate-400 tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group relative ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={16} className="shrink-0 text-slate-500 group-hover:text-slate-900 transition-colors" />
                  {!collapsed && (
                    <span className="truncate flex-1">{label}</span>
                  )}
                  {!collapsed && badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      badge === 'PRO' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {badge}
                    </span>
                  )}

                  {/* Tooltip on collapse */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {label}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Settings & Developer Accreditation */}
      <div className="p-2 border-t border-slate-200 space-y-1 bg-slate-50/50">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <Settings size={16} className="shrink-0 text-slate-500" />
          {!collapsed && <span>Settings & Preferences</span>}
        </NavLink>

        <button
          onClick={onOpenAbout}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left cursor-pointer group"
          title="About Provident & Developer Credits"
        >
          <img src={afrovisionLogo} alt="Afro Vision Media" className="w-4 h-4 object-contain shrink-0" />
          {!collapsed && (
            <div className="truncate flex-1">
              <span className="block truncate font-medium">About & Credits</span>
            </div>
          )}
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse Toggle Arrow */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-12 w-6 h-6 bg-white border border-slate-300 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-sm z-20 cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}

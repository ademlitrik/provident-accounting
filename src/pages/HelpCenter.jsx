import { useState } from 'react'
import {
  HelpCircle, BookOpen, Compass, Video, Sparkles, CheckCircle2,
  ArrowRight, Search, FileCode, Users, Layers, ShieldCheck, Database,
  FileSpreadsheet, Scale, ExternalLink, ChevronRight, Bookmark, Play
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function HelpCenter() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('getting-started')

  const TUTORIALS = [
    {
      id: 'quick-start',
      title: 'Quick Start: First Time in Provident',
      duration: '3 min read',
      badge: 'BEGINNER',
      description: 'How to select your client entity, review Chart of Accounts, and explore the workspace.',
      steps: [
        '1. Entity Selection: Use the top bar entity dropdown to switch to your client engagement.',
        '2. Review Accounts: Head to "Accounting Core > Chart of Accounts" to inspect balances.',
        '3. Inspect General Ledger: Check debits and credits in "General Ledger".',
        '4. Trial Balance: Open "Trial Balance" to verify debit/credit parity before statutory assembly.'
      ]
    },
    {
      id: 'caseware-migration',
      title: 'Importing CaseWare (.cwp) & Draftworx Files',
      duration: '4 min read',
      badge: 'MIGRATION',
      description: 'Step-by-step ingestion of historical working papers, lead schedules, and trial balances.',
      steps: [
        '1. Go to "Security, Migration & AI > Legacy File Migration Hub".',
        '2. Select CaseWare Working Papers or Draftworx as your source framework.',
        '3. Click "Upload Complete Client Folder..." or "Browse Archive / Excel File...".',
        '4. Inspect the conversion terminal log to ensure zero variance and balanced debit/credits.',
        '5. Click "Sync Directly into Active Trial Balance" — this updates TB, GL, Bank Recon, and Working Papers simultaneously.'
      ]
    },
    {
      id: 'bank-recon',
      title: 'Bank Statement Reconciliation & Clearing',
      duration: '3 min read',
      badge: 'ACCOUNTING',
      description: 'Import OFX/CSV statements, match unreconciled items, and post clearing journals.',
      steps: [
        '1. Navigate to "Accounting Core > Bank Reconciliation".',
        '2. Click "Import OFX / CSV Statement" to load current statement lines.',
        '3. Review unmatched items requiring ledger allocation.',
        '4. Click "Match GL" next to an item to auto-generate and post the clearing entry to General Ledger.'
      ]
    },
    {
      id: 'statutory-reporting',
      title: 'Generating IFRS Financial Statements & PDF Assembly',
      duration: '5 min read',
      badge: 'STATUTORY',
      description: 'Assemble Balance Sheet, Comprehensive Income, and Cash Flows with one-click PDF compiling.',
      steps: [
        '1. Go to "Audit & Statutory > Financial Statements".',
        '2. View your live Balance Sheet and Income Statement derived dynamically from client accounts.',
        '3. Use "Export to Excel" to export multi-column audit workbooks.',
        '4. Click "Export to PDF (.pdf)" to compile standard multi-page annual financial statements.'
      ]
    },
    {
      id: 'cipc-ixbrl',
      title: 'CIPC iXBRL Annual Filing & Taxonomy Verification',
      duration: '4 min read',
      badge: 'COMPLIANCE',
      description: 'Prepare and validate mandatory CIPC taxonomy elements for Companies and CCs in South Africa.',
      steps: [
        '1. Open "Audit & Statutory > CIPC iXBRL E-Filing".',
        '2. Review mandatory tags (Revenue, Cost of Sales, Gross Profit, Assets, Equity).',
        '3. Click "Validate Taxonomy" to verify schema conformance against CIPC v2023.',
        '4. Download the generated Inline XBRL file ready for direct submission to the CIPC portal.'
      ]
    },
    {
      id: 'sa-audit-planner',
      title: 'Public Interest Score (PIS) & ISA 320 Materiality',
      duration: '4 min read',
      badge: 'AUDIT',
      description: 'Calculate statutory PIS under the Companies Act 2008 and benchmark audit materiality.',
      steps: [
        '1. Open "Audit & Statutory > SA Audit Scoping & PIS".',
        '2. Enter average employees, turnover, third-party liabilities, and beneficial owners.',
        '3. Review the required assurance level (Statutory Audit vs Independent Review).',
        '4. Click "Lock Scope to Client File" to persist the statutory categorization.',
        '5. Benchmark Overall Materiality (OM), Performance Materiality (PM), and sign off the memo.'
      ]
    }
  ]

  const FAQ = [
    {
      q: 'How does Provident compare to CaseWare Working Papers?',
      a: 'Provident incorporates South African statutory audit structures (Probe MMX, SMEENG, IFRSENG) with automated debit/credit balancing, ISA lead schedules, and live Trial Balance integration—without complex dongles or network seat licenses.'
    },
    {
      q: 'Where are my firm preferences, timesheets, and users configured?',
      a: 'Click "Settings & Preferences" at the bottom of the sidebar or in the user avatar menu. You can manage Personalization, Firm Details, User Profile, Practice Timesheets & WIP, User Management, AI & Gemini keys, Language, and Security.'
    },
    {
      q: 'Can I export working papers for external peer review or IRBA inspection?',
      a: 'Yes. Every screen (Audit Working Papers, Bank Reconciliation, General Ledger, Substantive Sampling) includes Print and CSV/PDF export buttons compliant with ISA 230 file assembly requirements.'
    },
    {
      q: 'How do I roll forward to the next financial year?',
      a: 'Go to the top menu bar under "Engagement > Roll Forward Financial Year (Next FY)". The system advances the fiscal year, closes temporary income/expense accounts to Retained Earnings, and resets working paper sign-offs.'
    }
  ]

  const filteredTutorials = TUTORIALS.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-semibold border border-indigo-400/30">
            <Compass size={13} />
            <span>Interactive Help Center & Methodology Guide</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Provident Knowledge Base & Audit Tutorials
          </h1>
          <p className="text-xs text-indigo-200 leading-relaxed">
            Master the Provident workflow: from legacy CaseWare & Draftworx ingestion to ISA working papers, CIPC iXBRL e-filing, and financial statement compilation.
          </p>

          <div className="pt-2 relative max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tutorials, standards, workflows (e.g. CaseWare, Bank Recon)..."
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-indigo-200 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'New User Onboarding', icon: Sparkles, color: 'text-amber-500', route: '/dashboard', desc: 'Orientation, active client navigation and workspace basics' },
          { label: 'CaseWare / File Import', icon: Database, color: 'text-indigo-500', route: '/migrate', desc: 'Import .cwp folders, .drx Draftworx and CSV trial balances' },
          { label: 'Practice & Settings', icon: Users, color: 'text-emerald-500', route: '/settings?tab=timesheets', desc: 'Timesheets, billable WIP tracking and team management' },
          { label: 'Audit Working Papers', icon: FileSpreadsheet, color: 'text-blue-500', route: '/working-papers', desc: 'ISA 315 / 500 assertions and lead schedules sign-off' },
        ].map((tile, i) => (
          <div
            key={i}
            onClick={() => navigate(tile.route)}
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-indigo-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <tile.icon size={18} className={tile.color} />
                <h3 className="text-xs font-bold text-slate-900">{tile.label}</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{tile.desc}</p>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-indigo-600">
              <span>Open Module</span>
              <ArrowRight size={13} />
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Interactive Tutorials Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-600" />
            <span>Workflow Guides & Step-by-Step Instructions ({filteredTutorials.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTutorials.map((tut) => (
            <div key={tut.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {tut.badge}
                    </span>
                    <span className="text-[11px] text-slate-400">{tut.duration}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{tut.title}</h3>
                </div>
              </div>

              <p className="text-xs text-slate-600">{tut.description}</p>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Action Steps:
                </span>
                {tut.steps.map((st, idx) => (
                  <p key={idx} className="text-[11px] leading-relaxed">• {st}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <HelpCircle size={16} className="text-indigo-600" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQ.map((faq, i) => (
            <div key={i} className="p-4 rounded-lg bg-slate-50/70 border border-slate-200 space-y-1.5">
              <h3 className="font-bold text-xs text-slate-900">{faq.q}</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import {
  FileText, Download, Printer, Filter, ChevronDown,
  Building2, Calendar, FileSpreadsheet, Sparkles, RefreshCw, CheckCircle2
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import { useAccountingStore, getCurrencyCode } from '@/store/accountingStore'
import { exportFinancialStatementsPdf } from '@/utils/pdfExport'

const tabs = ['Income Statement', 'Balance Sheet', 'Cash Flows', 'Notes to Statements']

const BALANCE_SHEET_DATA = {
  assets: {
    current: [
      { code: '1000', name: 'Cash and Cash Equivalents', amount: 284500, prior: 215000 },
      { code: '1100', name: 'Trade and Other Receivables', amount: 156300, prior: 142000 },
      { code: '1200', name: 'Inventories at Cost', amount: 93400, prior: 88000 },
    ],
    nonCurrent: [
      { code: '1500', name: 'Property, Plant and Equipment (Gross)', amount: 620000, prior: 580000 },
      { code: '1510', name: 'Accumulated Depreciation', amount: -184000, prior: -150000 },
      { code: '1600', name: 'Intangible Software Assets', amount: 45000, prior: 45000 },
    ]
  },
  liabilities: {
    current: [
      { code: '2000', name: 'Trade and Other Payables', amount: 89700, prior: 74000 },
      { code: '2100', name: 'Short-term Borrowings (Working Capital)', amount: 50000, prior: 65000 },
      { code: '2200', name: 'Current Tax Payable', amount: 28500, prior: 22000 },
    ],
    nonCurrent: [
      { code: '2500', name: 'Long-term Bank Facilities', amount: 230000, prior: 270000 },
      { code: '2600', name: 'Deferred Tax Liability', amount: 18000, prior: 15000 },
    ]
  },
  equity: [
    { code: '3000', name: 'Ordinary Share Capital', amount: 300000, prior: 300000 },
    { code: '3100', name: 'Retained Earnings (Accumulated Profits)', amount: 299000, prior: 194000 },
  ]
}

const CASH_FLOW_DATA = [
  { section: 'Cash Flows from Operating Activities', items: [
    { name: 'Operating Profit before Tax', amount: 278000 },
    { name: 'Adjustments for Depreciation & Amortization', amount: 34000 },
    { name: 'Movement in Trade Receivables', amount: -14300 },
    { name: 'Movement in Inventories', amount: -5400 },
    { name: 'Movement in Trade Payables', amount: 15700 },
    { name: 'Direct Taxes Paid', amount: -22000 },
  ]},
  { section: 'Cash Flows from Investing Activities', items: [
    { name: 'Purchase of Property, Plant & Equipment', amount: -40000 },
    { name: 'Proceeds from Disposal of Fixed Assets', amount: 8500 },
  ]},
  { section: 'Cash Flows from Financing Activities', items: [
    { name: 'Repayment of Long-term Debt Borrowings', amount: -40000 },
    { name: 'Dividends Distributed to Shareholders', amount: -45000 },
  ]},
]

function fmt(n) {
  if (n === undefined || n === null) return '—'
  const abs = Math.abs(n).toLocaleString()
  return n < 0 ? `(${abs})` : abs
}

export default function FinancialStatements() {
  const [activeTab, setActiveTab] = useState(0)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [pdfNotification, setPdfNotification] = useState('')
  const theme = useAppStore(s => s.theme)
  const isDark = theme === 'Dark Gray' || theme === 'Black'

  const firm = useAuthStore(s => s.firm)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const addRecentDocument = useAccountingStore(s => s.addRecentDocument)
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  const currCode = getCurrencyCode(firm?.currency)

  // Direct PDF Export Handler using pdf-lib
  const handleExportPdf = async () => {
    setIsExportingPdf(true)
    setPdfNotification('Generating comprehensive audited IFRS Annual Financial Statements PDF...')
    try {
      const filename = await exportFinancialStatementsPdf({
        client: activeClient,
        firm,
        currency: firm?.currency
      })
      addRecentDocument({
        name: filename,
        type: 'Annual Financial Statements (PDF)',
        size: '142 KB',
        wpRef: 'AFS-FY2024'
      })
      setPdfNotification(`✓ Success! Downloaded ${filename}`)
      setTimeout(() => setPdfNotification(''), 4000)
    } catch (err) {
      setPdfNotification(`PDF Generation Error: ${err.message}`)
    }
    setIsExportingPdf(false)
  }

  // Calculations for Balance Sheet
  const totalCurrAssets = BALANCE_SHEET_DATA.assets.current.reduce((s, a) => s + a.amount, 0)
  const totalNonCurrAssets = BALANCE_SHEET_DATA.assets.nonCurrent.reduce((s, a) => s + a.amount, 0)
  const totalAssets = totalCurrAssets + totalNonCurrAssets

  const totalCurrLiab = BALANCE_SHEET_DATA.liabilities.current.reduce((s, a) => s + a.amount, 0)
  const totalNonCurrLiab = BALANCE_SHEET_DATA.liabilities.nonCurrent.reduce((s, a) => s + a.amount, 0)
  const totalLiab = totalCurrLiab + totalNonCurrLiab

  const totalEquity = BALANCE_SHEET_DATA.equity.reduce((s, a) => s + a.amount, 0)
  const totalLiabAndEquity = totalLiab + totalEquity

  const handleExportExcel = () => {
    let rows = []
    if (activeTab === 0) {
      rows = [
        ['Statement of Comprehensive Income', activeClient?.name || 'Acme Corporation', `Reporting Currency: ${currCode}`],
        ['Accounting Item Description', 'Note', `2024 (${currCode})`, `2023 (${currCode})`],
        ['Revenue from Contracts with Customers', '3', '741500', '659000'],
        ['Cost of Sales & Direct Merchandise Costs', '4', '-312000', '-285000'],
        ['Gross Profit', '', '429500', '374000'],
        ['Salaries, Wages & Employee Benefits', '5', '-144000', '-130000'],
        ['Premises Lease Rentals', '', '-33000', '-30000'],
        ['Administrative & General Office Expenses', '', '-8500', '-7800'],
        ['Depreciation and Amortization', '6', '-14400', '-12000'],
        ['Operating Profit (EBIT)', '', '229600', '194200'],
        ['Income Tax Expense (27%)', '7', '-61992', '-52434'],
        ['Net Profit for the Year After Tax', '', '167608', '141766']
      ]
    } else if (activeTab === 1) {
      rows = [
        ['Statement of Financial Position (Balance Sheet)', activeClient?.name || 'Acme Corporation', `Reporting Currency: ${currCode}`],
        ['Classification', 'Code', `2024 (${currCode})`, `2023 (${currCode})`],
        ...BALANCE_SHEET_DATA.assets.nonCurrent.map(i => [i.name, i.code, i.amount, i.prior]),
        ['Total Non-Current Assets', '', totalNonCurrAssets, 475000],
        ...BALANCE_SHEET_DATA.assets.current.map(i => [i.name, i.code, i.amount, i.prior]),
        ['Total Current Assets', '', totalCurrAssets, 445000],
        ['TOTAL ASSETS', '', totalAssets, 920000],
        ...BALANCE_SHEET_DATA.equity.map(i => [i.name, i.code, i.amount, i.prior]),
        ...BALANCE_SHEET_DATA.liabilities.nonCurrent.map(i => [i.name, i.code, i.amount, i.prior]),
        ...BALANCE_SHEET_DATA.liabilities.current.map(i => [i.name, i.code, i.amount, i.prior]),
        ['TOTAL EQUITY AND LIABILITIES', '', totalLiabAndEquity, 920000]
      ]
    } else {
      rows = [
        ['Statement of Cash Flows', activeClient?.name || 'Acme Corporation', `Reporting Currency: ${currCode}`],
        ['Section', 'Item', `Amount (${currCode})`],
        ...CASH_FLOW_DATA.flatMap(s => s.items.map(i => [s.section, i.name, i.amount]))
      ]
    }
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${(activeClient?.name || 'Provident').replace(/[^a-zA-Z0-9]/g, '_')}_Financials.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 print:p-0 print:max-w-none print:space-y-4" style={{ userSelect: 'text' }}>
      
      {/* ── PRINT-ONLY OFFICIAL AUDIT LETTERHEAD ── */}
      <div className="hidden print:block pb-4 mb-4 border-b-2 border-slate-900 text-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
              Official Client Statutory Filing
            </span>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
              {activeClient?.name || 'Acme Corporation (Pty) Ltd'}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Annual Financial Statements · Registration No: {activeClient?.regNo || '2018/489102/07'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase text-slate-900 block">
              {firm?.name || 'Provident Financial Consultants'}
            </span>
            <span className="text-[10px] text-slate-600 block">
              Independent Practice · IRBA #{firm?.irbaNumber || '904812'}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Framework: IFRS for SMEs · Printed: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Screen Notification for PDF generation */}
      {pdfNotification && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-md text-xs font-medium flex items-center gap-2 print:hidden animate-in fade-in">
          <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
          <span>{pdfNotification}</span>
        </div>
      )}

      {/* Screen Header Controls (Hidden during print) */}
      <div className="flex items-center justify-between pb-4 border-b print:hidden"
           style={{ borderColor: isDark ? '#333339' : '#E5E7EB' }}>
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Audit Engagements</span>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">{activeClient?.name}</span>
            <span>/</span>
            <span className="text-[#5B5FC7]">Statutory Reports (IFRS)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Financial Statements & Schedules
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded text-xs hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            title="Open System Print Dialog (A4 Continuous Layout)"
          >
            <Printer size={13} />
            <span>Print Statement (Ctrl+P)</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded text-xs hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            title="Export CSV / Excel Workbook"
          >
            <FileSpreadsheet size={13} className="text-emerald-600" />
            <span>Export to Excel</span>
          </button>
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 bg-[#5B5FC7] hover:bg-[#4A4EB5] disabled:opacity-50 text-white px-3.5 py-1.5 rounded text-xs font-medium transition-colors shadow-sm cursor-pointer"
            title="Download multi-page audited Annual Financial Statements PDF"
          >
            {isExportingPdf ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
            <span>Export to PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {/* Ribbon Tabs (Hidden during print so statement content is unencumbered) */}
      <div className="flex gap-1 border-b pb-px print:hidden" style={{ borderColor: isDark ? '#333339' : '#E5E7EB' }}>
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 text-xs font-semibold rounded-t transition-colors border-t border-x -mb-px ${
              activeTab === idx
                ? 'bg-white dark:bg-[#1E1E22] text-[#5B5FC7] border-slate-300 dark:border-slate-700 border-t-2 border-t-[#5B5FC7]'
                : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 0: Income Statement */}
      {activeTab === 0 && (
        <div className="bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-slate-800 rounded-lg p-8 shadow-sm max-w-4xl mx-auto">
          <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {activeClient?.name || 'Acme Corporation (Pty) Ltd'}
            </h2>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Statement of Comprehensive Income
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              For the 12-Month Period Ended 31 October 2024 · Prepared under IFRS for SMEs · Stated in {currCode}
            </p>
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-500 font-semibold">
                <th className="text-left py-2 font-medium">Accounting Item Description</th>
                <th className="text-center py-2 w-16">Note</th>
                <th className="text-right py-2 w-28">2024 ({currCode})</th>
                <th className="text-right py-2 w-28">2023 ({currCode})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              <tr>
                <td className="py-2.5 font-semibold text-slate-900 dark:text-slate-100">Revenue from Contracts with Customers</td>
                <td className="py-2.5 text-center text-slate-400">3</td>
                <td className="py-2.5 text-right font-mono font-medium text-slate-900 dark:text-slate-100">741,500</td>
                <td className="py-2.5 text-right font-mono text-slate-400">659,000</td>
              </tr>
              <tr>
                <td className="py-2.5 pl-4 text-slate-600 dark:text-slate-400">Cost of Sales & Direct Merchandise Costs</td>
                <td className="py-2.5 text-center text-slate-400">4</td>
                <td className="py-2.5 text-right font-mono text-rose-600 dark:text-rose-400">(312,000)</td>
                <td className="py-2.5 text-right font-mono text-slate-400">(285,000)</td>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800/50 font-semibold border-y border-slate-200 dark:border-slate-700">
                <td className="py-2 text-slate-900 dark:text-slate-100">Gross Profit</td>
                <td></td>
                <td className="py-2 text-right font-mono text-emerald-600 dark:text-emerald-400">429,500</td>
                <td className="py-2 text-right font-mono text-slate-500">374,000</td>
              </tr>

              <tr>
                <td className="py-2.5 pl-4 text-slate-600 dark:text-slate-400">Salaries, Wages & Employee Benefits</td>
                <td className="py-2.5 text-center text-slate-400">5</td>
                <td className="py-2.5 text-right font-mono text-rose-600 dark:text-rose-400">(144,000)</td>
                <td className="py-2.5 text-right font-mono text-slate-400">(130,000)</td>
              </tr>
              <tr>
                <td className="py-2.5 pl-4 text-slate-600 dark:text-slate-400">Premises Lease Rentals</td>
                <td className="py-2.5 text-center text-slate-400"></td>
                <td className="py-2.5 text-right font-mono text-rose-600 dark:text-rose-400">(33,000)</td>
                <td className="py-2.5 text-right font-mono text-slate-400">(30,000)</td>
              </tr>
              <tr>
                <td className="py-2.5 pl-4 text-slate-600 dark:text-slate-400">Administrative & General Office Expenses</td>
                <td className="py-2.5 text-center text-slate-400"></td>
                <td className="py-2.5 text-right font-mono text-rose-600 dark:text-rose-400">(8,500)</td>
                <td className="py-2.5 text-right font-mono text-slate-400">(7,800)</td>
              </tr>
              <tr>
                <td className="py-2.5 pl-4 text-slate-600 dark:text-slate-400">Depreciation and Amortization</td>
                <td className="py-2.5 text-center text-slate-400">6</td>
                <td className="py-2.5 text-right font-mono text-rose-600 dark:text-rose-400">(14,400)</td>
                <td className="py-2.5 text-right font-mono text-slate-400">(12,000)</td>
              </tr>

              <tr className="bg-slate-50 dark:bg-slate-800/50 font-semibold border-t border-slate-200 dark:border-slate-700">
                <td className="py-2 text-slate-900 dark:text-slate-100">Operating Profit (EBIT)</td>
                <td></td>
                <td className="py-2 text-right font-mono text-slate-900 dark:text-slate-100">229,600</td>
                <td className="py-2 text-right font-mono text-slate-500">194,200</td>
              </tr>
              <tr>
                <td className="py-2 pl-4 text-slate-600 dark:text-slate-400">Income Tax Expense (27%)</td>
                <td className="py-2 text-center text-slate-400">7</td>
                <td className="py-2 text-right font-mono text-rose-600 dark:text-rose-400">(61,992)</td>
                <td className="py-2 text-right font-mono text-slate-400">(52,434)</td>
              </tr>
              <tr className="border-t-2 border-b-4 border-slate-900 dark:border-slate-100 font-bold bg-slate-100/60 dark:bg-slate-800">
                <td className="py-3 text-sm text-slate-900 dark:text-slate-100">Net Profit for the Year After Tax</td>
                <td></td>
                <td className="py-3 text-right font-mono text-sm text-emerald-600 dark:text-emerald-400">167,608</td>
                <td className="py-3 text-right font-mono text-sm text-slate-500">141,766</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 1: Balance Sheet */}
      {activeTab === 1 && (
        <div className="bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-slate-800 rounded-lg p-8 shadow-sm max-w-4xl mx-auto">
          <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {activeClient?.name || 'Acme Corporation (Pty) Ltd'}
            </h2>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Statement of Financial Position (Balance Sheet)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              As at 31 October 2024 · All amounts stated in {currCode}
            </p>
          </div>

          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-500 font-semibold">
                <th className="text-left py-2 font-medium">Assets & Liabilities Classification</th>
                <th className="text-center py-2 w-16">Note</th>
                <th className="text-right py-2 w-28">2024 ({currCode})</th>
                <th className="text-right py-2 w-28">2023 ({currCode})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* ASSETS */}
              <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold">
                <td colSpan={4} className="py-2 text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Non-Current Assets
                </td>
              </tr>
              {BALANCE_SHEET_DATA.assets.nonCurrent.map(item => (
                <tr key={item.code}>
                  <td className="py-2 pl-4 text-slate-700 dark:text-slate-300">{item.name}</td>
                  <td className="py-2 text-center text-slate-400">{item.code}</td>
                  <td className="py-2 text-right font-mono">{fmt(item.amount)}</td>
                  <td className="py-2 text-right font-mono text-slate-400">{fmt(item.prior)}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-slate-50/50 dark:bg-slate-800/30">
                <td className="py-2 pl-4 text-slate-800 dark:text-slate-200">Total Non-Current Assets</td>
                <td></td>
                <td className="py-2 text-right font-mono">{fmt(totalNonCurrAssets)}</td>
                <td className="py-2 text-right font-mono text-slate-400">475,000</td>
              </tr>

              <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold">
                <td colSpan={4} className="py-2 text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Current Assets
                </td>
              </tr>
              {BALANCE_SHEET_DATA.assets.current.map(item => (
                <tr key={item.code}>
                  <td className="py-2 pl-4 text-slate-700 dark:text-slate-300">{item.name}</td>
                  <td className="py-2 text-center text-slate-400">{item.code}</td>
                  <td className="py-2 text-right font-mono">{fmt(item.amount)}</td>
                  <td className="py-2 text-right font-mono text-slate-400">{fmt(item.prior)}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-slate-50/50 dark:bg-slate-800/30">
                <td className="py-2 pl-4 text-slate-800 dark:text-slate-200">Total Current Assets</td>
                <td></td>
                <td className="py-2 text-right font-mono">{fmt(totalCurrAssets)}</td>
                <td className="py-2 text-right font-mono text-slate-400">445,000</td>
              </tr>

              <tr className="border-y-2 border-slate-900 dark:border-slate-100 font-bold bg-slate-100 dark:bg-slate-800">
                <td className="py-2.5 text-sm text-slate-900 dark:text-slate-100">TOTAL ASSETS</td>
                <td></td>
                <td className="py-2.5 text-right font-mono text-sm text-indigo-600 dark:text-indigo-400">{fmt(totalAssets)}</td>
                <td className="py-2.5 text-right font-mono text-sm text-slate-400">920,000</td>
              </tr>

              {/* LIABILITIES & EQUITY */}
              <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold">
                <td colSpan={4} className="py-2 text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Equity and Capital Reserves
                </td>
              </tr>
              {BALANCE_SHEET_DATA.equity.map(item => (
                <tr key={item.code}>
                  <td className="py-2 pl-4 text-slate-700 dark:text-slate-300">{item.name}</td>
                  <td className="py-2 text-center text-slate-400">{item.code}</td>
                  <td className="py-2 text-right font-mono">{fmt(item.amount)}</td>
                  <td className="py-2 text-right font-mono text-slate-400">{fmt(item.prior)}</td>
                </tr>
              ))}

              <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold">
                <td colSpan={4} className="py-2 text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Non-Current Liabilities
                </td>
              </tr>
              {BALANCE_SHEET_DATA.liabilities.nonCurrent.map(item => (
                <tr key={item.code}>
                  <td className="py-2 pl-4 text-slate-700 dark:text-slate-300">{item.name}</td>
                  <td className="py-2 text-center text-slate-400">{item.code}</td>
                  <td className="py-2 text-right font-mono">{fmt(item.amount)}</td>
                  <td className="py-2 text-right font-mono text-slate-400">{fmt(item.prior)}</td>
                </tr>
              ))}

              <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold">
                <td colSpan={4} className="py-2 text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Current Liabilities
                </td>
              </tr>
              {BALANCE_SHEET_DATA.liabilities.current.map(item => (
                <tr key={item.code}>
                  <td className="py-2 pl-4 text-slate-700 dark:text-slate-300">{item.name}</td>
                  <td className="py-2 text-center text-slate-400">{item.code}</td>
                  <td className="py-2 text-right font-mono">{fmt(item.amount)}</td>
                  <td className="py-2 text-right font-mono text-slate-400">{fmt(item.prior)}</td>
                </tr>
              ))}

              <tr className="border-t-2 border-b-4 border-slate-900 dark:border-slate-100 font-bold bg-slate-100 dark:bg-slate-800">
                <td className="py-2.5 text-sm text-slate-900 dark:text-slate-100">TOTAL EQUITY AND LIABILITIES</td>
                <td></td>
                <td className="py-2.5 text-right font-mono text-sm text-indigo-600 dark:text-indigo-400">{fmt(totalLiabAndEquity)}</td>
                <td className="py-2.5 text-right font-mono text-sm text-slate-400">920,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Statement of Cash Flows */}
      {activeTab === 2 && (
        <div className="bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-slate-800 rounded-lg p-8 shadow-sm max-w-4xl mx-auto">
          <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {activeClient?.name || 'Acme Corporation (Pty) Ltd'}
            </h2>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Statement of Cash Flows (Indirect Method)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              For Year Ended 31 October 2024 · All amounts in {currCode}
            </p>
          </div>

          <div className="space-y-6">
            {CASH_FLOW_DATA.map(group => {
              const subtotal = group.items.reduce((s, i) => s + i.amount, 0)
              return (
                <div key={group.section}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-1.5 border-b border-slate-200 dark:border-slate-700">
                    {group.section}
                  </h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {group.items.map(item => (
                      <div key={item.name} className="flex justify-between py-2 text-xs">
                        <span className="text-slate-600 dark:text-slate-400 pl-4">{item.name}</span>
                        <span className={`font-mono ${item.amount < 0 ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>
                          {fmt(item.amount)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 bg-slate-50 dark:bg-slate-800/40 font-semibold text-xs px-2 rounded">
                      <span className="text-slate-900 dark:text-slate-100">Net Cash Movement</span>
                      <span className="font-mono text-[#5B5FC7]">{fmt(subtotal)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Notes to Financial Statements */}
      {activeTab === 3 && (
        <div className="bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-slate-800 rounded-lg p-8 shadow-sm max-w-4xl mx-auto space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Note 1: Basis of Preparation and Accounting Policies
            </h3>
            <p>
              The financial statements have been prepared in accordance with the International Financial Reporting Standard for Small and Medium-sized Entities (IFRS for SMEs) issued by the International Accounting Standards Board (IASB). The measurement basis used is historical cost, modified where applicable by fair valuation of financial instruments.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Note 2: Property, Plant and Equipment Depreciation
            </h3>
            <p>
              Depreciation is calculated on a straight-line method to write off the cost of assets over their estimated useful lives:
              Computer Equipment (3 years), Furniture and Fittings (6 years), Office Plant and Machinery (5 years).
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Note 3: Contingent Liabilities & Post-Balance Sheet Events
            </h3>
            <p>
              No adjusting or significant non-adjusting events occurred between the reporting date (31 October 2024) and the date of authorization by the audit engagement partner.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

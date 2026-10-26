import { useState } from 'react'
import { Download, CheckCircle2, AlertTriangle, FileSpreadsheet, Scale, Printer, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAccountingStore, formatCurrency, getCurrencyCode } from '@/store/accountingStore'
import { exportTrialBalancePdf } from '@/utils/pdfExport'

const FALLBACK_TB = [
  { code: '1000', account: 'Cash & Cash Equivalents', debit: 284500, credit: 0, type: 'Asset' },
  { code: '1100', account: 'Trade and Other Receivables', debit: 156300, credit: 0, type: 'Asset' },
  { code: '1200', account: 'Merchandise Inventory at Cost', debit: 93400, credit: 0, type: 'Asset' },
  { code: '1500', account: 'Property, Plant & Equipment (Gross)', debit: 620000, credit: 0, type: 'Asset' },
  { code: '1510', account: 'Accumulated Depreciation - Plant', debit: 0, credit: 184000, type: 'Asset' },
  { code: '2000', account: 'Trade and Other Payables', debit: 0, credit: 89700, type: 'Liability' },
  { code: '2100', account: 'Short-term Borrowings (Working Capital)', debit: 0, credit: 50000, type: 'Liability' },
  { code: '2500', account: 'Long-term Bank Facilities', debit: 0, credit: 230000, type: 'Liability' },
  { code: '3000', account: 'Ordinary Share Capital', debit: 0, credit: 300000, type: 'Equity' },
  { code: '3100', account: 'Retained Earnings (Prior Year)', debit: 0, credit: 62500, type: 'Equity' },
  { code: '4000', account: 'Operating Sales Revenue', debit: 0, credit: 654000, type: 'Income' },
  { code: '4100', account: 'Professional Advisory Fee Income', debit: 0, credit: 87500, type: 'Income' },
  { code: '5000', account: 'Direct Cost of Merchandise Sold', debit: 312000, credit: 0, type: 'Expense' },
  { code: '5100', account: 'Salaries, Wages & Benefits', debit: 144000, credit: 0, type: 'Expense' },
  { code: '5200', account: 'Premises Lease Rentals', debit: 33000, credit: 0, type: 'Expense' },
  { code: '5300', account: 'Administrative & Office Operating Expenses', debit: 8500, credit: 0, type: 'Expense' },
  { code: '5400', account: 'Depreciation & Amortization Expense', debit: 14400, credit: 0, type: 'Expense' },
]

export default function TrialBalance() {
  const firm = useAuthStore(s => s.firm)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const accounts = useAccountingStore(s => s.accounts)
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  const currCode = getCurrencyCode(firm?.currency)

  // Use accounts from store if available, or fallback
  const tbData = accounts && accounts.length > 0
    ? accounts.map(a => ({
        code: a.code,
        account: a.name,
        type: a.type,
        debit: a.debit || (a.type === 'Asset' || a.type === 'Expense' ? a.balance : 0),
        credit: a.credit || (a.type === 'Liability' || a.type === 'Equity' || a.type === 'Income' ? a.balance : 0)
      }))
    : FALLBACK_TB

  const totalDebit = tbData.reduce((s, r) => s + (r.debit || 0), 0)
  const totalCredit = tbData.reduce((s, r) => s + (r.credit || 0), 0)
  const diff = Math.abs(totalDebit - totalCredit)
  const isBalanced = diff < 0.01

  const handleExportCsv = () => {
    const rows = [
      ['Provident Working Trial Balance', activeClient?.name || 'Selected Entity', `Currency: ${currCode}`],
      ['As at', '31 October 2024'],
      [],
      ['Code', 'Account Title', 'Classification', `Debit (${currCode})`, `Credit (${currCode})`],
      ...tbData.map(r => [r.code, r.account, r.type, r.debit || 0, r.credit || 0]),
      [],
      ['TOTAL BALANCES', '', '', totalDebit, totalCredit],
      ['VARIANCE', '', '', diff, '']
    ]

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${(activeClient?.name || 'Provident').replace(/[^a-zA-Z0-9]/g, '_')}_Trial_Balance.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const addRecentDocument = useAccountingStore(s => s.addRecentDocument)

  const handleExportPdf = async () => {
    setIsExportingPdf(true)
    try {
      const filename = await exportTrialBalancePdf({
        client: activeClient,
        firm,
        accounts: tbData,
        currency: firm?.currency
      })
      addRecentDocument({
        name: filename,
        type: 'Audit Trial Balance (PDF)',
        size: '86 KB',
        wpRef: 'TB-001'
      })
    } catch (err) {
      console.error(err)
    }
    setIsExportingPdf(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 print:p-0 print:space-y-3">
      {/* ── PRINT-ONLY OFFICIAL AUDIT LETTERHEAD ── */}
      <div className="hidden print:block pb-3 mb-3 border-b-2 border-slate-900 text-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
              Official Engagement Working Paper
            </span>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
              {activeClient?.name || 'Acme Corporation (Pty) Ltd'}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Master Trial Balance Sheet · Financial Year: {activeClient?.fyEnd || '31 Dec 2024'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase text-slate-900 block">
              {firm?.name || 'Provident Financial Consultants'}
            </span>
            <span className="text-[10px] text-slate-600 block">
              Audit Parity: {isBalanced ? '✓ Verified (0 Variance)' : `⚠ Out of Balance: R ${diff.toLocaleString()}`}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Date: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Header (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Trial Balance Sheet
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full debit and credit balance sheet as at <strong>31 October 2024</strong> · <strong>{activeClient?.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold ${
            isBalanced
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            <CheckCircle2 size={13} className={isBalanced ? 'text-emerald-600' : 'text-rose-600'} />
            <span>{isBalanced ? `Balanced: ${formatCurrency(0, firm?.currency)} Variance` : `Out of Balance: ${formatCurrency(diff, firm?.currency)}`}</span>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-xs cursor-pointer"
            title="Open System Print Dialog"
          >
            <Printer size={13} />
            <span>Print (Ctrl+P)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-xs cursor-pointer"
            title="Export CSV Workbook"
          >
            <Download size={13} />
            <span>Export to Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors shadow-xs cursor-pointer"
            title="Download Audited Trial Balance PDF"
          >
            {isExportingPdf ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
            <span>Export to PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs print:border-none print:shadow-none">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="text-left px-5 py-3 w-28">Code</th>
              <th className="text-left px-5 py-3">Account Title</th>
              <th className="text-left px-5 py-3 w-32">Type</th>
              <th className="text-right px-5 py-3 w-40">Debit Balance ({currCode})</th>
              <th className="text-right px-5 py-3 w-40">Credit Balance ({currCode})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tbData.map(row => (
              <tr key={row.code} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-2.5 font-mono font-bold text-indigo-600">{row.code}</td>
                <td className="px-5 py-2.5 font-medium text-slate-900">{row.account}</td>
                <td className="px-5 py-2.5 text-slate-500">{row.type}</td>
                <td className="px-5 py-2.5 text-right font-mono font-medium text-slate-900">
                  {row.debit > 0 ? formatCurrency(row.debit, firm?.currency) : '—'}
                </td>
                <td className="px-5 py-2.5 text-right font-mono font-medium text-slate-900">
                  {row.credit > 0 ? formatCurrency(row.credit, firm?.currency) : '—'}
                </td>
              </tr>
            ))}
            {/* Totals Row */}
            <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900">
              <td className="px-5 py-3 text-xs" colSpan={3}>TOTAL BALANCES</td>
              <td className="px-5 py-3 text-right font-mono text-sm text-indigo-700">
                {formatCurrency(totalDebit, firm?.currency)}
              </td>
              <td className="px-5 py-3 text-right font-mono text-sm text-indigo-700">
                {formatCurrency(totalCredit, firm?.currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

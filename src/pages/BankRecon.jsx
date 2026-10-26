import { useState, useRef } from 'react'
import { Upload, CheckCircle2, XCircle, Link2, Download, Landmark, ArrowRight, Printer, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAccountingStore, formatCurrency, getCurrencyCode } from '@/store/accountingStore'

const INITIAL_BANK_ITEMS = [
  { id: 1, date: '2024-10-28', desc: 'Digital Marketing Agency Wire', amount: -12400, ref: 'EFT-9912', matched: true, matchRef: 'JE-1007' },
  { id: 2, date: '2024-10-25', desc: 'Equipment Depreciation Amortization', amount: -1200, ref: 'SYS-AUTO', matched: true, matchRef: 'JE-1006' },
  { id: 3, date: '2024-10-20', desc: 'Office Depot - Stationary Invoices', amount: -840, ref: 'EFT-9910', matched: true, matchRef: 'JE-1005' },
  { id: 4, date: '2024-10-15', desc: 'Premises Lease Rental - Suite 400', amount: -5500, ref: 'EFT-9909', matched: true, matchRef: 'JE-1004' },
  { id: 5, date: '2024-10-10', desc: 'Staff Payroll Disbursement - October', amount: -48000, ref: 'EFT-9908', matched: true, matchRef: 'JE-1003' },
  { id: 6, date: '2024-10-08', desc: 'Client Direct Settlement - Beta Ltd', amount: 8750, ref: 'DEP-2234', matched: false, matchRef: null },
  { id: 7, date: '2024-10-05', desc: 'Customer Invoice Receipt - Acme Corp', amount: 91000, ref: 'DEP-2233', matched: false, matchRef: null },
  { id: 8, date: '2024-10-02', desc: 'Commercial Banking Charges & Fees', amount: -125, ref: 'FEE-OCT', matched: false, matchRef: null },
  { id: 9, date: '2024-10-01', desc: 'Monthly Deposit Interest Accrued', amount: 340, ref: 'INT-OCT', matched: false, matchRef: null },
]

export default function BankRecon() {
  const firm = useAuthStore(s => s.firm)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const addJournalEntry = useAccountingStore(s => s.addJournalEntry)
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  const currCode = getCurrencyCode(firm?.currency)
  const [items, setItems] = useState(INITIAL_BANK_ITEMS)
  const fileInputRef = useRef(null)

  const matched = items.filter(i => i.matched)
  const unmatched = items.filter(i => !i.matched)
  const totalBank = items.reduce((s, i) => s + i.amount, 0)
  const reconPct = items.length > 0 ? Math.round((matched.length / items.length) * 100) : 100

  const handleMatch = (item) => {
    const nextJeId = `JE-10${items.length + 1}`
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, matched: true, matchRef: nextJeId } : i))
    addJournalEntry({
      date: item.date,
      description: `Bank Clearing: ${item.desc}`,
      debitAccount: item.amount > 0 ? '1000 - Cash & Equivalents' : '2000 - Trade Payables',
      creditAccount: item.amount > 0 ? '1100 - Trade Receivables' : '1000 - Cash & Equivalents',
      amount: Math.abs(item.amount)
    })
  }

  const handleImportStatement = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const newItems = [
      { id: Date.now() + 1, date: '2024-10-29', desc: `Imported Settlement [${file.name}]`, amount: 14200, ref: 'EFT-7719', matched: false, matchRef: null },
      { id: Date.now() + 2, date: '2024-10-30', desc: `Telecommunication Facilities Wire`, amount: -3200, ref: 'EFT-7720', matched: false, matchRef: null },
    ]
    setItems(prev => [...newItems, ...prev])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleExportReport = () => {
    const rows = [
      ['Provident Bank Statement Reconciliation', activeClient?.name || 'Selected Entity', `Currency: ${currCode}`],
      ['Account', 'First National Commercial Account #89410293', 'Reporting Period: 31 Oct 2024'],
      [],
      ['Date', 'Transaction Narrative', 'Bank Reference', `Amount (${currCode})`, 'Reconciliation Status', 'Matched Journal Ref'],
      ...items.map(i => [
        i.date,
        i.desc,
        i.ref,
        i.amount,
        i.matched ? 'Reconciled' : 'Pending Review',
        i.matchRef || '—'
      ]),
      [],
      ['Summary', '', '', ''],
      ['Total Statement Net', '', '', totalBank],
      ['Reconciled Count', '', '', `${matched.length} of ${items.length}`],
      ['Reconciliation Percentage', '', '', `${reconPct}%`]
    ]

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${(activeClient?.name || 'Provident').replace(/[^a-zA-Z0-9]/g, '_')}_Bank_Reconciliation.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Bank Statement Reconciliation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            First National Commercial Account #89410293 · Period Ended <strong>31 Oct 2024</strong> · <strong>{activeClient?.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Download size={13} />
            <span>Export Report</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportStatement}
            accept=".csv,.ofx,.qfx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Upload size={14} />
            <span>Import OFX / CSV Statement</span>
          </button>
        </div>
      </div>

      {/* Reconciliation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Bank Statement Net</span>
          <span className="text-xl font-bold text-slate-900">{formatCurrency(totalBank, firm?.currency)}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">{items.length} Imported Transactions</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Matched Transactions</span>
          <span className="text-xl font-bold text-emerald-600">{matched.length} Verified</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Auto-cleared in GL</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Unmatched Items</span>
          <span className="text-xl font-bold text-amber-600">{unmatched.length} Pending</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Requires audit matching</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Reconciliation Score</span>
          <span className="text-xl font-bold text-indigo-600">{reconPct}%</span>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${reconPct}%` }} />
          </div>
        </div>
      </div>

      {/* Unmatched Items Table */}
      {unmatched.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-lg overflow-hidden shadow-xs">
          <div className="px-5 py-3 border-b border-amber-200 bg-amber-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle size={15} className="text-amber-600" />
              <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Unmatched Items Requiring Ledger Allocation ({unmatched.length})
              </h2>
            </div>
            <span className="text-xs text-amber-700 font-medium">Click Match GL to post clearing journal</span>
          </div>

          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="text-left px-5 py-3 w-28">Date</th>
                <th className="text-left px-5 py-3">Bank Transaction Narrative</th>
                <th className="text-left px-5 py-3 w-32">Bank Ref</th>
                <th className="text-right px-5 py-3 w-32">Amount ({currCode})</th>
                <th className="text-right px-5 py-3 w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unmatched.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3 text-slate-500">{item.date}</td>
                  <td className="px-5 py-3 font-medium text-slate-900">{item.desc}</td>
                  <td className="px-5 py-3 font-mono text-slate-500">{item.ref}</td>
                  <td className={`px-5 py-3 text-right font-mono font-bold ${
                    item.amount >= 0 ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {item.amount >= 0 ? '+' : ''}{formatCurrency(item.amount, firm?.currency)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleMatch(item)}
                      className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Link2 size={12} />
                      <span>Match GL</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Matched Items Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Reconciled Bank Entries ({matched.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">All matched against approved General Ledger entries</span>
        </div>

        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="text-left px-5 py-3 w-28">Date</th>
              <th className="text-left px-5 py-3">Bank Narrative</th>
              <th className="text-left px-5 py-3 w-32">Bank Ref</th>
              <th className="text-left px-5 py-3 w-32">Matched JE</th>
              <th className="text-right px-5 py-3 w-32">Amount ({currCode})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matched.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-3 text-slate-500">{item.date}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{item.desc}</td>
                <td className="px-5 py-3 font-mono text-slate-500">{item.ref}</td>
                <td className="px-5 py-3 font-mono font-bold text-emerald-700">{item.matchRef}</td>
                <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">
                  {formatCurrency(Math.abs(item.amount), firm?.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

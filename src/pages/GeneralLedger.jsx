import { useState } from 'react'
import { Plus, Search, Filter, Download, X } from 'lucide-react'
import { useAccountingStore } from '@/store/accountingStore'

export default function GeneralLedger() {
  const journals = useAccountingStore(s => s.journals)
  const addJournalEntry = useAccountingStore(s => s.addJournalEntry)
  const accounts = useAccountingStore(s => s.accounts)

  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    debit: '1100 Trade Receivables',
    credit: '4000 Sales Revenue',
    amount: '',
    author: 'Auditor Partner',
  })

  const filtered = journals.filter(e =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.debit.toLowerCase().includes(search.toLowerCase()) ||
    e.credit.toLowerCase().includes(search.toLowerCase())
  )

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Reference,Date,Description,Debit Account,Credit Account,Amount,Status,Author\n"
      + journals.map(j => `"${j.id}","${j.date}","${j.description}","${j.debit}","${j.credit}",${j.amount},"${j.status}","${j.author}"`).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "Provident_General_Ledger.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.description.trim() || !formData.amount) return
    addJournalEntry({
      ...formData,
      amount: parseFloat(formData.amount) || 0
    })
    setIsModalOpen(false)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      debit: '1100 Trade Receivables',
      credit: '4000 Sales Revenue',
      amount: '',
      author: 'Auditor Partner',
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            General Ledger Journal Entries
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {journals.length} double-entry transactions recorded for audit engagement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>New Journal Entry</span>
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reference, description, account..."
            className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Journal Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="text-left px-5 py-3 w-28">Ref #</th>
              <th className="text-left px-5 py-3 w-28">Date</th>
              <th className="text-left px-5 py-3">Description</th>
              <th className="text-left px-5 py-3">Debit Account</th>
              <th className="text-left px-5 py-3">Credit Account</th>
              <th className="text-right px-5 py-3 w-32">Amount ($)</th>
              <th className="text-right px-5 py-3 w-28">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(entry => (
              <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-indigo-600">{entry.id}</td>
                <td className="px-5 py-3 text-slate-500">{entry.date}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{entry.description}</td>
                <td className="px-5 py-3 text-slate-600">{entry.debit}</td>
                <td className="px-5 py-3 text-slate-600">{entry.credit}</td>
                <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">
                  ${entry.amount.toLocaleString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add Journal Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Create Double-Entry Journal</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Posting Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Transaction Narrative / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Adjustment for Bad Debt Provision"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Debit Account</label>
                  <select
                    value={formData.debit}
                    onChange={e => setFormData({ ...formData, debit: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-600 bg-white"
                  >
                    {accounts.map(a => (
                      <option key={a.code} value={`${a.code} ${a.name}`}>{a.code} {a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Credit Account</label>
                  <select
                    value={formData.credit}
                    onChange={e => setFormData({ ...formData, credit: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-600 bg-white"
                  >
                    {accounts.map(a => (
                      <option key={a.code} value={`${a.code} ${a.name}`}>{a.code} {a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded shadow-xs"
                >
                  Post Journal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

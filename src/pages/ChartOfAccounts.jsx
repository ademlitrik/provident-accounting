import { useState } from 'react'
import { Plus, Search, Filter, Download, X } from 'lucide-react'
import { useAccountingStore } from '@/store/accountingStore'

const typeBadge = {
  Asset: 'bg-blue-50 text-blue-700 border-blue-200',
  Liability: 'bg-amber-50 text-amber-700 border-amber-200',
  Equity: 'bg-purple-50 text-purple-700 border-purple-200',
  Income: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Expense: 'bg-rose-50 text-rose-700 border-rose-200',
}

function fmt(n) {
  const abs = Math.abs(n).toLocaleString()
  return n < 0 ? `(${abs})` : abs
}

export default function ChartOfAccounts() {
  const accounts = useAccountingStore(s => s.accounts)
  const addAccount = useAccountingStore(s => s.addAccount)

  const [search, setSearch] = useState('')
  const [activeFilter, setFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Asset',
    sub: 'Current Assets',
    balance: 0,
  })

  const types = ['All', 'Asset', 'Liability', 'Equity', 'Income', 'Expense']

  const filtered = accounts.filter(a => {
    if (activeFilter !== 'All' && a.type !== activeFilter) return false
    return a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search)
  })

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Code,Account Name,Classification,Sub-Classification,Balance\n"
      + accounts.map(a => `"${a.code}","${a.name}","${a.type}","${a.sub}",${a.balance}`).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "Provident_Chart_Of_Accounts.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.code.trim() || !formData.name.trim()) return
    addAccount({
      ...formData,
      balance: parseFloat(formData.balance) || 0
    })
    setIsModalOpen(false)
    setFormData({
      code: '',
      name: '',
      type: 'Asset',
      sub: 'Current Assets',
      balance: 0,
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Chart of Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {accounts.length} master accounts configured for Acme Corporation (Pty) Ltd
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
            <span>New Account</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-md shadow-xs">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === t
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search account code or title..."
            className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Clean Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="text-left px-5 py-3 w-28">Code</th>
              <th className="text-left px-5 py-3">Account Title</th>
              <th className="text-left px-5 py-3 w-36">Classification</th>
              <th className="text-left px-5 py-3 w-48">Sub-Classification</th>
              <th className="text-right px-5 py-3 w-36">Current Balance ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(a => (
              <tr key={a.code} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-indigo-600">{a.code}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{a.name}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeBadge[a.type]}`}>
                    {a.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500">{a.sub}</td>
                <td className={`px-5 py-3 text-right font-mono font-semibold ${
                  a.balance < 0 ? 'text-slate-800' : 'text-slate-900'
                }`}>
                  {fmt(a.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add Account */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Add Account to Chart of Accounts</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Account Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1300"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Account Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prepaid Insurance"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-600 bg-white"
                  >
                    <option>Asset</option>
                    <option>Liability</option>
                    <option>Equity</option>
                    <option>Income</option>
                    <option>Expense</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sub-Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Current Assets"
                    value={formData.sub}
                    onChange={e => setFormData({ ...formData, sub: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Opening Balance ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={e => setFormData({ ...formData, balance: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                />
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

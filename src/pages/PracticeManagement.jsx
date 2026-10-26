import { useState } from 'react'
import {
  Clock, Plus, Download, Printer, DollarSign, Calendar,
  TrendingUp, Users, FileText, CheckCircle2, AlertCircle, Check
} from 'lucide-react'
import { useAccountingStore, formatCurrency, getCurrencyCode } from '@/store/accountingStore'
import { useAuthStore } from '@/store/authStore'

const INITIAL_TIMESHEETS = [
  { id: 1, staff: 'Sarah Jenkins (Audit Manager)', client: 'Acme Corporation (Pty) Ltd', task: 'Interim Controls Testing & Walkthroughs', hours: 6.5, rate: 1850, date: '2024-10-24', status: 'Billed' },
  { id: 2, staff: 'David Dlamini (Senior Trainee)', client: 'Acme Corporation (Pty) Ltd', task: 'Debtors Circularization & Bank Recon', hours: 8.0, rate: 950, date: '2024-10-25', status: 'Unbilled' },
  { id: 3, staff: 'Thabo Mokoena (Junior Trainee)', client: 'Acme Corporation (Pty) Ltd', task: 'Inventory Stock Count Attendance & Vouching', hours: 7.5, rate: 750, date: '2024-10-26', status: 'Unbilled' },
  { id: 4, staff: 'Michael Scott (Engagement Partner)', client: 'Acme Corporation (Pty) Ltd', task: 'ISA 320 Materiality & Risk Review', hours: 3.0, rate: 3200, date: '2024-10-27', status: 'Unbilled' },
]

export default function PracticeManagement() {
  const firm = useAuthStore(s => s.firm)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  const currCode = getCurrencyCode(firm?.currency)
  const [timesheets, setTimesheets] = useState(INITIAL_TIMESHEETS)
  const [activeTab, setActiveTab] = useState('timesheets')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [newLog, setNewLog] = useState({
    staff: 'Sarah Jenkins (Audit Manager)',
    task: 'Substantive Sample Vouching',
    hours: 4.0,
    rate: 1850,
    date: new Date().toISOString().split('T')[0]
  })

  // Budget Tracker
  const budgetedHours = 120
  const loggedHours = timesheets.reduce((s, t) => s + t.hours, 0)
  const totalWipValue = timesheets.filter(t => t.status === 'Unbilled').reduce((s, t) => s + (t.hours * t.rate), 0)
  const totalBilledValue = timesheets.filter(t => t.status === 'Billed').reduce((s, t) => s + (t.hours * t.rate), 0)
  const budgetUtilization = Math.round((loggedHours / budgetedHours) * 100)

  const handleAddLog = (e) => {
    e.preventDefault()
    const entry = {
      id: Date.now(),
      staff: newLog.staff,
      client: activeClient?.name || 'Selected Client',
      task: newLog.task,
      hours: parseFloat(newLog.hours) || 0,
      rate: parseFloat(newLog.rate) || 0,
      date: newLog.date,
      status: 'Unbilled'
    }
    setTimesheets([entry, ...timesheets])
    setIsModalOpen(false)
  }

  const handleExportTimesheet = () => {
    const rows = [
      ['PRACTICE TIMESHEET & BILLABLE WORK-IN-PROGRESS (WIP)', activeClient?.name, `Reporting Currency: ${currCode}`],
      ['Total Logged Hours', `${loggedHours} hrs`, 'Total Unbilled WIP Value', formatCurrency(totalWipValue, firm?.currency)],
      [],
      ['Date', 'Auditor / Practitioner', 'Engagement Client', 'Audit Procedure / Task', 'Hours Logged', `Chargeout Rate (${currCode})`, `Total Amount (${currCode})`, 'Billing Status'],
      ...timesheets.map(t => [
        t.date,
        t.staff,
        t.client,
        t.task,
        t.hours,
        t.rate,
        t.hours * t.rate,
        t.status
      ])
    ]

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${(activeClient?.name || 'Provident').replace(/[^a-zA-Z0-9]/g, '_')}_Timesheets_WIP.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Practice Management</span>
            <span>/</span>
            <span className="font-semibold text-slate-700">{activeClient?.name}</span>
            <span>/</span>
            <span className="text-indigo-600 font-semibold">Timesheets, WIP & Fee Billing</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Practice Management & Timesheet Billing
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportTimesheet}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Download size={13} />
            <span>Export Timesheets CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Log Time Entry</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Unbilled WIP Value</span>
          <span className="text-xl font-bold text-indigo-700 font-mono">{formatCurrency(totalWipValue, firm?.currency)}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Ready for professional fee invoicing</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Logged Hours vs Budget</span>
          <span className="text-xl font-bold text-slate-900 font-mono">{loggedHours} / {budgetedHours} hrs</span>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min(budgetUtilization, 100)}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Budget Burn Rate</span>
          <span className="text-xl font-bold text-emerald-600 font-mono">{budgetUtilization}%</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">{budgetedHours - loggedHours} hours remaining</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Total Billed YTD</span>
          <span className="text-xl font-bold text-slate-900 font-mono">{formatCurrency(totalBilledValue, firm?.currency)}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Cleared invoices</span>
        </div>
      </div>

      {/* Timesheet Entries Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Detailed Audit Timesheets & WIP Allocations
          </h3>
          <span className="text-xs font-bold text-indigo-600 font-mono">{timesheets.length} Time Logs</span>
        </div>

        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="text-left px-5 py-3 w-28">Date</th>
              <th className="text-left px-5 py-3 w-48">Staff Member</th>
              <th className="text-left px-5 py-3">Audit Task / Narrative</th>
              <th className="text-right px-5 py-3 w-24">Hours</th>
              <th className="text-right px-5 py-3 w-32">Rate ({currCode})</th>
              <th className="text-right px-5 py-3 w-32">Amount ({currCode})</th>
              <th className="text-right px-5 py-3 w-28">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {timesheets.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-3 font-mono text-slate-500">{t.date}</td>
                <td className="px-5 py-3 font-semibold text-slate-900">{t.staff}</td>
                <td className="px-5 py-3 text-slate-600">{t.task}</td>
                <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">{t.hours.toFixed(1)}</td>
                <td className="px-5 py-3 text-right font-mono text-slate-500">{formatCurrency(t.rate, firm?.currency)}</td>
                <td className="px-5 py-3 text-right font-mono font-bold text-indigo-700">
                  {formatCurrency(t.hours * t.rate, firm?.currency)}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                    t.status === 'Billed'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-emerald-100 text-emerald-800 font-bold'
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Log Time Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Log Billable Engagement Time</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Practitioner / Auditor</label>
                <select
                  value={newLog.staff}
                  onChange={e => setNewLog({ ...newLog, staff: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-600 bg-white"
                >
                  <option>Michael Scott (Engagement Partner) - R 3,200/hr</option>
                  <option>Sarah Jenkins (Audit Manager) - R 1,850/hr</option>
                  <option>David Dlamini (Senior Trainee) - R 950/hr</option>
                  <option>Thabo Mokoena (Junior Trainee) - R 750/hr</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Audit Task Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Substantive Vouching of Inventory Purchases"
                  value={newLog.task}
                  onChange={e => setNewLog({ ...newLog, task: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newLog.hours}
                    onChange={e => setNewLog({ ...newLog, hours: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Charge Rate (ZAR)</label>
                  <input
                    type="number"
                    value={newLog.rate}
                    onChange={e => setNewLog({ ...newLog, rate: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date Logged</label>
                <input
                  type="date"
                  value={newLog.date}
                  onChange={e => setNewLog({ ...newLog, date: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded shadow-xs cursor-pointer"
                >
                  Save Time Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import {
  TrendingUp, Users, DollarSign, ArrowUpRight,
  Bot, Scale, ShieldCheck, ChevronRight, Calendar,
  ArrowDownRight, CheckCircle2, AlertCircle, FileSpreadsheet
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { useAuthStore } from '@/store/authStore'
import { useAccountingStore, formatCurrency } from '@/store/accountingStore'

const revenueData = [
  { month: 'Jan', revenue: 42000, expenses: 28000 },
  { month: 'Feb', revenue: 51000, expenses: 31000 },
  { month: 'Mar', revenue: 47000, expenses: 29000 },
  { month: 'Apr', revenue: 63000, expenses: 35000 },
  { month: 'May', revenue: 58000, expenses: 33000 },
  { month: 'Jun', revenue: 71000, expenses: 38000 },
  { month: 'Jul', revenue: 68000, expenses: 37000 },
  { month: 'Aug', revenue: 79000, expenses: 42000 },
  { month: 'Sep', revenue: 84000, expenses: 45000 },
  { month: 'Oct', revenue: 91000, expenses: 48000 },
]

const auditChecklist = [
  { ref: 'WP-001', item: 'Cash & Bank Reconciliation Statement', status: 'Passed', author: 'Auto-Auditor', date: 'Oct 28' },
  { ref: 'WP-002', item: 'Debtors Ledger Ageing Analysis & Recoverability', status: 'Review', author: 'Jane Doe', date: 'Oct 27' },
  { ref: 'WP-003', item: 'Fixed Asset Depreciation & Additions Register', status: 'Passed', author: 'System Kernel', date: 'Oct 25' },
  { ref: 'WP-004', item: 'IFRS 16 Right-of-Use Asset Amortization', status: 'Pending', author: 'Senior Review', date: 'Oct 24' },
]

export default function Dashboard() {
  const user = useAuthStore(s => s.user)
  const firm = useAuthStore(s => s.firm)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const workingPapers = useAccountingStore(s => s.workingPapers)

  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]
  const clientPapers = workingPapers.filter(w => !w.clientId || w.clientId === activeClientId)
  const completedPapers = clientPapers.filter(w => w.status === 'Complete')
  const signOffPct = clientPapers.length > 0 ? Math.round((completedPapers.length / clientPapers.length) * 100) : 75

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Audit & Financial Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            FY2024 Audit Engagement for <strong>{activeClient?.name || 'Selected Entity'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-xs text-xs text-slate-600">
            <Calendar size={13} className="text-slate-400" />
            <span>Reporting Period: <strong>October 2024</strong></span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-md text-xs font-medium">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Trial Balance Balanced ({formatCurrency(0, firm?.currency)})</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue (YTD)', value: formatCurrency(741500, firm?.currency), change: '+12.5%', up: true, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Net Profit Margin', value: formatCurrency(229600, firm?.currency), change: '31.0%', up: true, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Audit Files', value: `${clients.length} Entities`, change: '+3 this month', up: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Audit File Sign-Off', value: `${signOffPct}%`, change: `${completedPapers.length} of ${clientPapers.length} schedules`, up: true, icon: Scale, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
              <div className={`p-2 rounded-md ${kpi.bg}`}>
                <kpi.icon size={15} className={kpi.color} />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 mb-1">{kpi.value}</div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <ArrowUpRight size={13} />
              <span>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart + AI Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Revenue & Expense Trajectory</h2>
              <p className="text-xs text-slate-500">General Ledger 10-month performance comparison</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Expenses
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#10B981" strokeWidth={2} fill="url(#colorExp)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Copilot & Risk Feed */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                  <Bot size={13} />
                </div>
                <h2 className="text-sm font-bold text-slate-900">AI Audit Copilot</h2>
              </div>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                GEMINI 2.0
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                <span className="text-xs font-bold text-amber-800 block mb-0.5">Anomaly Detected</span>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Marketing expenses spiked 34% in October compared to the 6-month mean. Recommend voucher sampling.
                </p>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                <span className="text-xs font-bold text-blue-800 block mb-0.5">Cut-Off Verification</span>
                <p className="text-xs text-blue-700 leading-relaxed">
                  12 post-period journal entries inspected; sequential transaction numbering intact.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <span className="text-xs font-bold text-emerald-800 block mb-0.5">Ratio Consistency</span>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Gross profit margin maintained at 58% vs prior year 56.7%. Within standard tolerance.
                </p>
              </div>
            </div>
          </div>

          <a
            href="/ai"
            className="mt-4 flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 rounded-md border border-slate-200 transition-colors"
          >
            <span>Ask Provident AI Copilot</span>
            <ChevronRight size={14} className="text-slate-400" />
          </a>
        </div>
      </div>

      {/* CaseWare Working Paper Lead Schedule Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={15} className="text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Lead Schedule & Audit Procedures Checklist
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">4 Core Working Papers Tracked</span>
        </div>

        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
            <tr>
              <th className="text-left px-5 py-3">Schedule Ref</th>
              <th className="text-left px-5 py-3">Audit Procedure</th>
              <th className="text-left px-5 py-3">Assigned Auditor</th>
              <th className="text-left px-5 py-3">Last Verified</th>
              <th className="text-right px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditChecklist.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-mono font-bold text-indigo-600">{row.ref}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{row.item}</td>
                <td className="px-5 py-3 text-slate-500">{row.author}</td>
                <td className="px-5 py-3 text-slate-400">{row.date}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    row.status === 'Passed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : row.status === 'Review'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

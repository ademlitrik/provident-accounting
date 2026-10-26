import { useState } from 'react'
import {
  Plus, CheckCircle2, Circle, Clock, Download, X, Trash2, Printer,
  ShieldCheck, FileText, Check, ExternalLink, Paperclip, UserCheck
} from 'lucide-react'
import { useAccountingStore } from '@/store/accountingStore'
import { useAuthStore } from '@/store/authStore'

export default function WorkingPapers() {
  const firm = useAuthStore(s => s.firm)
  const workingPapers = useAccountingStore(s => s.workingPapers)
  const updateWorkingPaperStatus = useAccountingStore(s => s.updateWorkingPaperStatus)
  const addWorkingPaper = useAccountingStore(s => s.addWorkingPaper)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const documents = useAccountingStore(s => s.documents)

  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inspectingPaper, setInspectingPaper] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    section: 'Revenue',
    assignee: 'Jane Doe',
    status: 'In Progress',
    risk: 'Low',
    balance: 'R 0',
  })

  // Filter working papers for active client, fallback to all if unassigned
  const clientPapers = workingPapers.filter(p => !p.clientId || p.clientId === activeClientId)
  const clientDocs = documents.filter(d => !d.clientId || d.clientId === activeClientId)

  const completeCount = clientPapers.filter(p => p.status === 'Complete').length
  const totalCount = clientPapers.length
  const pct = totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0

  const handleStatusCycle = (paper, e) => {
    e.stopPropagation()
    const nextStatus = paper.status === 'Not Started'
      ? 'In Progress'
      : paper.status === 'In Progress'
      ? 'Complete'
      : 'Not Started'
    updateWorkingPaperStatus(paper.id, nextStatus)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    addWorkingPaper({ ...formData, clientId: activeClientId })
    setIsModalOpen(false)
    setFormData({
      title: '',
      section: 'Revenue',
      assignee: 'Jane Doe',
      status: 'In Progress',
      risk: 'Low',
      balance: 'R 0',
    })
  }

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + `Engagement Entity:,"${activeClient?.name || 'Provident'}"\n`
      + `Framework:,"ISA 230 / Probe MMX Audit Working Papers"\n\n`
      + "Index,Section,Title,Assigned Auditor,Ledger Balance,Risk Level,Audit Status\n"
      + clientPapers.map(p => `"${p.id}","${p.section}","${p.title}","${p.assignee}","${p.balance}","${p.risk}","${p.status}"`).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${(activeClient?.name || 'Provident').replace(/[^a-zA-Z0-9]/g, '_')}_Audit_Working_Papers.csv`)
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
            Audit Working Papers & Lead Schedules
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ISA 230 audit engagement files for <strong>{activeClient?.name}</strong> · Probe MMX Compliant
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Printer size={13} />
            <span>Print File</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Download size={13} />
            <span>Export Engagement Pack</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Lead Schedule</span>
          </button>
        </div>
      </div>

      {/* Audit Engagement Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-bold text-slate-900">Overall Audit File Completion</span>
            <p className="text-xs text-slate-500">{completeCount} of {totalCount} lead schedules verified and signed off</p>
          </div>
          <span className="text-xl font-bold font-mono text-indigo-600">{pct}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Working Papers List */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="text-left px-5 py-3 w-24">Index #</th>
              <th className="text-left px-5 py-3 w-32">Section</th>
              <th className="text-left px-5 py-3">Lead Schedule Title</th>
              <th className="text-left px-5 py-3 w-36">Assigned Auditor</th>
              <th className="text-right px-5 py-3 w-32">Ledger Balance</th>
              <th className="text-center px-5 py-3 w-28">Risk Level</th>
              <th className="text-center px-5 py-3 w-32">Audit Sign-Off</th>
              <th className="text-right px-5 py-3 w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clientPapers.map(p => (
              <tr
                key={p.id}
                className="hover:bg-slate-50/80 transition-colors select-none"
              >
                <td className="px-5 py-3 font-mono font-bold text-indigo-600">{p.id}</td>
                <td className="px-5 py-3 text-slate-500 font-medium">{p.section}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{p.title}</td>
                <td className="px-5 py-3 text-slate-600">{p.assignee}</td>
                <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">{p.balance}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    p.risk === 'Low'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : p.risk === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {p.risk} Risk
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <button
                    onClick={(e) => handleStatusCycle(p, e)}
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-transform active:scale-95 cursor-pointer ${
                      p.status === 'Complete'
                        ? 'bg-emerald-100 text-emerald-800 font-bold'
                        : p.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.status} ⟳
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setInspectingPaper(p)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                  >
                    Inspect →
                  </button>
                </td>
              </tr>
            ))}
            {clientPapers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  No lead schedules created for {activeClient?.name}. Click "Add Lead Schedule" above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* INSPECTOR MODAL: CaseWare / Probe MMX Detailed Working Paper Sheet */}
      {inspectingPaper && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">
                  Probe MMX Lead Schedule Worksheet
                </span>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>{inspectingPaper.id}: {inspectingPaper.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    inspectingPaper.status === 'Complete' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inspectingPaper.status}
                  </span>
                </h2>
              </div>
              <button onClick={() => setInspectingPaper(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {/* Engagement Meta Strip */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Client Entity</span>
                <span className="font-bold text-slate-800">{activeClient?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Financial Year End</span>
                <span className="text-slate-700">{activeClient?.fyEnd || '31 Oct 2024'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Audited Balance</span>
                <span className="font-bold text-indigo-700">{inspectingPaper.balance}</span>
              </div>
            </div>

            {/* Section 1: ISA Audit Assertions Matrix */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wide">
                1. ISA 315 / 500 Audit Assertions Addressed
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'existence', label: 'Existence / Occurrence (Balances actually exist)' },
                  { id: 'completeness', label: 'Completeness (All transactions recorded, no omissions)' },
                  { id: 'accuracy', label: 'Accuracy & Valuation (Appropriate carrying values applied)' },
                  { id: 'rights', label: 'Rights & Obligations (Entity owns assets and owes liabilities)' },
                  { id: 'cutoff', label: 'Cut-off (Transactions recorded in proper fiscal period)' },
                  { id: 'presentation', label: 'Presentation & Disclosure (In accordance with framework)' },
                ].map(ass => (
                  <label key={ass.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded text-slate-700">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                    <span className="text-[11px] font-medium">{ass.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 2: Audit Procedures Conducted */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wide">
                2. Audit Procedures Performed & Testing Findings
              </h3>
              <textarea
                rows={3}
                defaultValue={`1. Reconciled schedule balance to trial balance account code.
2. Verified supporting invoices, agreements, and bank confirmations.
3. Computed sampling accuracy under ISA 530; no material anomalies or unadjusted misstatements noted.`}
                className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-indigo-600 font-mono"
              />
            </div>

            {/* Section 3: Linked Evidence Documents */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase text-slate-900 tracking-wide flex items-center justify-between">
                <span>3. Cross-Referenced Evidence Documents</span>
                <span className="text-[10px] font-mono text-slate-400">{clientDocs.length} Documents Available</span>
              </h3>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {clientDocs.slice(0, 3).map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-indigo-50/50 border border-indigo-100 rounded text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Paperclip size={12} className="text-indigo-600" />
                      {doc.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{doc.id} · {doc.ocrStatus}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Sign-Off Stamps */}
            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">Prepared By (Auditor):</span>
                <span className="font-bold text-slate-800">{inspectingPaper.assignee}</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Signed Off ✓</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-400 block font-sans">Reviewed By (Partner):</span>
                <span className="font-bold text-slate-800">Engagement Lead Partner</span>
                <span className="text-[10px] text-indigo-600 block mt-0.5 font-bold">Approved for AFS Assembly ✓</span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
              >
                Print Schedule
              </button>
              <button
                type="button"
                onClick={() => {
                  updateWorkingPaperStatus(inspectingPaper.id, 'Complete')
                  setInspectingPaper(null)
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded shadow-xs cursor-pointer"
              >
                Save & Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Lead Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Add Audit Lead Schedule</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lead Schedule Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Schedule — Intangibles & Goodwills"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-600 bg-white"
                  >
                    <option>Revenue</option>
                    <option>Cash & Bank</option>
                    <option>Receivables</option>
                    <option>Fixed Assets</option>
                    <option>Taxation</option>
                    <option>Liabilities</option>
                    <option>Equity</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Auditor</label>
                  <input
                    type="text"
                    required
                    value={formData.assignee}
                    onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Risk Assessment</label>
                  <select
                    value={formData.risk}
                    onChange={e => setFormData({ ...formData, risk: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-600 bg-white"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Balance</label>
                  <input
                    type="text"
                    value={formData.balance}
                    onChange={e => setFormData({ ...formData, balance: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
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
                  Save Lead Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

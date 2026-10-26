import { useState } from 'react'
import {
  FileSpreadsheet, CheckCircle2, AlertTriangle, Calculator,
  Download, Plus, RefreshCw, ArrowRight, ShieldCheck, Check, Printer
} from 'lucide-react'
import { useAccountingStore, formatCurrency, getCurrencyCode } from '@/store/accountingStore'
import { useAuthStore } from '@/store/authStore'

const SAMPLE_POPULATION = [
  { id: 'TXN-901', ref: 'INV-401', date: '2024-01-15', vendor: 'Dell Technologies Computer Equip', amount: 45000, sampled: true, tested: true, result: 'Satisfactory', tick: 'V' },
  { id: 'TXN-902', ref: 'INV-402', date: '2024-02-18', vendor: 'Apex Digital Marketing Media', amount: 12400, sampled: true, tested: true, result: 'Satisfactory', tick: 'V' },
  { id: 'TXN-903', ref: 'INV-403', date: '2024-03-22', vendor: 'Commercial Property Suite Lease', amount: 33000, sampled: true, tested: true, result: 'Satisfactory', tick: 'V' },
  { id: 'TXN-904', ref: 'INV-404', date: '2024-04-10', vendor: 'Office Stationary & Paper Depot', amount: 8400, sampled: false, tested: false, result: 'Not Sampled', tick: '—' },
  { id: 'TXN-905', ref: 'INV-405', date: '2024-05-19', vendor: 'Corporate Legal & Advisory Retainer', amount: 28500, sampled: true, tested: true, result: 'Satisfactory', tick: 'V' },
  { id: 'TXN-906', ref: 'INV-406', date: '2024-06-14', vendor: 'Power Utility & City Substation', amount: 4200, sampled: false, tested: false, result: 'Not Sampled', tick: '—' },
  { id: 'TXN-907', ref: 'INV-407', date: '2024-07-29', vendor: 'Auditing Software Licensing Package', amount: 18000, sampled: true, tested: false, result: 'Pending Voucher', tick: '?' },
  { id: 'TXN-908', ref: 'INV-408', date: '2024-08-11', vendor: 'Warehouse Security Monitoring', amount: 6500, sampled: false, tested: false, result: 'Not Sampled', tick: '—' },
  { id: 'TXN-909', ref: 'INV-409', date: '2024-09-03', vendor: 'Executive Travel & Airfare Flight', amount: 14800, sampled: true, tested: true, result: 'Satisfactory', tick: 'V' },
  { id: 'TXN-910', ref: 'INV-410', date: '2024-10-18', vendor: 'Annual Cloud Storage Servers Host', amount: 22000, sampled: true, tested: true, result: 'Satisfactory', tick: 'V' },
]

export default function SubstantiveSampling() {
  const firm = useAuthStore(s => s.firm)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  const currCode = getCurrencyCode(firm?.currency)
  const [items, setItems] = useState(SAMPLE_POPULATION)
  const [samplingMethod, setSamplingMethod] = useState('MUS') // MUS, Random, Systematic
  const [tolerableError, setTolerableError] = useState(55000)
  const [expectedError, setExpectedError] = useState(5000)
  const [confidenceLevel, setConfidenceLevel] = useState(95)

  const populationValue = items.reduce((s, i) => s + i.amount, 0)
  const sampledItems = items.filter(i => i.sampled)
  const sampledValue = sampledItems.reduce((s, i) => s + i.amount, 0)
  const coveragePct = populationValue > 0 ? Math.round((sampledValue / populationValue) * 100) : 0
  const testedCount = sampledItems.filter(i => i.tested && i.result === 'Satisfactory').length

  const handleToggleTested = (id) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextTested = !item.tested
        return {
          ...item,
          tested: nextTested,
          result: nextTested ? 'Satisfactory' : 'Pending Voucher',
          tick: nextTested ? 'V' : '?'
        }
      }
      return item
    }))
  }

  const handleExportSampleSheet = () => {
    const rows = [
      ['ISA 530 AUDIT SAMPLING & VOUCHING WORKSHEET', activeClient?.name || 'Provident', `Currency: ${currCode}`],
      ['Sampling Method: Monetary-Unit Sampling (MUS)', `Confidence Level: ${confidenceLevel}%`, 'Audit Standard: ISA 530'],
      ['Total Population Value', populationValue, 'Sampled Coverage Value', sampledValue, 'Coverage Percentage', `${coveragePct}%`],
      [],
      ['Transaction ID', 'Invoice Ref', 'Date', 'Vendor / Account Narrative', `Amount (${currCode})`, 'Sampled For Testing', 'Audit Conclusion', 'Tick Mark'],
      ...items.map(i => [
        i.id,
        i.ref,
        i.date,
        i.vendor,
        i.amount,
        i.sampled ? 'YES' : 'NO',
        i.result,
        i.tick
      ]),
      [],
      ['Auditor Conclusion:', `Vouched ${testedCount} of ${sampledItems.length} items without material misstatement.`, 'Status: APPROVED']
    ]

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${(activeClient?.name || 'Provident').replace(/[^a-zA-Z0-9]/g, '_')}_ISA530_Sampling_Sheet.csv`)
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
            <span>ISA 530 Audit Sampling</span>
            <span>/</span>
            <span className="font-semibold text-slate-700">{activeClient?.name}</span>
            <span>/</span>
            <span className="text-indigo-600 font-semibold">Substantive Testing & Vouching Worksheet</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Audit Sampling & Vouching Workstation (ISA 530)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Sheet</span>
          </button>
          <button
            onClick={handleExportSampleSheet}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Download size={13} />
            <span>Export Sample Testing Sheet</span>
          </button>
        </div>
      </div>

      {/* Sampling Parameters Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Population Value</span>
          <span className="text-xl font-bold text-slate-900 font-mono">{formatCurrency(populationValue, firm?.currency)}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{items.length} Recorded Ledger Entries</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Sample Coverage Value</span>
          <span className="text-xl font-bold text-indigo-600 font-mono">{formatCurrency(sampledValue, firm?.currency)}</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">{coveragePct}% Population Coverage</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Sampling Method</span>
          <span className="text-base font-bold text-slate-900">Monetary-Unit (MUS)</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Confidence: {confidenceLevel}%</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Vouching Completion</span>
          <span className="text-xl font-bold text-emerald-600 font-mono">{testedCount} of {sampledItems.length}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Vouched to original invoices</span>
        </div>
      </div>

      {/* Audit Vouching Worksheet Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Substantive Vouching Testing Sheet (Click Row to Toggle Vouched State)
            </h3>
            <span className="text-[11px] text-slate-500">Legend: [V] Vouched to Tax Invoice & Proof of Settlement | [?] Awaiting Supporting Evidence</span>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-600">
            {sampledItems.length} Sampled Transactions
          </span>
        </div>

        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="text-left px-5 py-3 w-28">Txn ID</th>
              <th className="text-left px-5 py-3 w-28">Invoice Ref</th>
              <th className="text-left px-5 py-3 w-28">Date</th>
              <th className="text-left px-5 py-3">Vendor / Account Narrative</th>
              <th className="text-right px-5 py-3 w-32">Amount ({currCode})</th>
              <th className="text-center px-5 py-3 w-24">Sampling</th>
              <th className="text-center px-5 py-3 w-28">Tick Mark</th>
              <th className="text-right px-5 py-3 w-36">Audit Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr
                key={item.id}
                onClick={() => item.sampled && handleToggleTested(item.id)}
                className={`transition-colors ${
                  item.sampled ? 'hover:bg-indigo-50/40 cursor-pointer' : 'opacity-60 bg-slate-50/50'
                }`}
              >
                <td className="px-5 py-3 font-mono font-bold text-indigo-600">{item.id}</td>
                <td className="px-5 py-3 font-mono text-slate-600">{item.ref}</td>
                <td className="px-5 py-3 text-slate-500">{item.date}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{item.vendor}</td>
                <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">
                  {formatCurrency(item.amount, firm?.currency)}
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                    item.sampled
                      ? 'bg-indigo-100 text-indigo-700 font-bold'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.sampled ? 'Sampled' : 'Excluded'}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs ${
                    item.tick === 'V'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.tick === '?'
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-slate-400'
                  }`}>
                    {item.tick}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    item.result === 'Satisfactory'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.result === 'Pending Voucher'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'text-slate-400'
                  }`}>
                    {item.result}
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

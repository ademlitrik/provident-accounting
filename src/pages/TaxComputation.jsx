import { useState } from 'react'
import {
  Calculator, Download, Printer, ShieldCheck,
  AlertCircle, CheckCircle2, FileText, ArrowRight, DollarSign
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import { useAccountingStore, formatCurrency, getCurrencyCode } from '@/store/accountingStore'

export default function TaxComputation() {
  const theme = useAppStore(s => s.theme)
  const isDark = theme === 'Dark Gray' || theme === 'Black'

  const firm = useAuthStore(s => s.firm)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  const currCode = getCurrencyCode(firm?.currency)

  // Standard corporate tax inputs
  const [netAccountingProfit, setNetProfit] = useState(229600)
  const [depreciationAddBack, setDepreciation] = useState(14400)
  const [taxCapitalAllowance, setCapitalAllowance] = useState(18200)
  const [entertainmentNonDeductible, setEntertainment] = useState(2500)
  const [finesAndPenalties, setFines] = useState(1200)
  const [taxRate, setTaxRate] = useState(27) // South Africa SARS CIT rate: 27%
  const [provisionalTaxPaid, setProvisionalPaid] = useState(45000)

  // Calculations
  const totalAddBacks = depreciationAddBack + entertainmentNonDeductible + finesAndPenalties
  const totalDeductions = taxCapitalAllowance
  const taxableIncome = netAccountingProfit + totalAddBacks - totalDeductions
  const grossTaxLiability = Math.round(taxableIncome * (taxRate / 100))
  const netTaxPayable = grossTaxLiability - provisionalTaxPaid

  const handleExportCsv = () => {
    const rows = [
      ['Provident Corporate Tax Working Paper (ITR14)', activeClient?.name, `Reporting Currency: ${currCode}`],
      ['Tax Year', '2024'],
      ['Statutory Tax Rate', `${taxRate}%`],
      [],
      ['Item Description', `Amount (${currCode})`],
      ['Net Profit per Audited Accounts', netAccountingProfit],
      ['Add: Accounting Depreciation & Impairment', depreciationAddBack],
      ['Add: Entertainment & Non-Allowable Hospitality', entertainmentNonDeductible],
      ['Add: Statutory Penalties & Fines', finesAndPenalties],
      ['Total Non-Deductible Add-Backs', totalAddBacks],
      ['Less: Section 12C / 11(e) Wear & Tear Deductions', -taxCapitalAllowance],
      ['Taxable Income', taxableIncome],
      ['Gross Corporate Income Tax Liability', grossTaxLiability],
      ['Less: Provisional Tax Payments Made', -provisionalTaxPaid],
      ['Final Net Assessment Tax Liability', netTaxPayable]
    ]

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${(activeClient?.name || 'Provident').replace(/[^a-zA-Z0-9]/g, '_')}_Tax_Computation.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6" style={{ userSelect: 'text' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b"
           style={{ borderColor: isDark ? '#333339' : '#E5E7EB' }}>
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Provident Tax Engine</span>
            <span>/</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{activeClient?.name}</span>
            <span>/</span>
            <span className="text-[#5B5FC7]">Corporate Income Tax (CIT / ITR14)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Corporate Tax Computation (FY 2024)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded text-xs hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Tax Schedule</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 bg-[#5B5FC7] hover:bg-[#4A4EB5] text-white px-3.5 py-1.5 rounded text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Download size={13} />
            <span>Export Tax Return Pack</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
          <span className="text-xs text-slate-400 block font-medium">Net Profit before Tax</span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-1 block">
            {formatCurrency(netAccountingProfit, firm?.currency)}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">From Statement of Comprehensive Income</span>
        </div>

        <div className="bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
          <span className="text-xs text-slate-400 block font-medium">Taxable Income (Adjusted)</span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-1 block">
            {formatCurrency(taxableIncome, firm?.currency)}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">Statutory Tax Base</span>
        </div>

        <div className="bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
          <span className="text-xs text-slate-400 block font-medium">Net Tax Due / (Refundable)</span>
          <span className={`text-xl font-bold font-mono mt-1 block ${netTaxPayable > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {formatCurrency(Math.abs(netTaxPayable), firm?.currency)} {netTaxPayable > 0 ? 'Payable' : 'Credit'}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">After provisional payments</span>
        </div>
      </div>

      {/* Computation Table */}
      <div className="bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          Tax Computation Working Schedule
        </h3>

        <div className="space-y-4 text-xs">
          {/* Accounting Profit */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Net Profit per Audited Accounts</span>
              <p className="text-slate-400 text-[11px]">Profit before taxation</p>
            </div>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(netAccountingProfit, firm?.currency)}
            </span>
          </div>

          {/* Add-Backs */}
          <div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded font-semibold text-slate-800 dark:text-slate-200 flex justify-between">
              <span>Add: Non-Deductible Expenses & Accounting Add-Backs</span>
              <span className="font-mono">+{formatCurrency(totalAddBacks, firm?.currency)}</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 pl-4 pr-1">
              <div className="flex justify-between py-2">
                <span className="text-slate-600 dark:text-slate-400">Accounting Depreciation & Impairment</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(depreciationAddBack, firm?.currency)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600 dark:text-slate-400">Entertainment & Hospitality (Non-allowable)</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(entertainmentNonDeductible, firm?.currency)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600 dark:text-slate-400">Statutory Penalties, Fines & Interest</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(finesAndPenalties, firm?.currency)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded font-semibold text-slate-800 dark:text-slate-200 flex justify-between">
              <span>Less: Tax Deductions & Capital Allowances</span>
              <span className="font-mono text-rose-600">-{formatCurrency(totalDeductions, firm?.currency)}</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 pl-4 pr-1">
              <div className="flex justify-between py-2">
                <span className="text-slate-600 dark:text-slate-400">Section 12C / 11(e) Wear & Tear Capital Allowances</span>
                <span className="font-mono text-rose-600">({formatCurrency(taxCapitalAllowance, firm?.currency)})</span>
              </div>
            </div>
          </div>

          {/* Taxable Income Result */}
          <div className="flex justify-between py-3 px-3 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded font-bold text-slate-900 dark:text-slate-100">
            <span>Taxable Income Subject to Corporate Tax</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 text-sm">
              {formatCurrency(taxableIncome, firm?.currency)}
            </span>
          </div>

          {/* Tax Calculation */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600 dark:text-slate-400">Corporate Income Tax @ {taxRate}%</span>
              <span className="font-mono font-semibold">{formatCurrency(grossTaxLiability, firm?.currency)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600 dark:text-slate-400">Less: First & Second Provisional Tax Payments</span>
              <span className="font-mono text-rose-600">({formatCurrency(provisionalTaxPaid, firm?.currency)})</span>
            </div>
            <div className="flex justify-between py-2.5 px-3 bg-slate-100 dark:bg-slate-800 font-bold rounded text-sm text-slate-900 dark:text-white">
              <span>Final Assessment Tax Liability Due</span>
              <span className="font-mono text-rose-600">
                {formatCurrency(netTaxPayable, firm?.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

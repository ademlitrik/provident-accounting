import { useState, useMemo } from 'react'
import {
  Scale, Calculator, ShieldCheck, CheckCircle2, AlertTriangle,
  Building2, Users, FileText, ArrowRight, Info, Download, Check, Printer
} from 'lucide-react'
import { calculatePublicInterestScore, calculateAuditMateriality } from '@/modules/compliance/southAfricaEngine'
import { useAccountingStore } from '@/store/accountingStore'
import { useAuthStore } from '@/store/authStore'

export default function SouthAfricaAuditPlanner() {
  const [activeTab, setActiveTab] = useState('pis')
  const [lockStatus, setLockStatus] = useState('')
  const [memoStatus, setMemoStatus] = useState('')

  const firm = useAuthStore(s => s.firm)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const updateClient = useAccountingStore(s => s.updateClient)
  const addWorkingPaper = useAccountingStore(s => s.addWorkingPaper)
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  // PIS State
  const [pisForm, setPisForm] = useState({
    avgEmployees: 42,
    thirdPartyLiabilities: 369700000, // R369.7m
    turnover: 741500000, // R741.5m
    beneficialHolders: 8,
    isPublicOrStateOwned: false,
    isHoldingFiduciaryAssets: false,
    fiduciaryAssetValue: 0,
    isInternallyCompiled: false
  })

  // Materiality State
  const [matForm, setMatForm] = useState({
    turnover: 74150000, // R74.15m
    preTaxProfit: 22960000,
    totalAssets: 92000000,
    equity: 59900000,
    benchmarkType: 'Turnover',
    benchmarkPercentage: 1.0,
    performanceMaterialityPct: 75,
    clearlyTrivialPct: 5
  })

  // Calculations
  const pisResult = useMemo(() => calculatePublicInterestScore(pisForm), [pisForm])
  const matResult = useMemo(() => calculateAuditMateriality(matForm), [matForm])

  const handleLockScope = () => {
    updateClient(activeClientId, {
      pisScore: pisResult.totalScore,
      requiredService: pisResult.requiredService,
      type: pisResult.reportingFramework,
      cipcStandard: pisResult.cipcStandard
    })
    setLockStatus('Scope Locked to Client File!')
    setTimeout(() => setLockStatus(''), 2500)
  }

  const handleSignOffMemo = () => {
    addWorkingPaper({
      title: `ISA 320 Materiality Memorandum (OM: R ${matResult.overallMateriality.toLocaleString()})`,
      section: 'Audit Planning & Scoping',
      assignee: 'Audit Partner / Engagement Lead',
      status: 'Complete',
      risk: 'Low',
      balance: `OM: R ${matResult.overallMateriality.toLocaleString()}`,
      clientId: activeClientId
    })
    setMemoStatus('Signed Off & Added to Working Papers!')
    setTimeout(() => setMemoStatus(''), 2500)
  }

  const handleExportMemo = () => {
    const rows = [
      ['ISA 320 AUDIT PLANNING MATERIALITY MEMORANDUM', activeClient?.name || 'Provident', 'Standard: ISA 320 / Companies Act 2008'],
      ['Audit Partner / Engagement Lead', 'Practice Leader', 'Fiscal Period: 31 October 2024'],
      [],
      ['1. Public Interest Score (PIS) & Legal Assurance Scope', ''],
      ['Average Employees Points', pisResult.breakdown.employeePoints],
      ['Third-Party Liabilities Points', pisResult.breakdown.liabilityPoints],
      ['Turnover / Gross Revenue Points', pisResult.breakdown.turnoverPoints],
      ['Shareholder / Beneficiary Points', pisResult.breakdown.holderPoints],
      ['TOTAL PUBLIC INTEREST SCORE', `${pisResult.totalScore} Points`],
      ['Required Engagement Level', pisResult.requiredService],
      ['Statutory Financial Framework', pisResult.reportingFramework],
      ['CIPC Filing Requirement', pisResult.cipcStandard],
      [],
      ['2. ISA 320 Materiality Calculation Thresholds', ''],
      ['Selected Audit Benchmark', matForm.benchmarkType],
      ['Benchmark Percentage Applied', `${matForm.benchmarkPercentage}%`],
      ['OVERALL MATERIALITY (OM)', `R ${matResult.overallMateriality.toLocaleString()}`],
      ['Performance Materiality (PM) Percentage', `${matForm.performanceMaterialityPct}%`],
      ['PERFORMANCE MATERIALITY (PM)', `R ${matResult.performanceMateriality.toLocaleString()}`],
      ['Clearly Trivial Threshold (CTT) Percentage', `${matForm.clearlyTrivialPct}%`],
      ['CLEARLY TRIVIAL THRESHOLD (CTT)', `R ${matResult.clearlyTrivialThreshold.toLocaleString()}`],
      [],
      ['Engagement Partner Sign-off', 'APPROVED', new Date().toISOString().split('T')[0]]
    ]

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${(activeClient?.name || 'Provident').replace(/[^a-zA-Z0-9]/g, '_')}_Materiality_Memorandum.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Audit & Assurance Framework</span>
            <span>/</span>
            <span className="font-semibold text-slate-700">{activeClient?.name}</span>
            <span>/</span>
            <span className="text-indigo-600 font-semibold">Companies Act 71 of 2008 & ISA 320</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            SA Statutory Audit & Assurance Planner
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Scope</span>
          </button>
          <button
            onClick={handleExportMemo}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Download size={13} />
            <span>Export Materiality Memo</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-md text-xs font-semibold text-indigo-700">
            <Scale size={14} className="text-indigo-600" />
            <span>SAICA / IRBA Aligned</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pis')}
          className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'pis'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          1. Public Interest Score (PIS) & Engagement Scope
        </button>
        <button
          onClick={() => setActiveTab('materiality')}
          className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'materiality'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          2. ISA 320 Materiality & Scoping Calculator
        </button>
      </div>

      {/* TAB 1: PIS CALCULATOR */}
      {activeTab === 'pis' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Companies Regulation 26 Parameters</h2>
                <p className="text-xs text-slate-400">Determine whether client requires Statutory Audit, Review, or Compilation</p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Section 30(2)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  1. Average Employees during FY
                </label>
                <input
                  type="number"
                  value={pisForm.avgEmployees}
                  onChange={e => setPisForm({ ...pisForm, avgEmployees: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">+1 point per employee</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  2. Third-Party Liabilities at Year End (ZAR)
                </label>
                <input
                  type="number"
                  value={pisForm.thirdPartyLiabilities}
                  onChange={e => setPisForm({ ...pisForm, thirdPartyLiabilities: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">+1 point per R1,000,000 of debt</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  3. Total Annual Turnover / Gross Income (ZAR)
                </label>
                <input
                  type="number"
                  value={pisForm.turnover}
                  onChange={e => setPisForm({ ...pisForm, turnover: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">+1 point per R1,000,000 turnover</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  4. Direct / Indirect Beneficial Shareholders
                </label>
                <input
                  type="number"
                  value={pisForm.beneficialHolders}
                  onChange={e => setPisForm({ ...pisForm, beneficialHolders: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">+1 point per shareholder/beneficiary</span>
              </div>
            </div>

            {/* Special Conditions Checkboxes */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={pisForm.isPublicOrStateOwned}
                  onChange={e => setPisForm({ ...pisForm, isPublicOrStateOwned: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span>Entity is a Public Company (Ltd) or State-Owned Enterprise (SOC)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={pisForm.isInternallyCompiled}
                  onChange={e => setPisForm({ ...pisForm, isInternallyCompiled: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span>Financial statements are compiled internally (not independently compiled)</span>
              </label>
            </div>
          </div>

          {/* Legal Result Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Statutory Engagement Determination
                </h3>
                <span className="text-xs font-bold text-indigo-600 font-mono">
                  Score: {pisResult.totalScore} pts
                </span>
              </div>

              {/* Score breakdown strip */}
              <div className="grid grid-cols-4 gap-2 my-3 text-center text-[10px] font-mono bg-slate-50 p-2 rounded border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Staff</span>
                  <span className="font-bold text-slate-800">{pisResult.breakdown.employeePoints}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Debt</span>
                  <span className="font-bold text-slate-800">{pisResult.breakdown.liabilityPoints}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Sales</span>
                  <span className="font-bold text-slate-800">{pisResult.breakdown.turnoverPoints}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Holders</span>
                  <span className="font-bold text-slate-800">{pisResult.breakdown.holderPoints}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Required Professional Service</span>
                  <div className="mt-0.5 inline-block font-bold text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded">
                    {pisResult.requiredService}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Financial Reporting Framework</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">{pisResult.reportingFramework}</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">CIPC Filing Standard</span>
                  <span className="font-medium text-slate-600 block mt-0.5">{pisResult.cipcStandard}</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 leading-relaxed">
                  <strong>Statutory Basis:</strong> {pisResult.requiresAuditReason}
                </div>
              </div>
            </div>

            <button
              onClick={handleLockScope}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              {lockStatus ? <Check size={14} /> : <ShieldCheck size={14} />}
              <span>{lockStatus || 'Lock Engagement Scope to File'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ISA 320 MATERIALITY */}
      {activeTab === 'materiality' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">ISA 320 Materiality Calculation Matrix</h2>
                <p className="text-xs text-slate-400">Establish benchmark thresholds for planning, sampling, and reporting unadjusted misstatements</p>
              </div>
              <span className="text-[10px] font-mono text-slate-400">ISA 320 & 450</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Audit Benchmark Selection</label>
                <select
                  value={matForm.benchmarkType}
                  onChange={e => setMatForm({ ...matForm, benchmarkType: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-600 bg-white"
                >
                  <option value="Turnover">Gross Revenue / Turnover (0.5% - 2%)</option>
                  <option value="PreTaxProfit">Profit Before Taxation (5% - 10%)</option>
                  <option value="TotalAssets">Total Assets (0.5% - 1%)</option>
                  <option value="Equity">Total Equity (1% - 5%)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Benchmark Percentage Applied (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={matForm.benchmarkPercentage}
                  onChange={e => setMatForm({ ...matForm, benchmarkPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Performance Materiality (% of Overall)</label>
                <input
                  type="number"
                  value={matForm.performanceMaterialityPct}
                  onChange={e => setMatForm({ ...matForm, performanceMaterialityPct: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Standard practice: 50% (High risk) to 75% (Low risk)</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clearly Trivial Threshold (% of Overall)</label>
                <input
                  type="number"
                  value={matForm.clearlyTrivialPct}
                  onChange={e => setMatForm({ ...matForm, clearlyTrivialPct: parseFloat(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Standard ISA 450 limit: 3% to 5%</span>
              </div>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  ISA 320 Approved Thresholds
                </h3>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  Calculated
                </span>
              </div>

              <div className="space-y-3.5 text-xs my-2">
                <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded">
                  <span className="text-[11px] text-slate-500 block">Overall Materiality (OM)</span>
                  <span className="text-xl font-bold font-mono text-indigo-700">
                    R {matResult.overallMateriality.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Financial statement level threshold</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[11px] text-slate-500 block">Performance Materiality (PM)</span>
                  <span className="text-lg font-bold font-mono text-slate-800">
                    R {matResult.performanceMateriality.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{matForm.performanceMaterialityPct}% for sample testing limit</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[11px] text-slate-500 block">Clearly Trivial Threshold (CTT)</span>
                  <span className="text-base font-bold font-mono text-slate-700">
                    R {matResult.clearlyTrivialThreshold.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Errors below this are not aggregated</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOffMemo}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              {memoStatus ? <Check size={14} /> : <FileText size={14} />}
              <span>{memoStatus || 'Sign Off Materiality Memorandum'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

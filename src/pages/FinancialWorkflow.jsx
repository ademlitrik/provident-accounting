import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Upload, FileText, BarChart2, Scale, Eye, FileDown, Check,
  ChevronRight, ChevronLeft, AlertTriangle, CheckCircle2, Loader2,
  FolderOpen, ArrowRight, BookOpen, FileSpreadsheet
} from 'lucide-react'
import { useAccountingStore } from '@/store/accountingStore'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'

const STEPS = [
  { id: 1, label: 'Select Client',       icon: Users,          desc: 'Choose an existing client or create a new engagement file.' },
  { id: 2, label: 'Upload Documents',    icon: Upload,         desc: 'Upload client source documents: bank statements, invoices, agreements.' },
  { id: 3, label: 'Import Bank Statements', icon: FileSpreadsheet, desc: 'Import and review bank transactions for reconciliation.' },
  { id: 4, label: 'Process & Organise', icon: BookOpen,       desc: 'Allocate transactions to chart of accounts and post journal entries.' },
  { id: 5, label: 'Trial Balance',       icon: Scale,          desc: 'Review and verify the trial balance — ensure debits equal credits.' },
  { id: 6, label: 'Review & Adjust',     icon: Eye,            desc: 'Make adjusting journal entries, review calculations and correct errors.' },
  { id: 7, label: 'Generate Statements', icon: BarChart2,      desc: 'Generate income statement, balance sheet and cash flow statement.' },
  { id: 8, label: 'Export',              icon: FileDown,       desc: 'Export completed financial statements as PDF, Excel or Word.' },
]

export default function FinancialWorkflow() {
  const navigate = useNavigate()
  const clients = useAccountingStore(s => s.clients)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const setActiveClient = useAccountingStore(s => s.setActiveClientId)
  const accounts = useAccountingStore(s => s.accounts)
  const addClient = useAccountingStore(s => s.addClient)
  const firm = useAuthStore(s => s.firm)

  const [step, setStep] = useState(1)
  const [selectedClientId, setSelectedClientId] = useState(activeClientId || clients[0]?.id)
  const [newClientName, setNewClientName] = useState('')
  const [newClientReg, setNewClientReg] = useState('')
  const [newClientFy, setNewClientFy] = useState('2024')
  const [isCreatingClient, setIsCreatingClient] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [bankRows, setBankRows] = useState([])
  const [stepNotes, setStepNotes] = useState({})
  const [stepComplete, setStepComplete] = useState({})
  const fileInputRef = useRef(null)
  const bankInputRef = useRef(null)

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0]

  const clientAccounts = (accounts || []).filter(a => a && a.clientId === selectedClientId)
  const totalDebit = clientAccounts.reduce((s, a) => s + (a.debit || (a.type === 'Asset' || a.type === 'Expense' ? Math.max(0, a.balance || 0) : 0)), 0)
  const totalCredit = clientAccounts.reduce((s, a) => s + (a.credit || (['Liability', 'Equity', 'Income'].includes(a.type) ? Math.abs(a.balance || 0) : 0)), 0)
  const diff = Math.abs(totalDebit - totalCredit)
  const tbBalanced = diff < 0.01

  const handleCreateClient = () => {
    if (!newClientName.trim()) return
    setIsCreatingClient(true)
    const newClient = addClient({ name: newClientName.trim(), regNumber: newClientReg, fiscalYear: newClientFy, industry: 'General' }, true)
    setTimeout(() => {
      const id = newClient?.id || clients[0]?.id
      setSelectedClientId(id)
      setActiveClient(id)
      setIsCreatingClient(false)
      setStepComplete(prev => ({ ...prev, 1: true }))
    }, 500)
  }

  const handleSelectClient = (id) => {
    setSelectedClientId(id)
    setActiveClient(id)
    setStepComplete(prev => ({ ...prev, 1: true }))
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    const newFiles = files.map(f => ({ name: f.name, size: f.size, type: f.type, uploadedAt: new Date().toLocaleString('en-ZA') }))
    setUploadedFiles(prev => [...prev, ...newFiles])
    if (files.length) setStepComplete(prev => ({ ...prev, 2: true }))
  }

  const handleBankImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Simple CSV parse
    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    const rows = lines.map(l => l.split(',').map(c => c.replace(/^"|"$/g, '').trim()))
    setBankRows(rows)
    setStepComplete(prev => ({ ...prev, 3: true }))
  }

  const goToPage = (path) => {
    navigate(path)
  }

  const nextStep = () => {
    if (step < 8) setStep(step + 1)
  }
  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const markComplete = () => {
    setStepComplete(prev => ({ ...prev, [step]: true }))
    if (step < 8) setStep(step + 1)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart2 size={22} className="text-indigo-600" />
          Financial Statement Preparation Workflow
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Follow this guided 8-step process to prepare accurate, complete financial statements for {selectedClient?.name || 'your client'}.
        </p>
      </div>

      {/* Progress stepper */}
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = step === s.id
          const isDone = stepComplete[s.id]
          return (
            <div key={s.id} className="flex items-center shrink-0">
              <button
                onClick={() => setStep(s.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all cursor-pointer min-w-[80px] ${
                  isActive ? 'bg-indigo-600 text-white shadow-md' :
                  isDone  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="relative">
                  {isDone && !isActive ? (
                    <Check size={18} className="text-emerald-600" />
                  ) : (
                    <Icon size={18} />
                  )}
                </div>
                <span className="text-[9px] font-semibold text-center leading-tight">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Step header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            {(() => { const Icon = STEPS[step - 1].icon; return <Icon size={20} /> })()}
            <div>
              <span className="text-xs font-medium opacity-80">Step {step} of {STEPS.length}</span>
              <h2 className="text-base font-bold">{STEPS[step - 1].label}</h2>
              <p className="text-xs opacity-80 mt-0.5">{STEPS[step - 1].desc}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* ── STEP 1: Select Client ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Select Existing Client</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clients.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectClient(c.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        selectedClientId === c.id
                          ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-sm">
                        {c.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-slate-500 text-[11px]">{c.regNumber || 'No Reg #'} · FY {c.fiscalYear || '2024'}</div>
                      </div>
                      {selectedClientId === c.id && <Check size={14} className="text-indigo-600 ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Or Create New Client</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-[11px] font-medium text-slate-600 mb-1 block">Client / Entity Name</label>
                    <input
                      type="text"
                      value={newClientName}
                      onChange={e => setNewClientName(e.target.value)}
                      placeholder="e.g. Acme Corporation (Pty) Ltd"
                      className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 mb-1 block">Fiscal Year</label>
                    <input
                      type="text"
                      value={newClientFy}
                      onChange={e => setNewClientFy(e.target.value)}
                      placeholder="2024"
                      className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-medium text-slate-600 mb-1 block">Registration Number (optional)</label>
                    <input
                      type="text"
                      value={newClientReg}
                      onChange={e => setNewClientReg(e.target.value)}
                      placeholder="e.g. 2024/123456/07"
                      className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCreateClient}
                      disabled={!newClientName.trim() || isCreatingClient}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer"
                    >
                      {isCreatingClient ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Create Client'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Upload Documents ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700">Drop documents here or click to browse</p>
                <p className="text-xs text-slate-500 mt-1">PDF, Excel, Word, Images — Bank statements, Invoices, Contracts</p>
                <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileUpload} />
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700">Uploaded Documents ({uploadedFiles.length})</h4>
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded px-4 py-2 text-xs">
                      <FileText size={14} className="text-indigo-500 shrink-0" />
                      <span className="flex-1 font-medium text-slate-800">{f.name}</span>
                      <span className="text-slate-500">{(f.size / 1024).toFixed(0)} KB</span>
                      <span className="text-slate-400">{f.uploadedAt}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                <strong>Tip:</strong> Upload your client's bank statements, trial balance, invoices, lease agreements and working papers here.
                PDF bank statements can be converted to Excel using the <strong>PDF Converter</strong> tool under Documents.
              </div>
              <button onClick={() => goToPage('/pdf-convert')} className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline cursor-pointer">
                <ArrowRight size={12} /> Open PDF Converter to convert bank statements to Excel
              </button>
            </div>
          )}

          {/* ── STEP 3: Import Bank Statements ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                <strong>Import a CSV bank statement</strong> to review and categorise transactions.
                Most banks allow you to export a CSV statement from their online portal.
              </div>
              <button
                className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
                onClick={() => bankInputRef.current?.click()}
              >
                <FileSpreadsheet size={16} className="text-emerald-500" />
                Import CSV Bank Statement
              </button>
              <input ref={bankInputRef} type="file" className="hidden" accept=".csv" onChange={handleBankImport} />
              {bankRows.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">Imported {bankRows.length} rows</h4>
                  <div className="overflow-x-auto rounded border border-slate-200 max-h-64">
                    <table className="text-xs w-full">
                      <tbody>
                        {bankRows.slice(0, 20).map((row, i) => (
                          <tr key={i} className={i === 0 ? 'bg-slate-100 font-semibold' : i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-1.5 border-r border-slate-100 whitespace-nowrap">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Showing first 20 rows. Full data will be used in bank reconciliation.</p>
                </div>
              )}
              <div className="pt-2">
                <button onClick={() => goToPage('/bank-recon')} className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline cursor-pointer">
                  <ArrowRight size={12} /> Open Bank Reconciliation module
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Process & Organise ── */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Post your journal entries, categorise transactions to the correct accounts, and ensure all transactions are captured in the general ledger.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => goToPage('/accounts')} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer">
                  <BookOpen size={16} className="text-indigo-500" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">Chart of Accounts</div>
                    <div className="text-slate-500">Review / add accounts</div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 ml-auto" />
                </button>
                <button onClick={() => goToPage('/ledger')} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer">
                  <FileText size={16} className="text-blue-500" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">General Ledger</div>
                    <div className="text-slate-500">Post journal entries</div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 ml-auto" />
                </button>
                <button onClick={() => goToPage('/bank-recon')} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer">
                  <Scale size={16} className="text-emerald-500" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">Bank Reconciliation</div>
                    <div className="text-slate-500">Match & reconcile</div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 ml-auto" />
                </button>
                <button onClick={() => goToPage('/documents')} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer">
                  <FolderOpen size={16} className="text-amber-500" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">Document Cabinet</div>
                    <div className="text-slate-500">Organise evidence</div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 ml-auto" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Trial Balance ── */}
          {step === 5 && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border text-xs ${tbBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                <div className="flex items-center gap-2 font-bold text-sm mb-2">
                  {tbBalanced ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertTriangle size={18} className="text-amber-500" />}
                  Trial Balance {tbBalanced ? 'Is Balanced ✓' : 'Has a Difference'}
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <div className="font-semibold">Total Debits</div>
                    <div className="text-base font-bold">R {totalDebit.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Total Credits</div>
                    <div className="text-base font-bold">R {totalCredit.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Difference</div>
                    <div className={`text-base font-bold ${diff < 0.01 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      R {diff.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                {!tbBalanced && (
                  <p className="mt-2 text-amber-800">
                    ⚠ The trial balance does not balance. Review journal entries and account postings before proceeding to generate financial statements.
                  </p>
                )}
              </div>
              <button onClick={() => goToPage('/trial-balance')} className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
                <Scale size={14} />
                Open Full Trial Balance
              </button>
            </div>
          )}

          {/* ── STEP 6: Review & Adjust ── */}
          {step === 6 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Make final adjusting entries, review depreciation, accruals, prepayments, and ensure all year-end adjustments are posted.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-2">
                <div className="font-semibold">Common Year-End Adjustments to Review:</div>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Depreciation and amortisation entries</li>
                  <li>Accrued expenses not yet invoiced</li>
                  <li>Prepaid expenses carried forward</li>
                  <li>Provision for doubtful debts</li>
                  <li>Tax computations (income tax / deferred tax)</li>
                  <li>Related party transactions at arm's length</li>
                  <li>Going concern assessment</li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => goToPage('/ledger')} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer">
                  <FileText size={16} className="text-indigo-500" />
                  <span className="font-medium">Post Adjusting Journal Entries</span>
                  <ChevronRight size={14} className="ml-auto text-slate-400" />
                </button>
                <button onClick={() => goToPage('/working-papers')} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer">
                  <FileText size={16} className="text-emerald-500" />
                  <span className="font-medium">Review Audit Working Papers</span>
                  <ChevronRight size={14} className="ml-auto text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 7: Generate Statements ── */}
          {step === 7 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Generate your complete set of financial statements. The system will compile income statement, balance sheet, statement of changes in equity and cash flow statement from your trial balance.
              </p>
              {!tbBalanced && (
                <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                  Warning: The trial balance has a difference of R {diff.toFixed(2)}. Financial statements generated may be inaccurate. Please balance the trial balance first (Step 5).
                </div>
              )}
              <button onClick={() => goToPage('/financials')} className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors shadow-sm">
                <BarChart2 size={16} />
                Open Financial Statements Generator
              </button>
              <div className="text-xs text-slate-500">
                The financial statements module will compile your income statement, balance sheet, statement of changes in equity, and notes to the financial statements.
              </div>
            </div>
          )}

          {/* ── STEP 8: Export ── */}
          {step === 8 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Your financial statements are ready. Export them in the format required — PDF for final submission, Excel for further editing, or CIPC iXBRL for statutory filing.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => goToPage('/financials')} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer">
                  <FileDown size={18} className="text-emerald-600" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">Export as PDF</div>
                    <div className="text-slate-500">Final signed statements</div>
                  </div>
                </button>
                <button onClick={() => goToPage('/financials')} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer">
                  <FileSpreadsheet size={18} className="text-blue-600" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">Export as Excel</div>
                    <div className="text-slate-500">For further editing</div>
                  </div>
                </button>
                <button onClick={() => goToPage('/cipc-ixbrl')} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-purple-50 hover:border-purple-300 transition-colors cursor-pointer">
                  <FileText size={18} className="text-purple-600" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">CIPC iXBRL Filing</div>
                    <div className="text-slate-500">Statutory e-filing</div>
                  </div>
                </button>
                <button onClick={() => goToPage('/tax')} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:bg-amber-50 hover:border-amber-300 transition-colors cursor-pointer">
                  <FileText size={18} className="text-amber-600" />
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">Tax Computation</div>
                    <div className="text-slate-500">SARS CIT 27%</div>
                  </div>
                </button>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <strong>Workflow Complete!</strong> You have guided {selectedClient?.name || 'the client'}'s engagement from document upload through to final financial statements.
                  All documents should now be saved in the client's dedicated folder.
                </div>
              </div>
            </div>
          )}

          {/* Notes area */}
          <div className="border-t border-slate-100 pt-4">
            <label className="text-[11px] font-medium text-slate-500 mb-1 block">Step Notes (optional)</label>
            <textarea
              rows={2}
              value={stepNotes[step] || ''}
              onChange={e => setStepNotes(prev => ({ ...prev, [step]: e.target.value }))}
              placeholder="Add notes for this step..."
              className="w-full border border-slate-200 rounded px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 resize-none"
            />
          </div>
        </div>

        {/* Footer nav */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={16} /> Previous Step
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={markComplete}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Check size={14} />
              {step === 8 ? 'Mark Complete & Finish' : 'Mark Complete & Next'}
            </button>
            {step < 8 && (
              <button
                onClick={nextStep}
                className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Skip <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Client summary */}
      {selectedClient && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
            {selectedClient.name[0].toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-900">{selectedClient.name}</div>
            <div className="text-slate-500 mt-0.5">
              {selectedClient.regNumber && `Reg: ${selectedClient.regNumber} · `}
              FY {selectedClient.fiscalYear || '2024'} ·
              Engagement Status: <span className="font-semibold text-indigo-700">{Object.values(stepComplete).filter(Boolean).length} of {STEPS.length} steps completed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

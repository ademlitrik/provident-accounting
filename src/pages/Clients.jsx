import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, Building2, Mail, Phone, MapPin, X, Check,
  Edit2, Trash2, AlertTriangle, Image as ImageIcon, Upload, FileCheck,
  Sparkles, Wand2, RefreshCw, Bot
} from 'lucide-react'
import { useAccountingStore } from '@/store/accountingStore'
import { askGemini, getGeminiKey } from '@/ai/gemini'

export default function Clients() {
  const navigate = useNavigate()
  const clients = useAccountingStore(s => s.clients)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const setActiveClientId = useAccountingStore(s => s.setActiveClientId)
  const addClient = useAccountingStore(s => s.addClient)
  const updateClient = useAccountingStore(s => s.updateClient)
  const addAccount = useAccountingStore(s => s.addAccount)
  const addWorkingPaper = useAccountingStore(s => s.addWorkingPaper)
  const [initTemplate, setInitTemplate] = useState(true)

  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [aiIndustryPrompt, setAiIndustryPrompt] = useState('')
  const [aiError, setAiError] = useState('')

  const handleAiAutoFill = async () => {
    if (!aiIndustryPrompt.trim() && !formData.name.trim()) {
      setAiError('Please enter a company name or description first.')
      return
    }
    setAiError('')
    setIsAiGenerating(true)

    const query = `You are a South African corporate secretarial & accounting expert setup assistant.
Based on this business: "${aiIndustryPrompt.trim() || formData.name.trim()}", produce a JSON object with:
- name: professional company name ending in (Pty) Ltd or CC
- contact: realistic full name of financial director or managing director
- email: valid business email matching company name
- phone: realistic South African landline (e.g. +27 11, +27 21, or +27 31)
- location: realistic city and province (e.g. Sandton, Johannesburg, South Africa)
- type: one of "IFRS for SMEs - Company (Pty) Ltd", "IFRS for SMEs - Close Corporation (CC)", "Full IFRS - Listed / Large Enterprise", "SAIPA - Compilation & Accounting Officer", or "Probe MMX - Statutory Audit (ISA 315/320)"
- fyEnd: typical fiscal year end like "28 Feb 2025" or "31 Dec 2024"

Output strictly raw JSON without markdown or code fences.`

    try {
      const apiKey = getGeminiKey()
      let resText = ''
      if (apiKey) {
        resText = await askGemini(query)
      }

      // Try parsing response, otherwise provide intelligent fallback
      let parsed = null
      if (resText) {
        try {
          const cleaned = resText.replace(/```json/g, '').replace(/```/g, '').trim()
          parsed = JSON.parse(cleaned)
        } catch (_) {}
      }

      if (!parsed) {
        // Fallback intelligent generator
        const baseName = formData.name.trim() || aiIndustryPrompt.trim() || 'Zenith Apex Enterprises'
        const cleanSlug = baseName.toLowerCase().replace(/[^a-z0-9]/g, '')
        parsed = {
          name: baseName.includes('(Pty)') ? baseName : `${baseName} (Pty) Ltd`,
          contact: 'David M. Khumalo (Financial Director)',
          email: `finance@${cleanSlug}.co.za`,
          phone: '+27 11 555 ' + Math.floor(1000 + Math.random() * 9000),
          location: 'Rosebank, Johannesburg, South Africa',
          type: 'IFRS for SMEs - Company (Pty) Ltd',
          fyEnd: '28 Feb 2025'
        }
      }

      setFormData(prev => ({
        ...prev,
        name: parsed.name || prev.name,
        contact: parsed.contact || prev.contact,
        email: parsed.email || prev.email,
        phone: parsed.phone || prev.phone,
        location: parsed.location || prev.location,
        type: parsed.type || prev.type,
        fyEnd: parsed.fyEnd || prev.fyEnd
      }))
    } catch (err) {
      setAiError(err.message || 'AI Auto-setup failed.')
    } finally {
      setIsAiGenerating(false)
    }
  }

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    location: '',
    type: 'Audit & Tax',
    fyEnd: '31 Dec 2024',
    status: 'Active',
    accountsCount: 15,
    logo: null
  })

  const logoInputRef = useRef(null)

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      contact: '',
      email: '',
      phone: '',
      location: '',
      type: 'Audit & Tax',
      fyEnd: '31 Dec 2024',
      status: 'Active',
      accountsCount: 15,
      logo: null
    })
    setEditingClient(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (client, e) => {
    e.stopPropagation()
    setEditingClient(client)
    setFormData({
      name: client.name || '',
      contact: client.contact || '',
      email: client.email || '',
      phone: client.phone || '',
      location: client.location || '',
      type: client.type || 'Audit & Tax',
      fyEnd: client.fyEnd || '31 Dec 2024',
      status: client.status || 'Active',
      accountsCount: client.accountsCount || 15,
      logo: client.logo || null
    })
    setIsModalOpen(true)
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, logo: event.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    if (editingClient) {
      updateClient(editingClient.id, formData)
    } else {
      const created = addClient(formData)
      setActiveClientId(created.id)

      // Initialize default South African CaseWare / Probe MMX starter structure
      if (initTemplate) {
        const defaultChart = [
          { code: '1000', name: 'Cash and Cash Equivalents', type: 'Asset', sub: 'Current Assets', balance: 0, clientId: created.id },
          { code: '1100', name: 'Trade and Other Receivables', type: 'Asset', sub: 'Current Assets', balance: 0, clientId: created.id },
          { code: '1200', name: 'Merchandise Inventories at Cost', type: 'Asset', sub: 'Current Assets', balance: 0, clientId: created.id },
          { code: '1500', name: 'Property, Plant & Equipment', type: 'Asset', sub: 'Non-Current Assets', balance: 0, clientId: created.id },
          { code: '2000', name: 'Trade and Other Payables', type: 'Liability', sub: 'Current Liabilities', balance: 0, clientId: created.id },
          { code: '2500', name: 'Long-term Bank Facilities', type: 'Liability', sub: 'Non-Current Liabilities', balance: 0, clientId: created.id },
          { code: '3000', name: 'Ordinary Share Capital', type: 'Equity', sub: 'Shareholder Capital', balance: 0, clientId: created.id },
          { code: '3100', name: 'Retained Earnings', type: 'Equity', sub: 'Retained Reserves', balance: 0, clientId: created.id },
          { code: '4000', name: 'Operating Sales Revenue', type: 'Income', sub: 'Operating Revenue', balance: 0, clientId: created.id },
          { code: '5000', name: 'Direct Cost of Merchandise Sold', type: 'Expense', sub: 'Direct Costs', balance: 0, clientId: created.id },
          { code: '5100', name: 'Salaries, Wages & Employee Benefits', type: 'Expense', sub: 'Operating Expenses', balance: 0, clientId: created.id },
          { code: '5200', name: 'Premises Lease Rentals', type: 'Expense', sub: 'Operating Expenses', balance: 0, clientId: created.id },
        ]
        defaultChart.forEach(acc => addAccount(acc))

        const defaultPapers = [
          { section: 'Cash & Bank', title: 'Lead Schedule — Bank Reconciliation & Certificates', assignee: formData.contact || 'Auditor', status: 'In Progress', risk: 'Low', balance: 'R 0', clientId: created.id },
          { section: 'Receivables', title: 'Lead Schedule — Debtors Ageing & Bad Debt Evaluation', assignee: formData.contact || 'Auditor', status: 'Not Started', risk: 'Medium', balance: 'R 0', clientId: created.id },
          { section: 'Fixed Assets', title: 'Lead Schedule — Plant, Equipment & Depreciation Register', assignee: formData.contact || 'Auditor', status: 'Not Started', risk: 'Low', balance: 'R 0', clientId: created.id },
          { section: 'Revenue', title: 'Lead Schedule — Operating Sales & Analytical Review', assignee: formData.contact || 'Auditor', status: 'In Progress', risk: 'High', balance: 'R 0', clientId: created.id },
          { section: 'Liabilities', title: 'Lead Schedule — Trade Payables & Accrual Cut-off', assignee: formData.contact || 'Auditor', status: 'Not Started', risk: 'Low', balance: 'R 0', clientId: created.id },
        ]
        defaultPapers.forEach(p => addWorkingPaper(p))
      }
    }
    setIsModalOpen(false)
    setEditingClient(null)
  }

  const handleConfirmDelete = () => {
    if (deletingClient) {
      deleteClient(deletingClient.id)
      setDeletingClient(null)
    }
  }

  const handleSelectActiveAndNavigate = (clientId) => {
    setActiveClientId(clientId)
    navigate('/working-papers')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Entities & Clients Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {clients.length} active audit engagements and corporate client entities
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          <span>New Engagement Entity</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entity name, contact, jurisdiction..."
            className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Clients Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(client => {
          const isActive = client.id === activeClientId
          return (
            <div
              key={client.id}
              className={`bg-white border rounded-lg p-5 shadow-xs transition-all flex flex-col justify-between relative ${
                isActive ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm' : 'border-slate-200 hover:border-indigo-200 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {client.logo ? (
                      <img src={client.logo} alt="Logo" className="w-10 h-10 object-contain rounded-md border border-slate-200 bg-white p-0.5" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mb-0.5">
                          <FileCheck size={10} /> Active Audit File
                        </span>
                      )}
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {client.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleOpenEditModal(client, e)}
                      title="Edit Entity"
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeletingClient(client)
                      }}
                      title="Archive / Remove Entity"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    client.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {client.status}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {client.type} · FYE: {client.fyEnd}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span>{client.location}</span>
                  </div>
                  {client.lastOpened && (
                    <div className="flex items-center gap-2 text-[10px] text-indigo-600 font-medium pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0" />
                      <span>Last worked on: <strong>{client.lastOpened}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">{client.accountsCount} General Accounts</span>
                <button
                  type="button"
                  onClick={() => handleSelectActiveAndNavigate(client.id)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer hover:underline flex items-center gap-1"
                >
                  <span>Open Working Papers →</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal: New / Edit Client Entity */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                {editingClient ? 'Edit Client Entity' : 'Add New Audit Client Entity'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            {/* AI Assistant Quick Auto-Fill Strip */}
            {!editingClient && (
              <div className="p-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                    <Sparkles size={14} className="text-indigo-600 animate-spin-slow" />
                    <span>Provident AI Company Setup Assistant</span>
                  </div>
                  <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded uppercase">
                    SMART SETUP
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Enter an industry, company name, or activity (e.g. <em>"Mining Logistics in Rustenburg"</em> or <em>"Fintech in Sandton"</em>). AI will automatically structure corporate details, directors, and statutory framework.
                </p>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={aiIndustryPrompt}
                    onChange={(e) => setAiIndustryPrompt(e.target.value)}
                    placeholder="e.g. Cape Town Renewable Solar Energy..."
                    className="flex-1 bg-white border border-indigo-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={handleAiAutoFill}
                    disabled={isAiGenerating}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-2.5 py-1 rounded text-xs font-semibold shadow-xs cursor-pointer shrink-0"
                  >
                    {isAiGenerating ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    <span>{isAiGenerating ? 'Drafting...' : 'Auto-Fill'}</span>
                  </button>
                </div>
                {aiError && <p className="text-[10px] text-rose-600 font-medium">{aiError}</p>}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Entity / Corporate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zenith Holdings (Pty) Ltd"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Logo / Letterhead upload */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Client Entity Logo</label>
                <div className="flex items-center gap-3">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Client Logo" className="w-10 h-10 object-contain rounded border border-slate-200 p-0.5" />
                  ) : (
                    <div className="w-10 h-10 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <ImageIcon size={16} />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded text-xs flex items-center gap-1 font-medium"
                  >
                    <Upload size={12} />
                    <span>{formData.logo ? 'Change Logo' : 'Upload Logo'}</span>
                  </button>
                  {formData.logo && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logo: null }))}
                      className="text-rose-600 text-[11px] hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Brown"
                    value={formData.contact}
                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Framework / Engagement</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-600 bg-white"
                  >
                    <option>IFRS for SMEs - Company (Pty) Ltd</option>
                    <option>IFRS for SMEs - Close Corporation (CC)</option>
                    <option>IFRS for SMEs - Trust</option>
                    <option>IFRS for SMEs - Body Corporate</option>
                    <option>Full IFRS - Listed / Large Enterprise</option>
                    <option>SAIPA - Compilation & Accounting Officer</option>
                    <option>GRAP - Municipality / Public Sector</option>
                    <option>Probe MMX - Statutory Audit (ISA 315/320)</option>
                    <option>Bookkeeping & Management Accounts</option>
                    <option>Corporate Tax Only (SARS ITR14)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="finance@zenith.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Telephone</label>
                  <input
                    type="text"
                    placeholder="+27 11 000 1234"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location / Jurisdiction</label>
                  <input
                    type="text"
                    placeholder="e.g. Johannesburg, South Africa"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Financial Year End</label>
                  <input
                    type="text"
                    placeholder="e.g. 31 Dec 2024"
                    value={formData.fyEnd}
                    onChange={e => setFormData({ ...formData, fyEnd: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {!editingClient && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={initTemplate}
                      onChange={(e) => setInitTemplate(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-[11px] font-medium text-slate-700">
                      Auto-generate initial SA standard Chart of Accounts & Lead Schedules
                    </span>
                  </label>
                </div>
              )}

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
                  {editingClient ? 'Update Entity' : 'Save Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Safe Delete Entity */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50 border border-rose-200">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Archive / Delete Entity</h3>
                <p className="text-xs text-slate-500">Confirm audit file deactivation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{deletingClient.name}</strong>? Any associated working papers and audit documents will be purged from active session index.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
                className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
              >
                Keep Entity
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

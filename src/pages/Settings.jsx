import { useState, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'
import { getGeminiKey, setGeminiKey } from '@/ai/gemini'
import OfficePersonalizationSettings from '@/components/settings/OfficePersonalizationSettings'
import {
  Building2, User, Key, Globe, Palette, Shield, Save, CheckCircle,
  Eye, EyeOff, Laptop, Upload, Image as ImageIcon, Trash2, Info, Award, ExternalLink
} from 'lucide-react'
import afrovisionLogo from '@/assets/afrovision_logo.png'

const tabs = [
  { id: 'personalization', icon: Palette,   label: 'Personalization' },
  { id: 'firm',            icon: Building2, label: 'Firm Details' },
  { id: 'profile',         icon: User,      label: 'User Profile' },
  { id: 'api',             icon: Key,       label: 'AI & Intelligence' },
  { id: 'language',        icon: Globe,     label: 'Language & Region' },
  { id: 'security',        icon: Shield,    label: 'Security' },
  { id: 'about',           icon: Info,      label: 'About & Credits' },
]

const languages = [
  { code: 'en', name: 'English (US/UK)', flag: '🇬🇧' },
  { code: 'af', name: 'Afrikaans (South Africa)', flag: '🇿🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
  { code: 'st', name: 'Sesotho', flag: '🇿🇦' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
]

const currencies = ['USD ($)', 'ZAR (R)', 'GBP (£)', 'EUR (€)', 'AUD ($)', 'CAD ($)', 'BWP (P)', 'KES (KSh)', 'NGN (₦)']

export default function Settings() {
  const firm = useAuthStore(s => s.firm)
  const updateFirm = useAuthStore(s => s.updateFirm)
  const user = useAuthStore(s => s.user)

  const theme = useAppStore(s => s.theme)
  const setTheme = useAppStore(s => s.setTheme)
  const officeBackground = useAppStore(s => s.officeBackground)
  const setOfficeBackground = useAppStore(s => s.setOfficeBackground)

  const [activeTab, setActiveTab] = useState('personalization')
  const [firmName, setFirmName] = useState(firm.name || 'Provident Accounting & Advisory')
  const [currency, setCurrency] = useState(firm.currency || 'ZAR (R)')
  const [fyEnd, setFyEnd] = useState(firm.fiscalYearEnd || '12-31')
  const [vatNumber, setVatNumber] = useState(firm.vatNumber || '4920192841')
  const [irbaNumber, setIrbaNumber] = useState(firm.irbaNumber || '904812')
  const [saicaNumber, setSaicaNumber] = useState(firm.saicaNumber || 'SAICA-2024-81')
  const [firmLogo, setFirmLogo] = useState(firm.logo || null)
  const logoInputRef = useRef(null)

  const [geminiKey, setGeminiKeyState] = useState(getGeminiKey())
  const [showKey, setShowKey] = useState(false)
  const [lang, setLang] = useState('en')
  const [saved, setSaved] = useState('')

  const isDark = theme === 'Dark Gray' || theme === 'Black'

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFirmLogo(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveFirm = () => {
    updateFirm({
      name: firmName,
      currency,
      fiscalYearEnd: fyEnd,
      vatNumber,
      irbaNumber,
      saicaNumber,
      logo: firmLogo
    })
    setSaved('firm')
    setTimeout(() => setSaved(''), 2000)
  }

  const saveApiKey = () => {
    setGeminiKey(geminiKey)
    setSaved('api')
    setTimeout(() => setSaved(''), 2000)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col" style={{ userSelect: 'text' }}>
      {/* Settings Header */}
      <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Settings & Options
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure application theme, enterprise firm parameters, account credentials, and AI automation.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Laptop size={14} className="text-slate-500" />
          <span>Provident Desktop v1.0 (Windows 11 Native Edition)</span>
        </div>
      </div>

      <div className="flex gap-8 flex-1 overflow-hidden">
        {/* Navigation Tabs (Sidebar style) */}
        <div className="w-56 shrink-0 flex flex-col space-y-1">
          {tabs.map(({ id, icon: Icon, label }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-medium text-left transition-colors ${
                  isActive
                    ? 'bg-[#5B5FC7] text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 bg-white dark:bg-[#1E1E22] rounded-lg border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto shadow-sm">
          {/* TAB 1: Office-style Personalization */}
          {activeTab === 'personalization' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Account Personalization
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Customize the appearance and window decoration of your Office-grade workspace.
                </p>
              </div>

              {/* Exact Microsoft Office Prompt Component */}
              <div className="border border-slate-200 dark:border-slate-700 rounded p-1 bg-[#F5F5F5] dark:bg-[#1E1E22]">
                <OfficePersonalizationSettings
                  background={officeBackground}
                  theme={theme}
                  onChangeBackground={setOfficeBackground}
                  onChangeTheme={setTheme}
                />
              </div>

              {/* Theme Live Preview */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Applied Visual Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-500 block">Theme Scheme</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{theme}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-500 block">Background Accent</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{officeBackground}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Firm Details */}
          {activeTab === 'firm' && (
            <div className="space-y-5 max-w-lg">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Firm & Practice Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update primary practice identification, base currency, professional registration numbers, and letterhead logo.
                </p>
              </div>

              {/* Firm Logo Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {firmLogo ? (
                    <img src={firmLogo} alt="Firm Logo" className="w-12 h-12 object-contain rounded border border-slate-300 dark:border-slate-600 bg-white p-1" />
                  ) : (
                    <div className="w-12 h-12 rounded border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400">
                      <ImageIcon size={20} />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">Firm Brand Logo</h4>
                    <p className="text-[11px] text-slate-500">Appears on audit working papers and financial statements</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                    className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
                  >
                    <Upload size={13} />
                    <span>{firmLogo ? 'Replace' : 'Upload'}</span>
                  </button>
                  {firmLogo && (
                    <button
                      type="button"
                      onClick={() => setFirmLogo(null)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                      title="Remove Logo"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Practice / Firm Legal Name
                  </label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5FC7]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Default Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5FC7]"
                    >
                      {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                      Fiscal Year End
                    </label>
                    <select
                      value={fyEnd}
                      onChange={(e) => setFyEnd(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5FC7]"
                    >
                      <option value="12-31">December 31</option>
                      <option value="03-31">March 31</option>
                      <option value="06-30">June 30</option>
                      <option value="09-30">September 30</option>
                      <option value="02-28">February 28</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                      IRBA Practice No.
                    </label>
                    <input
                      type="text"
                      value={irbaNumber}
                      onChange={(e) => setIrbaNumber(e.target.value)}
                      placeholder="e.g. 904812"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5FC7]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                      SAICA Reg No.
                    </label>
                    <input
                      type="text"
                      value={saicaNumber}
                      onChange={(e) => setSaicaNumber(e.target.value)}
                      placeholder="e.g. SAICA-2024-81"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5FC7]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                      SARS VAT No.
                    </label>
                    <input
                      type="text"
                      value={vatNumber}
                      onChange={(e) => setVatNumber(e.target.value)}
                      placeholder="e.g. 4920192841"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5FC7]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={saveFirm}
                    className="inline-flex items-center gap-2 bg-[#5B5FC7] hover:bg-[#4A4EB5] text-white text-xs font-medium px-4 py-2 rounded transition-colors shadow-sm cursor-pointer"
                  >
                    {saved === 'firm' ? <CheckCircle size={14} /> : <Save size={14} />}
                    <span>{saved === 'firm' ? 'Settings Saved' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: User Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-5 max-w-lg">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  User Account Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Logged-in practitioner identity and role in the practice.
                </p>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-full bg-[#5B5FC7] flex items-center justify-center text-white font-bold text-base shadow-sm">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold bg-[#5B5FC7]/10 text-[#5B5FC7] dark:bg-[#5B5FC7]/20 dark:text-indigo-300 px-2 py-0.5 rounded">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI & Intelligence */}
          {activeTab === 'api' && (
            <div className="space-y-5 max-w-lg">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Google Gemini AI Engine
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Integrate your Gemini API key to activate natural language financials, anomaly detection, and OCR.
                </p>
              </div>

              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded text-xs text-indigo-900 dark:text-indigo-200">
                Enter your Google AI Studio key below. This key stays safely on your machine and communicates directly with the Gemini API.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={(e) => setGeminiKeyState(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 pr-10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5FC7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Get an API key free from{' '}
                    <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-[#5B5FC7] hover:underline">
                      aistudio.google.com
                    </a>
                  </p>
                </div>

                <button
                  onClick={saveApiKey}
                  className="inline-flex items-center gap-2 bg-[#5B5FC7] hover:bg-[#4A4EB5] text-white text-xs font-medium px-4 py-2 rounded transition-colors shadow-sm"
                >
                  {saved === 'api' ? <CheckCircle size={14} /> : <Save size={14} />}
                  <span>{saved === 'api' ? 'Key Stored' : 'Save API Key'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Language & Region */}
          {activeTab === 'language' && (
            <div className="space-y-5 max-w-lg">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Language & Locale
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select application reporting language and financial vocabulary.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`flex items-center gap-3 p-3 rounded border text-left text-xs transition-colors ${
                      lang === l.code
                        ? 'border-[#5B5FC7] bg-[#5B5FC7]/10 text-[#5B5FC7] font-semibold'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-base">{l.flag}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Security */}
          {activeTab === 'security' && (
            <div className="space-y-5 max-w-lg">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Security & Access Control
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage application passcode, user sessions, and database lockouts.
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5FC7]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#5B5FC7]"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 bg-[#5B5FC7] hover:bg-[#4A4EB5] text-white text-xs font-medium px-4 py-2 rounded transition-colors shadow-sm"
                >
                  <Shield size={14} />
                  <span>Update Password</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: About Software & Developer Accreditation */}
          {activeTab === 'about' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Award size={18} className="text-[#5B5FC7]" />
                  <span>About Software & Developer Accreditation</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official software authorship, corporate client attribution, and platform credentials.
                </p>
              </div>

              {/* Developer Hero Card */}
              <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-lg border border-slate-800 shadow-md flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-white/10 p-2.5 border border-white/20 flex items-center justify-center shrink-0">
                  <img
                    src={afrovisionLogo}
                    alt="Afro Vision Media"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block">
                    Software Development Company
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">Afro Vision Media</h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Designed, developed, and implemented by <strong className="text-indigo-400">Tanyaradzwa Livingstone Bvute</strong> under Afro Vision Media for Provident Financial Consultants.
                  </p>
                </div>
              </div>

              {/* Formal Attribution Details Table */}
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Software Developer</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white block">Tanyaradzwa Livingstone Bvute</span>
                    <a
                      href="https://github.com/ademlitrik"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#5B5FC7] hover:underline text-[11px]"
                    >
                      <span>ademlitrik (GitHub)</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Software Development Company</span>
                  <div className="flex items-center gap-2">
                    <img src={afrovisionLogo} alt="Afro Vision Media" className="h-4 w-auto object-contain" />
                    <span className="font-bold text-slate-900 dark:text-white">Afro Vision Media</span>
                  </div>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Commissioned Client</span>
                  <span className="font-bold text-slate-900 dark:text-white">Provident Financial Consultants</span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Client Website</span>
                  <a
                    href="https://pfconsultants.co.za/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#5B5FC7] hover:underline"
                  >
                    <span>https://pfconsultants.co.za/</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Software Architecture</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">Windows 11 x64 (Native Offline SQLite & Web)</span>
                </div>
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Statutory Compliance</span>
                  <span className="text-slate-700 dark:text-slate-300">IRBA, SAICA, Companies Act 71 of 2008, CIPC iXBRL</span>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-500 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Licensing & Copyright Notice</span>
                <p>
                  Copyright © 2026 Afro Vision Media. Designed, developed, and implemented by Tanyaradzwa Livingstone Bvute for Provident Financial Consultants. All rights reserved.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

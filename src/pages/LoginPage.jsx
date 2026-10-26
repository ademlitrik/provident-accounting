import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, Building2, Eye, EyeOff, Info } from 'lucide-react'
import AboutModal from '@/components/common/AboutModal'
import providentLogo from '@/assets/provident_logo_raw.png'
import afrovisionLogo from '@/assets/afrovision_logo.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const validateLogin = useAuthStore(s => s.validateLogin)
  const [form, setForm] = useState({ email: 'info@pfconsultants.co.za', password: 'admin@123' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise(r => setTimeout(r, 400))

    const user = validateLogin(form.email, form.password)

    if (user) {
      login(user)
      navigate('/dashboard')
    } else {
      setError('Invalid auditor credentials. Please verify your email and password.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-screen flex bg-slate-50 antialiased overflow-hidden font-sans">
      {/* Left Column: Visual Showcase & Security Authority */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366F1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <img src={providentLogo} alt="Provident" className="h-10 w-auto object-contain" />
          <div>
            <span className="font-bold text-lg tracking-tight block text-white">Provident Accounting</span>
            <span className="text-[11px] text-indigo-300 font-mono block">Windows 11 Practice & Audit Suite</span>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-xs font-semibold">
            <ShieldCheck size={14} />
            <span>Universal Audit File Migration Engine</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-white">
            Next-Generation Audit & Statutory Financial Reporting
          </h2>

          <p className="text-slate-400 text-xs leading-relaxed">
            Provident is engineered for chartered accountants, audit practitioners, and medium enterprise firms requiring native desktop execution, bank-grade encryption, and seamless working paper roll-forwards.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Universal Import Compatibility
              </span>
              <p className="text-slate-400 text-[11px]">Direct import of legacy .cwp working paper packages, Trial Balance CSVs, and Draftworx exports.</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Protected Evidence Unlocking
              </span>
              <p className="text-slate-400 text-[11px]">Instant client PDF password decryptor & OCR statement extraction.</p>
            </div>
          </div>
        </div>

        {/* Left Footer */}
        <div className="relative z-10 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-4">
          <span>SOC 2 Type II · ISO 27001 Cryptographic Kernel</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span>Developed by</span>
            <img src={afrovisionLogo} alt="Afro Vision Media" className="h-3 w-auto object-contain inline" />
            <span className="text-slate-300 font-semibold">Afro Vision Media</span>
          </span>
        </div>
      </div>

      {/* Right Column: Modern Clean Sign-In */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-5">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
            <img src={providentLogo} alt="Provident" className="h-9 w-auto object-contain" />
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">Provident Accounting</span>
              <span className="text-[10px] text-slate-500 font-medium">Desktop Practice Edition (South Africa)</span>
            </div>
          </div>

          <div className="text-left space-y-0.5">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Sign In to Practice Workspace
            </h1>
            <p className="text-xs text-slate-500">
              Enter practitioner credentials to access client audit files
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Practice Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="auditor@firm.com"
                  className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <a href="#reset" onClick={e => e.preventDefault()} className="text-[11px] text-indigo-600 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md py-2 text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating with Native Kernel...</span>
              ) : (
                <>
                  <span>Open Audit Workspace</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="p-3.5 bg-slate-100/70 border border-slate-200 rounded-md text-xs space-y-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
              Default Administrator Account
            </span>
            <div className="flex items-center justify-between text-slate-600 font-mono text-[11px]">
              <span>info@pfconsultants.co.za</span>
              <span className="font-bold text-slate-800">admin@123</span>
            </div>
            <p className="text-[10px] text-slate-400">
              One-click prefilled. Click "Open Audit Workspace" to test immediately.
            </p>
          </div>

          {/* Software Developer Accreditation */}
          <div className="pt-2 text-center text-[11px] text-slate-400 flex flex-col items-center justify-center gap-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span>Developed by</span>
              <button
                type="button"
                onClick={() => setShowAbout(true)}
                className="inline-flex items-center gap-1.5 font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer group"
                title="Click to view full developer accreditation & credits"
              >
                <img src={afrovisionLogo} alt="Afro Vision Media" className="h-3.5 w-auto object-contain inline" />
                <span>Afro Vision Media</span>
              </button>
              <span>for Provident Financial Consultants</span>
            </div>
            <a
              href="https://github.com/ademlitrik"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-indigo-600 hover:underline font-mono"
            >
              Developer GitHub: ademlitrik (Tanyaradzwa Bvute)
            </a>
          </div>
        </div>
      </div>

      {/* About Modal */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  )
}

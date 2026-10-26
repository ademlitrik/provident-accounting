import { X, ExternalLink, ShieldCheck, CheckCircle2, Laptop, Award, Code2, Globe } from 'lucide-react'
import afrovisionLogo from '@/assets/afrovision_logo.png'
import providentLogo from '@/assets/provident_logo_raw.png'

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-white/10 p-2 border border-white/20 flex items-center justify-center shrink-0">
              <img
                src={afrovisionLogo}
                alt="Afro Vision Media"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                Official Software Accreditation
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Provident Accounting & Audit
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Version 1.0.0 (Production Release) · Windows 11 & Web Suite
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs text-slate-600 dark:text-slate-300 overflow-y-auto max-h-[70vh]">
          {/* Official Credit Statement */}
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Award className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <span className="font-bold text-slate-900 dark:text-white text-xs block">
                  Official Development Credit
                </span>
                <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                  Designed, developed, and implemented by <strong className="text-indigo-600 dark:text-indigo-400">Tanyaradzwa Livingstone Bvute</strong> under <strong className="text-slate-900 dark:text-white">Afro Vision Media</strong> for <strong className="text-slate-900 dark:text-white">Provident Financial Consultants</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Attribution Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Lead Software Developer
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                Tanyaradzwa Livingstone Bvute
              </p>
              <div className="pt-0.5">
                <a
                  href="https://github.com/ademlitrik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
                  title="Developer GitHub Repository: ademlitrik (Tanyaradzwa Bvute)"
                >
                  <Code2 size={12} />
                  <span>github.com/ademlitrik</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Development Company
              </span>
              <div className="flex items-center gap-1.5">
                <img src={afrovisionLogo} alt="Afro Vision Media" className="h-3.5 w-auto object-contain" />
                <span className="font-bold text-slate-900 dark:text-white text-xs">Afro Vision Media</span>
              </div>
              <span className="text-[11px] text-slate-500">Bespoke Software & Media Engineering</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Commissioned Client
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                Provident Financial Consultants
              </p>
              <span className="text-[11px] text-slate-500">Practice & Audit Assurance</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Client Web Portal
              </span>
              <a
                href="https://pfconsultants.co.za/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
              >
                <span>pfconsultants.co.za</span>
                <ExternalLink size={12} />
              </a>
              <span className="text-[11px] text-slate-500 block">Official Firm Website</span>
            </div>
          </div>

          {/* Architecture Specifications */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Application & Platform Architecture
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>IRBA & SAICA Ethical Matrix</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>CIPC iXBRL v2023.1.2 Engine</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>ISA 210, 230, 315, 500, 530 Compliance</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span>Offline SQLite & Native Encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium">
            © 2026 Afro Vision Media · All Rights Reserved
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold text-xs rounded-md transition-colors"
          >
            Close Credits
          </button>
        </div>
      </div>
    </div>
  )
}

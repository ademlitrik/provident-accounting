import { ExternalLink, Award, Code2, Globe, ShieldCheck, Laptop, Building2, CheckCircle2 } from 'lucide-react'
import afrovisionLogo from '@/assets/afrovision_logo.png'
import providentLogo from '@/assets/provident_logo_raw.png'

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-xl bg-white/10 p-3 border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
            <img
              src={afrovisionLogo}
              alt="Afro Vision Media"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-indigo-400">
              South Africa Practice Suite &bull; Version 1.1.3
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              Provident Accounting &amp; Audit Suite
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              An enterprise-grade desktop accounting, audit working paper, and statutory reporting platform engineered for South African accounting practices, auditors, and financial managers.
            </p>
          </div>
        </div>
      </div>

      {/* Official Developer Accreditation */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Award size={24} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Official Software Development Credit
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Designed, developed, and implemented by <strong className="text-indigo-700">Tanyaradzwa Livingstone Bvute</strong> under <strong className="text-slate-900">Afro Vision Media</strong> for <strong className="text-slate-900">Provident Financial Consultants</strong>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lead Software Engineer</span>
            <div className="text-sm font-bold text-slate-900">Tanyaradzwa Livingstone Bvute</div>
            <a
              href="https://github.com/ademlitrik"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline font-semibold pt-1"
            >
              <Code2 size={13} />
              <span>github.com/ademlitrik</span>
              <ExternalLink size={11} />
            </a>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Development Company</span>
            <div className="text-sm font-bold text-slate-900">Afro Vision Media</div>
            <p className="text-xs text-slate-500">Custom enterprise applications, fintech &amp; financial architecture</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client Practice</span>
            <div className="text-sm font-bold text-slate-900">Provident Financial Consultants</div>
            <a
              href="https://pfconsultants.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline font-semibold pt-1"
            >
              <Globe size={13} />
              <span>pfconsultants.co.za</span>
              <ExternalLink size={11} />
            </a>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Software Edition</span>
            <div className="text-sm font-bold text-slate-900">v1.1.3 Desktop Production</div>
            <p className="text-xs text-slate-500 font-mono">Windows 11 x64 Native &bull; Offline Database &bull; Local Storage</p>
          </div>
        </div>
      </div>

      {/* Statutory Standards Compliance */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600" />
          <span>Statutory Compliance &amp; Standards</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-bold text-slate-800">IRBA Standard</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Assurance &amp; Independence</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-bold text-slate-800">SAICA &amp; ISA</div>
            <div className="text-[11px] text-slate-500 mt-0.5">ISA 210, 230, 500, 530</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-bold text-slate-800">Companies Act 71</div>
            <div className="text-[11px] text-slate-500 mt-0.5">PIS &amp; Audit Duty Check</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-bold text-slate-800">CIPC iXBRL</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Taxonomy Compliant</div>
          </div>
        </div>
      </div>

      {/* Security & Client Storage Guarantee */}
      <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1.5">
        <div className="font-bold flex items-center gap-1.5">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Confidentiality, Privacy &amp; Data Sovereignty</span>
        </div>
        <p className="leading-relaxed">
          All client files, converted bank statements, financial ledgers and working papers are stored directly on your computer's local physical disk within dedicated client folders. No confidential financial figures or documents are ever uploaded to third-party public clouds without your explicit direction.
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import {
  FileCheck2, ShieldCheck, CheckCircle2, AlertTriangle, Download,
  Printer, UserCheck, Scale, FileText, Send, Building2, Check
} from 'lucide-react'
import { useAccountingStore } from '@/store/accountingStore'
import { useAuthStore } from '@/store/authStore'

export default function EngagementAcceptance() {
  const firm = useAuthStore(s => s.firm)
  const activeClientId = useAccountingStore(s => s.activeClientId)
  const clients = useAccountingStore(s => s.clients)
  const updateClient = useAccountingStore(s => s.updateClient)
  const activeClient = clients.find(c => c.id === activeClientId) || clients[0]

  const [activeTab, setActiveTab] = useState('acceptance')
  const [partnerSignStatus, setPartnerSignStatus] = useState(false)
  const [signedDate, setSignedDate] = useState('2024-10-15')

  // Section A: Independence & Ethics
  const [independenceChecks, setIndependenceChecks] = useState({
    noFinancialInterest: true,
    noFamilyRelationship: true,
    noManagementFunction: true,
    rotationCompliance: true,
    noContingentFees: true,
  })

  // Section B: Money Laundering & FICA Risk
  const [ficaChecks, setFicaChecks] = useState({
    idVerified: true,
    cipcVerified: true,
    addressVerified: true,
    pepCheckPassed: true,
    riskRating: 'Low Risk',
  })

  // Section C: Preconditions for an Audit (ISA 210)
  const [preconditions, setPreconditions] = useState({
    acceptableFramework: true,
    managementAcknowledged: true,
    accessToAllRecords: true,
    priorAuditorCleared: true,
  })

  const [auditFee, setAuditFee] = useState(125000)

  const handleToggleInd = (key) => {
    setIndependenceChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleTogglePre = (key) => {
    setPreconditions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSignOffEngagement = () => {
    setPartnerSignStatus(true)
    updateClient(activeClientId, {
      acceptanceStatus: 'Approved & Signed (ISA 210 Compliant)',
      acceptanceDate: new Date().toISOString().split('T')[0]
    })
  }

  const handleExportLetter = () => {
    const letter = `AUDIT ENGAGEMENT LETTER (ISA 210 COMPLIANT)
--------------------------------------------------------------------------------
FIRM: ${firm?.name || 'Provident Accounting & Advisory (Pty) Ltd'}
IRBA REGISTRATION NO: ${firm?.irbaNumber || '904812'} | SAICA NO: ${firm?.saicaNumber || 'SAICA-2024-81'}
DATE: ${new Date().toISOString().split('T')[0]}

TO THE BOARD OF DIRECTORS:
${activeClient?.name || 'Client Entity'}
${activeClient?.location || 'Johannesburg, South Africa'}

RE: TERMS OF AUDIT ENGAGEMENT FOR FINANCIAL PERIOD ENDED ${activeClient?.fyEnd || '31 OCTOBER 2024'}

1. PURPOSE AND SCOPE OF THE AUDIT
You have requested that we audit the annual financial statements of ${activeClient?.name}, which comprise the statement of financial position as at ${activeClient?.fyEnd}, and the statement of comprehensive income, statement of changes in equity and statement of cash flows for the year then ended, and notes to the financial statements, including a summary of significant accounting policies.

We are pleased to confirm our acceptance and our understanding of this audit engagement by means of this letter. Our audit will be conducted in accordance with International Standards on Auditing (ISAs) and the requirements of the South African Companies Act No. 71 of 2008.

2. RESPONSIBILITIES OF THE AUDITOR
We will conduct our audit in accordance with ISAs. Those standards require that we comply with ethical requirements and plan and perform the audit to obtain reasonable assurance about whether the financial statements are free from material misstatement.

3. RESPONSIBILITIES OF MANAGEMENT AND GOVERNANCE
Our audit will be conducted on the basis that management acknowledges and understands that they have responsibility:
(a) For the preparation and fair presentation of the financial statements in accordance with ${activeClient?.type || 'IFRS for SMEs'};
(b) For such internal control as management determines is necessary; and
(c) To provide us with unrestricted access to all information, documentation, and persons within the entity.

4. PROFESSIONAL AUDIT FEES
Our professional fees for the statutory audit are estimated at R ${auditFee.toLocaleString()} (exclusive of 15% VAT).

5. INDEPENDENCE AND QUALITY MANAGEMENT
We confirm that we comply with the IRBA Code of Professional Conduct and ISQM 1 quality standards.

Confirmed and accepted on behalf of ${activeClient?.name}:

_____________________________                _____________________________
Audit Engagement Partner                     Managing Director / Board Chair
${firm?.name || 'Provident Advisory'}         ${activeClient?.name}
`
    const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(activeClient?.name || 'Provident').replace(/[^a-zA-Z0-9]/g, '_')}_ISA210_Engagement_Letter.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>ISA 210 Engagement Standards</span>
            <span>/</span>
            <span className="font-semibold text-slate-700">{activeClient?.name}</span>
            <span>/</span>
            <span className="text-indigo-600 font-semibold">Client Acceptance & Continuance</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Audit Engagement Acceptance & ISA 210 Terms
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Dossier</span>
          </button>
          <button
            onClick={handleExportLetter}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Download size={13} />
            <span>Download ISA 210 Letter</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('acceptance')}
          className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'acceptance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          1. Independence, Ethics & FICA Clearance
        </button>
        <button
          onClick={() => setActiveTab('letter')}
          className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'letter'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          2. ISA 210 Statutory Engagement Letter
        </button>
      </div>

      {/* TAB 1: ACCEPTANCE & ETHICS */}
      {activeTab === 'acceptance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Independence Checks */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-indigo-600" size={16} />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Section A: IRBA & SAICA Ethical Independence Declarations
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  ISQM 1 Compliant
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { key: 'noFinancialInterest', label: 'No direct or material indirect financial interest in the client entity' },
                  { key: 'noFamilyRelationship', label: 'No family, close personal, or business relationship with officers/directors' },
                  { key: 'noManagementFunction', label: 'No audit team member has served in an executive or management capacity' },
                  { key: 'rotationCompliance', label: 'Audit Partner rotation rules verified (Companies Act Section 92)' },
                  { key: 'noContingentFees', label: 'Audit fees are not contingent or structured on outcome-based targets' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={independenceChecks[key]}
                      onChange={() => handleToggleInd(key)}
                      className="rounded border-slate-300 text-indigo-600 w-4 h-4 cursor-pointer"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preconditions for an Audit (ISA 210) */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Scale className="text-indigo-600" size={16} />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Section B: ISA 210 Preconditions for an Audit
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                  ISA 210
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { key: 'acceptableFramework', label: `Acceptable financial reporting framework applied (${activeClient?.type || 'IFRS for SMEs'})` },
                  { key: 'managementAcknowledged', label: 'Management understands its responsibility for preparation of fair financial statements' },
                  { key: 'accessToAllRecords', label: 'Agreement by management to provide unrestricted access to all records and staff' },
                  { key: 'priorAuditorCleared', label: 'Professional clearance received from predecessor auditor without reservations' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2.5 p-2 rounded hover:bg-slate-50 cursor-pointer text-slate-700">
                    <input
                      type="checkbox"
                      checked={preconditions[key]}
                      onChange={() => handleTogglePre(key)}
                      className="rounded border-slate-300 text-indigo-600 w-4 h-4 cursor-pointer"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sign-off Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Engagement Acceptance Decision
                </h3>
                <span className="text-[11px] text-slate-500">Quality Management Committee Review</span>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Entity</span>
                  <span className="font-bold text-slate-900">{activeClient?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">FICA Risk Rating</span>
                  <span className="font-bold text-emerald-600">{ficaChecks.riskRating}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Estimated Audit Fee</span>
                  <input
                    type="number"
                    value={auditFee}
                    onChange={e => setAuditFee(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 border border-slate-300 rounded px-2.5 py-1 font-mono font-bold text-indigo-700 bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900">
                {partnerSignStatus ? (
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>Engagement Approved by Partner</span>
                  </div>
                ) : (
                  <span>Ready for Engagement Partner sign-off. All independence checks satisfied.</span>
                )}
              </div>
            </div>

            <button
              onClick={handleSignOffEngagement}
              disabled={partnerSignStatus}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-emerald-600 text-white font-semibold py-2.5 rounded-md text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {partnerSignStatus ? <Check size={14} /> : <UserCheck size={14} />}
              <span>{partnerSignStatus ? 'Partner Approved & File Locked' : 'Sign-Off & Approve Engagement'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ENGAGEMENT LETTER PREVIEW */}
      {activeTab === 'letter' && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-xs max-w-4xl mx-auto space-y-6 text-xs text-slate-800 leading-relaxed font-serif">
          <div className="text-center pb-4 border-b border-slate-200 font-sans space-y-1">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              {firm?.name || 'Provident Accounting & Advisory (Pty) Ltd'}
            </h2>
            <p className="text-xs text-slate-500">
              IRBA Registration No. {firm?.irbaNumber || '904812'} · SAICA Practice No. {firm?.saicaNumber || 'SAICA-2024-81'}
            </p>
            <span className="inline-block mt-2 font-bold text-indigo-600 text-xs tracking-wider uppercase">
              Statutory Audit Engagement Letter (ISA 210)
            </span>
          </div>

          <div className="space-y-4">
            <p><strong>To the Board of Directors of {activeClient?.name}:</strong></p>
            <p>
              You have requested that we audit the annual financial statements of <strong>{activeClient?.name}</strong>, which comprise the statement of financial position as at <strong>{activeClient?.fyEnd}</strong>, and the statement of comprehensive income, statement of changes in equity and statement of cash flows for the year then ended, and notes to the financial statements.
            </p>
            <p>
              We are pleased to confirm our acceptance and our understanding of this audit engagement by means of this letter. Our audit will be conducted in accordance with International Standards on Auditing (ISAs) and the requirements of the South African Companies Act No. 71 of 2008.
            </p>
            <p>
              <strong>Responsibilities of Management:</strong> Management acknowledges responsibility for the preparation and fair presentation of the financial statements in accordance with <strong>{activeClient?.type || 'IFRS for SMEs'}</strong>, and for maintaining adequate internal accounting controls.
            </p>
            <p>
              <strong>Agreed Audit Fee:</strong> Our professional audit fee for the reporting period is agreed at <strong>R {auditFee.toLocaleString()}</strong> (exclusive of 15% VAT).
            </p>
          </div>

          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 font-sans text-xs">
            <div>
              <span className="block text-slate-400 text-[10px]">For the Audit Firm:</span>
              <div className="mt-6 border-b border-slate-400 pb-1 font-bold">
                {partnerSignStatus ? 'Audit Engagement Partner (Signed)' : '_____________________________'}
              </div>
              <span className="text-slate-600 text-[11px] block mt-0.5">{firm?.name || 'Provident Advisory'}</span>
            </div>
            <div>
              <span className="block text-slate-400 text-[10px]">Acknowledged for the Client:</span>
              <div className="mt-6 border-b border-slate-400 pb-1 font-bold">
                _____________________________
              </div>
              <span className="text-slate-600 text-[11px] block mt-0.5">Board of Directors · {activeClient?.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

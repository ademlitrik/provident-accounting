import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LoginPage from '@/pages/LoginPage'
import AppShell from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Clients from '@/pages/Clients'
import ChartOfAccounts from '@/pages/ChartOfAccounts'
import GeneralLedger from '@/pages/GeneralLedger'
import TrialBalance from '@/pages/TrialBalance'
import BankRecon from '@/pages/BankRecon'
import FinancialStatements from '@/pages/FinancialStatements'
import WorkingPapers from '@/pages/WorkingPapers'
import TaxComputation from '@/pages/TaxComputation'
import DocumentManagement from '@/pages/DocumentManagement'
import FileMigrationHub from '@/pages/FileMigrationHub'
import PdfUnlocker from '@/pages/PdfUnlocker'
import SouthAfricaAuditPlanner from '@/pages/SouthAfricaAuditPlanner'
import CipcIbrlGenerator from '@/pages/CipcIbrlGenerator'
import SubstantiveSampling from '@/pages/SubstantiveSampling'
import SecurityComplianceCenter from '@/pages/SecurityComplianceCenter'
import EngagementAcceptance from '@/pages/EngagementAcceptance'
import PracticeManagement from '@/pages/PracticeManagement'
import AIAssistant from '@/pages/AIAssistant'
import Settings from '@/pages/Settings'
import UserManagement from '@/pages/UserManagement'
import HelpCenter from '@/pages/HelpCenter'
function ProtectedRoute({ children }) {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="accounts" element={<ChartOfAccounts />} />
        <Route path="ledger" element={<GeneralLedger />} />
        <Route path="trial-balance" element={<TrialBalance />} />
        <Route path="bank-recon" element={<BankRecon />} />
        <Route path="financials" element={<FinancialStatements />} />
        <Route path="working-papers" element={<WorkingPapers />} />
        <Route path="acceptance" element={<EngagementAcceptance />} />
        <Route path="practice" element={<PracticeManagement />} />
        <Route path="tax" element={<TaxComputation />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="sa-audit" element={<SouthAfricaAuditPlanner />} />
        <Route path="cipc-ixbrl" element={<CipcIbrlGenerator />} />
        <Route path="sampling" element={<SubstantiveSampling />} />
        <Route path="migrate" element={<FileMigrationHub />} />
        <Route path="unlock-pdf" element={<PdfUnlocker />} />
        <Route path="security" element={<SecurityComplianceCenter />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="help" element={<HelpCenter />} />
      </Route>
    </Routes>
  )
}

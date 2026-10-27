import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const INITIAL_CLIENTS = [
  { 
    id: 1, 
    name: 'Acme Corporation (Pty) Ltd', 
    contact: 'John Smith', 
    email: 'john@acme.com', 
    phone: '+27 11 555 0101', 
    location: 'Johannesburg, South Africa', 
    status: 'Active', 
    type: 'Audit & Tax', 
    fyEnd: '31 Dec 2024', 
    accountsCount: 19,
    logo: '/icon.png',
    letterhead: null
  },
  { 
    id: 2, 
    name: 'Beta Technologies Ltd', 
    contact: 'Sarah Jones', 
    email: 'sarah@beta.com', 
    phone: '+44 20-7946-0958', 
    location: 'London, UK', 
    status: 'Active', 
    type: 'Bookkeeping', 
    fyEnd: '31 Mar 2025', 
    accountsCount: 24,
    logo: null,
    letterhead: null
  },
  { 
    id: 3, 
    name: 'Gamma Industries Inc', 
    contact: 'Mike Chen', 
    email: 'mike@gamma.com', 
    phone: '+1 416-555-0103', 
    location: 'Toronto, Canada', 
    status: 'Review', 
    type: 'Tax Only', 
    fyEnd: '30 Jun 2024', 
    accountsCount: 15,
    logo: null,
    letterhead: null
  },
  { 
    id: 4, 
    name: 'Delta Consulting Group', 
    contact: 'Lisa Park', 
    email: 'lisa@delta.com', 
    phone: '+61 2-8765-0104', 
    location: 'Sydney, Australia', 
    status: 'Active', 
    type: 'Audit & Tax', 
    fyEnd: '30 Sep 2024', 
    accountsCount: 31,
    logo: null,
    letterhead: null
  },
  { 
    id: 5, 
    name: 'Epsilon Ventures (Pty) Ltd', 
    contact: 'Tom Wilson', 
    email: 'tom@epsilon.com', 
    phone: '+27 21-555-0105', 
    location: 'Cape Town, South Africa', 
    status: 'Active', 
    type: 'Full Practice Service', 
    fyEnd: '28 Feb 2025', 
    accountsCount: 22,
    logo: null,
    letterhead: null
  },
]

export const buildStarterDataForClient = (clientId, clientName = 'Engagement Entity', multiplier = 1) => {
  const m = multiplier;
  const accounts = [
    { code: '1000', name: 'Cash and Cash Equivalents', type: 'Asset', sub: 'Current Assets', balance: Math.round(284500 * m), clientId },
    { code: '1100', name: 'Trade and Other Receivables', type: 'Asset', sub: 'Current Assets', balance: Math.round(156300 * m), clientId },
    { code: '1200', name: 'Merchandise Inventory at Cost', type: 'Asset', sub: 'Current Assets', balance: Math.round(93400 * m), clientId },
    { code: '1300', name: 'Prepayments & Deposits', type: 'Asset', sub: 'Current Assets', balance: Math.round(12000 * m), clientId },
    { code: '1500', name: 'Property, Plant & Equipment (Gross)', type: 'Asset', sub: 'Non-Current Assets', balance: Math.round(620000 * m), clientId },
    { code: '1510', name: 'Accumulated Depreciation - Plant', type: 'Asset', sub: 'Non-Current Assets', balance: Math.round(-184000 * m), clientId },
    { code: '2000', name: 'Trade and Other Payables', type: 'Liability', sub: 'Current Liabilities', balance: Math.round(-89700 * m), clientId },
    { code: '2100', name: 'Short-term Borrowings (Working Capital)', type: 'Liability', sub: 'Current Liabilities', balance: Math.round(-50000 * m), clientId },
    { code: '2200', name: 'VAT Output Payable', type: 'Liability', sub: 'Current Liabilities', balance: Math.round(-15500 * m), clientId },
    { code: '2500', name: 'Long-term Bank Facilities', type: 'Liability', sub: 'Non-Current Liabilities', balance: Math.round(-230000 * m), clientId },
    { code: '3000', name: 'Ordinary Share Capital', type: 'Equity', sub: 'Shareholder Capital', balance: Math.round(-300000 * m), clientId },
    { code: '3100', name: 'Retained Earnings (Accumulated Reserves)', type: 'Equity', sub: 'Retained Reserves', balance: Math.round(-62500 * m), clientId },
    { code: '4000', name: 'Operating Sales Revenue', type: 'Income', sub: 'Operating Revenue', balance: Math.round(-654000 * m), clientId },
    { code: '4100', name: 'Professional Advisory Fee Income', type: 'Income', sub: 'Operating Revenue', balance: Math.round(-87500 * m), clientId },
    { code: '5000', name: 'Direct Cost of Merchandise Sold', type: 'Expense', sub: 'Direct Costs', balance: Math.round(312000 * m), clientId },
    { code: '5100', name: 'Salaries, Wages & Employee Benefits', type: 'Expense', sub: 'Operating Expenses', balance: Math.round(144000 * m), clientId },
    { code: '5200', name: 'Premises Lease Rentals', type: 'Expense', sub: 'Operating Expenses', balance: Math.round(33000 * m), clientId },
    { code: '5300', name: 'Administrative & Office Operating Expenses', type: 'Expense', sub: 'Operating Expenses', balance: Math.round(8500 * m), clientId },
    { code: '5400', name: 'Depreciation & Amortization Expense', type: 'Expense', sub: 'Operating Expenses', balance: Math.round(14400 * m), clientId },
    { code: '5500', name: 'Digital Advertising & Marketing Expenses', type: 'Expense', sub: 'Operating Expenses', balance: Math.round(12400 * m), clientId },
    { code: '5600', name: 'Municipal Utilities, Power & Telecoms', type: 'Expense', sub: 'Operating Expenses', balance: Math.round(4200 * m), clientId },
  ];

  const journals = [
    { id: `JE-${clientId}01`, date: '2024-10-25', description: `Monthly Sales Revenue Recognized - ${clientName}`, debit: '1100 Trade Receivables', credit: '4000 Sales Revenue', amount: Math.round(12400 * m), status: 'Posted', author: 'Senior Partner', clientId },
    { id: `JE-${clientId}02`, date: '2024-10-24', description: 'Office Consumables & Operational Supplies', debit: '5300 Office Expenses', credit: '1000 Cash Equivalents', amount: Math.round(840 * m), status: 'Posted', author: 'Senior Partner', clientId },
    { id: `JE-${clientId}03`, date: '2024-10-23', description: 'Staff Payroll Disbursement - October', debit: '5100 Salaries Expense', credit: '1000 Cash Equivalents', amount: Math.round(48000 * m), status: 'Posted', author: 'Senior Partner', clientId },
    { id: `JE-${clientId}04`, date: '2024-10-22', description: 'Professional Advisory Fee Retainer', debit: '1100 Trade Receivables', credit: '4100 Consulting Revenue', amount: Math.round(8750 * m), status: 'Posted', author: 'Senior Partner', clientId },
    { id: `JE-${clientId}05`, date: '2024-10-21', description: 'Premises Lease Rental - Operating Unit', debit: '5200 Rent Expense', credit: '1000 Cash Equivalents', amount: Math.round(5500 * m), status: 'Posted', author: 'Senior Partner', clientId },
    { id: `JE-${clientId}06`, date: '2024-10-20', description: 'Depreciation Provision - Office Machinery', debit: '5400 Depreciation Expense', credit: '1510 Acc. Depreciation', amount: Math.round(1200 * m), status: 'Posted', author: 'Senior Partner', clientId },
  ];

  const bankItems = [
    { id: parseInt(`${clientId}01`), clientId, date: '2024-10-28', desc: `Client Settlement Wire: ${clientName}`, amount: Math.round(-12400 * m), ref: `EFT-${clientId}912`, matched: true, matchRef: `JE-${clientId}01` },
    { id: parseInt(`${clientId}02`), clientId, date: '2024-10-25', desc: 'Equipment Depreciation Amortization', amount: Math.round(-1200 * m), ref: `SYS-${clientId}02`, matched: true, matchRef: `JE-${clientId}06` },
    { id: parseInt(`${clientId}03`), clientId, date: '2024-10-20', desc: 'Stationery & Consumables Order', amount: Math.round(-840 * m), ref: `EFT-${clientId}910`, matched: true, matchRef: `JE-${clientId}02` },
    { id: parseInt(`${clientId}04`), clientId, date: '2024-10-15', desc: 'Premises Operating Lease Rental', amount: Math.round(-5500 * m), ref: `EFT-${clientId}909`, matched: true, matchRef: `JE-${clientId}05` },
    { id: parseInt(`${clientId}05`), clientId, date: '2024-10-10', desc: 'Staff Payroll Disbursement', amount: Math.round(-48000 * m), ref: `EFT-${clientId}908`, matched: true, matchRef: `JE-${clientId}03` },
    { id: parseInt(`${clientId}06`), clientId, date: '2024-10-08', desc: 'Customer Invoice Receipt', amount: Math.round(8750 * m), ref: `DEP-${clientId}234`, matched: false, matchRef: null },
    { id: parseInt(`${clientId}07`), clientId, date: '2024-10-05', desc: 'Trade Inflow Settlement', amount: Math.round(91000 * m), ref: `DEP-${clientId}233`, matched: false, matchRef: null },
    { id: parseInt(`${clientId}08`), clientId, date: '2024-10-02', desc: 'Banking Administration Charges', amount: Math.round(-125 * m), ref: `FEE-${clientId}`, matched: false, matchRef: null },
    { id: parseInt(`${clientId}09`), clientId, date: '2024-10-01', desc: 'Monthly Deposit Interest Accrued', amount: Math.round(340 * m), ref: `INT-${clientId}`, matched: false, matchRef: null },
  ];

  const workingPapers = [
    { id: `WP-${clientId}01`, clientId, section: 'Revenue', title: `Lead Schedule — Operating Sales & Retainer Revenue`, assignee: 'Lead Auditor', status: 'Complete', risk: 'Low', balance: `R ${(741500 * m).toLocaleString()}` },
    { id: `WP-${clientId}02`, clientId, section: 'Cash', title: 'Bank Reconciliation & Confirmation Certificates', assignee: 'Audit Senior', status: 'In Progress', risk: 'Medium', balance: `R ${(284500 * m).toLocaleString()}` },
    { id: `WP-${clientId}03`, clientId, section: 'Receivables', title: 'Debtors Ledger Ageing & Recoverability Assessment', assignee: 'Lead Auditor', status: 'Not Started', risk: 'High', balance: `R ${(156300 * m).toLocaleString()}` },
    { id: `WP-${clientId}04`, clientId, section: 'Fixed Assets', title: 'Plant, Machinery & Office Asset Verification Register', assignee: 'Audit Senior', status: 'Complete', risk: 'Low', balance: `R ${(436000 * m).toLocaleString()}` },
    { id: `WP-${clientId}05`, clientId, section: 'Taxation', title: 'Corporate Income Tax Assessment & Deferred Tax', assignee: 'Tax Specialist', status: 'In Progress', risk: 'Medium', balance: `R ${(28500 * m).toLocaleString()}` },
    { id: `WP-${clientId}06`, clientId, section: 'Liabilities', title: 'Long-term Bank Facilities & Covenant Review', assignee: 'Audit Partner', status: 'Complete', risk: 'Low', balance: `R ${(230000 * m).toLocaleString()}` },
  ];

  const documents = [
    { id: `DOC-${clientId}01`, clientId, name: `${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_Bank_Statement_Oct2024.pdf`, type: 'PDF', size: '1.4 MB', date: '2024-10-29', category: 'Bank Statements', wpRef: `WP-${clientId}02`, ocrStatus: 'Processed', extracted: `Verified digital bank statement for ${clientName}. Closing balance agreed.` },
    { id: `DOC-${clientId}02`, clientId, name: `${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_Commercial_Lease_Agreement.pdf`, type: 'PDF', size: '2.8 MB', date: '2024-01-15', category: 'Contracts & Leases', wpRef: `WP-${clientId}04`, ocrStatus: 'Processed', extracted: `Standard commercial lease. Monthly rental agreed to GL account 5200.` },
    { id: `DOC-${clientId}03`, clientId, name: `${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_Tax_Clearance_Pin.pdf`, type: 'PDF', size: '380 KB', date: '2024-09-02', category: 'Statutory Tax', wpRef: `WP-${clientId}05`, ocrStatus: 'Processed', extracted: `SARS Tax Compliance Pin Verified: Status: Compliant.` },
  ];

  return { accounts, journals, bankItems, workingPapers, documents };
};

const c1 = buildStarterDataForClient(1, 'Acme Corporation (Pty) Ltd', 1);
const c2 = buildStarterDataForClient(2, 'Beta Technologies Ltd', 1.25);
const c3 = buildStarterDataForClient(3, 'Gamma Industries Inc', 0.85);
const c4 = buildStarterDataForClient(4, 'Delta Consulting Group', 1.5);
const c5 = buildStarterDataForClient(5, 'Epsilon Ventures (Pty) Ltd', 0.95);

const INITIAL_ACCOUNTS = [...c1.accounts, ...c2.accounts, ...c3.accounts, ...c4.accounts, ...c5.accounts];
const INITIAL_JOURNALS = [...c1.journals, ...c2.journals, ...c3.journals, ...c4.journals, ...c5.journals];
const INITIAL_PAPERS = [...c1.workingPapers, ...c2.workingPapers, ...c3.workingPapers, ...c4.workingPapers, ...c5.workingPapers];
const INITIAL_DOCUMENTS = [...c1.documents, ...c2.documents, ...c3.documents, ...c4.documents, ...c5.documents];
const INITIAL_BANK_ITEMS = [...c1.bankItems, ...c2.bankItems, ...c3.bankItems, ...c4.bankItems, ...c5.bankItems];

const INITIAL_RECENT_ENGAGEMENTS = [
  { id: 1, name: 'Acme Corporation (Pty) Ltd', location: 'Johannesburg, South Africa', fyEnd: '31 Dec 2024', lastOpened: 'Just now' },
  { id: 5, name: 'Epsilon Ventures (Pty) Ltd', location: 'Cape Town, South Africa', fyEnd: '28 Feb 2025', lastOpened: '2 hours ago' },
  { id: 4, name: 'Delta Consulting Group', location: 'Sydney, Australia', fyEnd: '30 Sep 2024', lastOpened: 'Yesterday' },
  { id: 2, name: 'Beta Technologies Ltd', location: 'London, UK', fyEnd: '31 Mar 2025', lastOpened: '3 days ago' },
]

const INITIAL_RECENT_DOCUMENTS = [
  { id: 'DOC-001', name: 'First_National_Bank_Oct2024_Statement.pdf', type: 'Bank Statement', wpRef: 'WP-002', date: '2024-10-29', size: '1.4 MB' },
  { id: 'DOC-002', name: 'Acme_Office_Lease_Agreement_2024.pdf', type: 'Contract & Lease', wpRef: 'WP-004', date: '2024-01-15', size: '3.8 MB' },
  { id: 'DOC-003', name: 'Tax_Clearance_Certificate_FY2024.pdf', type: 'Statutory Tax', wpRef: 'WP-005', date: '2024-09-02', size: '420 KB' },
  { id: 'DOC-004', name: 'Oct_Digital_Marketing_Invoice_INV-8812.png', type: 'Audit Voucher', wpRef: 'WP-001', date: '2024-10-28', size: '890 KB' },
]

export const useAccountingStore = create(
  persist(
    (set, get) => ({
      // Active engagement context
      activeClientId: 1,
      setActiveClientId: (id) => {
        const client = get().clients.find(c => c.id === id)
        const nowStr = new Date().toLocaleDateString('en-ZA', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        if (client) {
          const recents = get().recentEngagements || []
          const filtered = recents.filter(r => r.id !== id)
          const updated = [
            { 
              id: client.id, 
              name: client.name, 
              location: client.location, 
              fyEnd: client.fyEnd, 
              lastOpened: nowStr,
              lastOpenedTimestamp: Date.now()
            },
            ...filtered
          ].slice(0, 8)
          // Also update client object directly with last worked date/time
          const updatedClients = get().clients.map(c => 
            c.id === id ? { ...c, lastOpened: nowStr, lastOpenedTimestamp: Date.now() } : c
          )
          set({ activeClientId: id, recentEngagements: updated, clients: updatedClients })
        } else {
          set({ activeClientId: id })
        }
      },

      recentEngagements: INITIAL_RECENT_ENGAGEMENTS,
      recentDocuments: INITIAL_RECENT_DOCUMENTS,

      addRecentDocument: (doc) => {
        const recents = get().recentDocuments || []
        const filtered = recents.filter(d => d.name !== doc.name)
        const updated = [{ ...doc, lastOpened: 'Just now' }, ...filtered].slice(0, 10)
        set({ recentDocuments: updated })
      },

      clients: INITIAL_CLIENTS,
      accounts: INITIAL_ACCOUNTS,
      journals: INITIAL_JOURNALS,
      workingPapers: INITIAL_PAPERS,
      documents: INITIAL_DOCUMENTS,
      bankItems: INITIAL_BANK_ITEMS,
      auditTrail: [],

      // ── Audit trail actions ──
      addAuditEntry: (entry) => {
        const state = get()
        const newEntry = {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          clientId: entry.clientId || state.activeClientId,
          user: entry.user || 'System',
          action: entry.action || 'Unknown',
          detail: entry.detail || '',
          module: entry.module || 'General',
          ...entry
        }
        set((s) => ({ auditTrail: [newEntry, ...s.auditTrail] }))
      },

      // ── Bank reconciliation actions ──
      setBankItems: (items) => set({ bankItems: items }),
      addBankItem: (item) => {
        const activeId = get().activeClientId || 1
        set((s) => ({
          bankItems: [{ ...item, id: Date.now(), clientId: activeId }, ...s.bankItems]
        }))
      },
      matchBankItem: (itemId, matchRef) => set((s) => ({
        bankItems: s.bankItems.map(i => i.id === itemId ? { ...i, matched: true, matchRef } : i)
      })),

      // ── Backup & Restore Engagement ──
      exportEngagementBackup: (clientId) => {
        const targetId = clientId || get().activeClientId || 1
        const client = get().clients.find(c => c.id === targetId)
        const backupData = {
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          providentSuite: 'Provident Accounting & Audit',
          firm: 'Provident Financial Consultants',
          developerCredit: 'Tanyaradzwa Livingstone Bvute / Afro Vision Media',
          client,
          accounts: get().accounts,
          journals: get().journals,
          workingPapers: get().workingPapers.filter(w => w.clientId === targetId),
          documents: get().documents.filter(d => d.clientId === targetId)
        }
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${(client?.name || 'Provident_Engagement').replace(/[^a-zA-Z0-9_-]/g, '_')}_Backup_${new Date().toISOString().split('T')[0]}.pvd`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      },

      restoreEngagementBackup: (backupData) => {
        if (!backupData || !backupData.client) {
          throw new Error('Invalid Provident engagement backup file format.')
        }
        const restoredClient = backupData.client
        const existingClients = get().clients.filter(c => c.id !== restoredClient.id)
        set({
          clients: [restoredClient, ...existingClients],
          activeClientId: restoredClient.id,
          accounts: backupData.accounts || get().accounts,
          journals: backupData.journals || get().journals,
          workingPapers: [...(backupData.workingPapers || []), ...get().workingPapers.filter(w => w.clientId !== restoredClient.id)],
          documents: [...(backupData.documents || []), ...get().documents.filter(d => d.clientId !== restoredClient.id)]
        })
      },

      // ── Roll Forward to Next Financial Year ──
      rollForwardYear: () => {
        const activeId = get().activeClientId || 1
        const client = get().clients.find(c => c.id === activeId)
        if (!client) return

        // Compute current year net income from income & expense accounts
        const incomeTotal = get().accounts
          .filter(a => a.type === 'Income')
          .reduce((sum, a) => sum + (a.balance || 0), 0)
        const expenseTotal = get().accounts
          .filter(a => a.type === 'Expense')
          .reduce((sum, a) => sum + (a.balance || 0), 0)
        const netProfit = Math.abs(incomeTotal) - expenseTotal

        // Advance FY end year by 1
        const currentYearMatch = client.fyEnd.match(/\d{4}/)
        const nextYear = currentYearMatch ? parseInt(currentYearMatch[0], 10) + 1 : 2026
        const newFyEnd = client.fyEnd.replace(/\d{4}/, String(nextYear))

        // Reset temporary accounts (Income & Expense) to 0, transfer net profit to Retained Earnings
        const updatedAccounts = get().accounts.map(acc => {
          if (acc.type === 'Income' || acc.type === 'Expense') {
            return { ...acc, balance: 0 }
          }
          if (acc.code === '3100' || acc.name.toLowerCase().includes('retained earnings')) {
            return { ...acc, balance: (acc.balance || 0) - netProfit }
          }
          return acc
        })

        // Reset working papers status to 'Not Started' for the new year
        const updatedPapers = get().workingPapers.map(wp => {
          if (wp.clientId === activeId) {
            return { ...wp, status: 'Not Started' }
          }
          return wp
        })

        set(s => ({
          clients: s.clients.map(c => c.id === activeId ? { ...c, fyEnd: newFyEnd } : c),
          accounts: updatedAccounts,
          workingPapers: updatedPapers
        }))

        return { clientName: client.name, newFyEnd, netProfit }
      },

      // ── Client CRUD ──
      addClient: (client, withStarterData = true) => {
        const newClient = { ...client, id: Date.now() }
        let newAccounts = []
        let newJournals = []
        let newBankItems = []
        let newPapers = []
        let newDocs = []

        if (withStarterData) {
          const starter = buildStarterDataForClient(newClient.id, newClient.name, 1)
          newAccounts = starter.accounts
          newJournals = starter.journals
          newBankItems = starter.bankItems
          newPapers = starter.workingPapers
          newDocs = starter.documents
        }

        set((s) => ({
          clients: [newClient, ...s.clients],
          accounts: [...s.accounts, ...newAccounts],
          journals: [...s.journals, ...newJournals],
          bankItems: [...s.bankItems, ...newBankItems],
          workingPapers: [...s.workingPapers, ...newPapers],
          documents: [...s.documents, ...newDocs],
        }))
        return newClient
      },

      seedClientStarterData: (clientId, clientName, multiplier = 1) => {
        const starter = buildStarterDataForClient(clientId, clientName, multiplier)
        set((s) => ({
          accounts: [...s.accounts.filter(a => a.clientId !== clientId), ...starter.accounts],
          journals: [...s.journals.filter(j => j.clientId !== clientId), ...starter.journals],
          bankItems: [...s.bankItems.filter(b => b.clientId !== clientId), ...starter.bankItems],
          workingPapers: [...s.workingPapers.filter(w => w.clientId !== clientId), ...starter.workingPapers],
          documents: [...s.documents.filter(d => d.clientId !== clientId), ...starter.documents],
        }))
        return starter
      },

      updateClient: (id, updatedFields) => set((s) => ({
        clients: s.clients.map(c => c.id === id ? { ...c, ...updatedFields } : c)
      })),

      deleteClient: (id) => set((s) => {
        // Also clean up or unassign active client
        const remaining = s.clients.filter(c => c.id !== id)
        const nextActive = s.activeClientId === id ? (remaining[0]?.id || null) : s.activeClientId
        return {
          clients: remaining,
          activeClientId: nextActive,
          workingPapers: s.workingPapers.filter(w => w.clientId !== id),
          documents: s.documents.filter(d => d.clientId !== id)
        }
      }),

      // ── Accounts actions ──
      addAccount: (account) => set((s) => ({
        accounts: [...s.accounts, { ...account, clientId: account.clientId || s.activeClientId }]
      })),
      setAccounts: (accounts) => set({ accounts }),
      mergeAccounts: (newAccounts) => set((s) => {
        const activeId = s.activeClientId || 1
        const tagged = newAccounts.map(a => ({
          ...a,
          clientId: a.clientId || activeId
        }))
        const existingCodes = new Set(s.accounts.filter(a => a.clientId === activeId).map(a => String(a.code)))
        const filteredNew = tagged.filter(a => !existingCodes.has(String(a.code)))
        const updatedExisting = s.accounts.map(a => {
          if (a.clientId !== activeId) return a
          const matched = tagged.find(na => String(na.code) === String(a.code))
          return matched ? { ...a, ...matched } : a
        })
        return { accounts: [...updatedExisting, ...filteredNew] }
      }),

      // ── Journal entries actions ──
      addJournalEntry: (entry) => {
        const state = get()
        const id = `JE-${1000 + state.journals.length + 1}`
        const newEntry = {
          ...entry,
          id,
          clientId: entry.clientId || state.activeClientId,
          author: entry.author || 'Auditor',
          date: entry.date || new Date().toISOString().split('T')[0],
          status: entry.status || 'Posted'
        }
        set((s) => ({
          journals: [newEntry, ...s.journals]
        }))
      },

      // ── Working paper status & actions ──
      updateWorkingPaperStatus: (id, status) => set((s) => ({
        workingPapers: s.workingPapers.map(wp => wp.id === id ? { ...wp, status } : wp)
      })),

      addWorkingPaper: (paper) => {
        const activeId = get().activeClientId || 1
        set((s) => ({
          workingPapers: [...s.workingPapers, { ...paper, clientId: activeId, id: `WP-00${s.workingPapers.length + 1}` }]
        }))
      },

      // ── Documents CRUD ──
      addDocument: (doc) => {
        const activeId = get().activeClientId || 1
        const newDoc = {
          ...doc,
          id: `DOC-00${get().documents.length + 1}`,
          clientId: activeId,
          date: new Date().toISOString().split('T')[0]
        }
        set((s) => ({ documents: [newDoc, ...s.documents] }))
        return newDoc
      },

      deleteDocument: (id) => set((s) => ({
        documents: s.documents.filter(d => d.id !== id)
      })),

      // ── Reset ──
      resetData: () => set({
        clients: INITIAL_CLIENTS,
        accounts: INITIAL_ACCOUNTS,
        journals: INITIAL_JOURNALS,
        workingPapers: INITIAL_PAPERS,
        documents: INITIAL_DOCUMENTS,
        bankItems: INITIAL_BANK_ITEMS,
        auditTrail: [],
        activeClientId: 1
      })
    }),
    { name: 'provident-accounting-store' }
  )
)

/**
 * Currency Formatter Utility adhering to the persistent firm setting
 */
export function formatCurrency(amount, currencySetting = 'ZAR (R)') {
  if (amount === undefined || amount === null) return '—'
  const str = String(currencySetting || '')
  let symbol = 'R '
  if (str.includes('USD') || str.includes('$')) symbol = '$ '
  else if (str.includes('ZAR') || str.includes('R')) symbol = 'R '
  else if (str.includes('GBP') || str.includes('£')) symbol = '£ '
  else if (str.includes('EUR') || str.includes('€')) symbol = '€ '
  else if (str.includes('BWP') || str.includes('P')) symbol = 'P '
  else if (str.includes('KES')) symbol = 'KSh '
  else if (str.includes('NGN') || str.includes('₦')) symbol = '₦ '
  
  const abs = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return amount < 0 ? `(${symbol}${abs})` : `${symbol}${abs}`
}

export function getCurrencyCode(currencySetting = 'ZAR (R)') {
  const str = String(currencySetting || '')
  if (str.includes('USD')) return 'USD'
  if (str.includes('ZAR')) return 'ZAR'
  if (str.includes('GBP')) return 'GBP'
  if (str.includes('EUR')) return 'EUR'
  if (str.includes('BWP')) return 'BWP'
  if (str.includes('KES')) return 'KES'
  if (str.includes('NGN')) return 'NGN'
  return 'ZAR'
}

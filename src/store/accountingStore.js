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

const INITIAL_ACCOUNTS = [
  { code: '1000', name: 'Cash and Cash Equivalents', type: 'Asset', sub: 'Current Assets', balance: 284500, clientId: 1 },
  { code: '1100', name: 'Trade and Other Receivables', type: 'Asset', sub: 'Current Assets', balance: 156300, clientId: 1 },
  { code: '1200', name: 'Merchandise Inventory at Cost', type: 'Asset', sub: 'Current Assets', balance: 93400, clientId: 1 },
  { code: '1500', name: 'Property, Plant & Equipment (Gross)', type: 'Asset', sub: 'Non-Current Assets', balance: 620000, clientId: 1 },
  { code: '1510', name: 'Accumulated Depreciation - Plant', type: 'Asset', sub: 'Non-Current Assets', balance: -184000, clientId: 1 },
  { code: '2000', name: 'Trade and Other Payables', type: 'Liability', sub: 'Current Liabilities', balance: -89700, clientId: 1 },
  { code: '2100', name: 'Short-term Borrowings (Working Capital)', type: 'Liability', sub: 'Current Liabilities', balance: -50000, clientId: 1 },
  { code: '2500', name: 'Long-term Bank Facilities', type: 'Liability', sub: 'Non-Current Liabilities', balance: -230000, clientId: 1 },
  { code: '3000', name: 'Ordinary Share Capital', type: 'Equity', sub: 'Shareholder Capital', balance: -300000, clientId: 1 },
  { code: '3100', name: 'Retained Earnings (Accumulated Reserves)', type: 'Equity', sub: 'Retained Reserves', balance: -62500, clientId: 1 },
  { code: '4000', name: 'Operating Sales Revenue', type: 'Income', sub: 'Operating Revenue', balance: -654000, clientId: 1 },
  { code: '4100', name: 'Professional Advisory Fee Income', type: 'Income', sub: 'Operating Revenue', balance: -87500, clientId: 1 },
  { code: '5000', name: 'Direct Cost of Merchandise Sold', type: 'Expense', sub: 'Direct Costs', balance: 312000, clientId: 1 },
  { code: '5100', name: 'Salaries, Wages & Employee Benefits', type: 'Expense', sub: 'Operating Expenses', balance: 144000, clientId: 1 },
  { code: '5200', name: 'Premises Lease Rentals', type: 'Expense', sub: 'Operating Expenses', balance: 33000, clientId: 1 },
  { code: '5300', name: 'Administrative & Office Operating Expenses', type: 'Expense', sub: 'Operating Expenses', balance: 8500, clientId: 1 },
  { code: '5400', name: 'Depreciation & Amortization Expense', type: 'Expense', sub: 'Operating Expenses', balance: 14400, clientId: 1 },
  { code: '5500', name: 'Digital Advertising & Marketing Expenses', type: 'Expense', sub: 'Operating Expenses', balance: 12400, clientId: 1 },
  { code: '5600', name: 'Municipal Utilities, Power & Telecoms', type: 'Expense', sub: 'Operating Expenses', balance: 4200, clientId: 1 },
]

const INITIAL_JOURNALS = [
  { id: 'JE-1041', date: '2024-10-25', description: 'Monthly Sales Revenue Recognized - Acme Corp', debit: '1100 Trade Receivables', credit: '4000 Sales Revenue', amount: 12400, status: 'Posted', author: '', clientId: 1 },
  { id: 'JE-1040', date: '2024-10-24', description: 'Office Consumables & Stationary Supplies', debit: '5300 Office Expenses', credit: '1000 Cash Equivalents', amount: 840, status: 'Posted', author: '', clientId: 1 },
  { id: 'JE-1039', date: '2024-10-23', description: 'Staff Payroll Disbursement - October 2024', debit: '5100 Salaries Expense', credit: '1000 Cash Equivalents', amount: 48000, status: 'Posted', author: '', clientId: 1 },
  { id: 'JE-1038', date: '2024-10-22', description: 'Consulting Advisory Retainer - Beta Technologies', debit: '1100 Trade Receivables', credit: '4100 Consulting Revenue', amount: 8750, status: 'Posted', author: '', clientId: 1 },
  { id: 'JE-1037', date: '2024-10-21', description: 'Premises Lease Rental Oct - Suite 400', debit: '5200 Rent Expense', credit: '1000 Cash Equivalents', amount: 5500, status: 'Posted', author: '', clientId: 1 },
  { id: 'JE-1036', date: '2024-10-20', description: 'Depreciation Provision - Office Machinery', debit: '5400 Depreciation Expense', credit: '1510 Acc. Depreciation', amount: 1200, status: 'Posted', author: '', clientId: 1 },
]

const INITIAL_PAPERS = [
  { id: 'WP-001', clientId: 1, section: 'Revenue', title: 'Lead Schedule — Operating Sales & Retainer Revenue', assignee: 'Jane Doe', status: 'Complete', risk: 'Low', balance: '$741,500' },
  { id: 'WP-002', clientId: 1, section: 'Cash', title: 'Bank Reconciliation & Confirmation Letter', assignee: 'John Smith', status: 'In Progress', risk: 'Medium', balance: '$284,500' },
  { id: 'WP-003', clientId: 1, section: 'Receivables', title: 'Debtors Ledger Ageing & Bad Debt Recoverability', assignee: 'Jane Doe', status: 'Not Started', risk: 'High', balance: '$156,300' },
  { id: 'WP-004', clientId: 1, section: 'Fixed Assets', title: 'Plant, Machinery & Office Asset Verification', assignee: 'John Smith', status: 'Complete', risk: 'Low', balance: '$436,000' },
  { id: 'WP-005', clientId: 1, section: 'Taxation', title: 'Corporate Income Tax Assessment & Deferred Tax', assignee: 'Admin User', status: 'In Progress', risk: 'Medium', balance: '$28,500' },
  { id: 'WP-006', clientId: 1, section: 'Liabilities', title: 'Long-term Bank Facilities & Covenant Review', assignee: 'Admin User', status: 'Complete', risk: 'Low', balance: '$230,000' },
]

const INITIAL_DOCUMENTS = [
  {
    id: 'DOC-001',
    clientId: 1,
    name: 'First_National_Bank_Oct2024_Statement.pdf',
    type: 'PDF',
    size: '1.4 MB',
    date: '2024-10-29',
    category: 'Bank Statements',
    wpRef: 'WP-002',
    ocrStatus: 'Processed',
    extracted: 'Closing Balance: $284,500.00 | Total Inflows: $99,750.00 | Total Outflows: $67,965.00'
  },
  {
    id: 'DOC-002',
    clientId: 1,
    name: 'Acme_Office_Lease_Agreement_2024.pdf',
    type: 'PDF',
    size: '3.8 MB',
    date: '2024-01-15',
    category: 'Contracts & Leases',
    wpRef: 'WP-004',
    ocrStatus: 'Processed',
    extracted: 'Premises: Suite 400 | Monthly Rental: $5,500.00 | Term: 36 Months | Escalation: 5% p.a.'
  },
  {
    id: 'DOC-003',
    clientId: 1,
    name: 'Tax_Clearance_Certificate_FY2024.pdf',
    type: 'PDF',
    size: '420 KB',
    date: '2024-09-02',
    category: 'Statutory & Tax',
    wpRef: 'WP-005',
    ocrStatus: 'Processed',
    extracted: 'PIN: 9823471029 | Status: In Good Standing | Expiry: 2025-09-01'
  },
  {
    id: 'DOC-004',
    clientId: 1,
    name: 'Oct_Digital_Marketing_Invoice_INV-8812.png',
    type: 'Image',
    size: '890 KB',
    date: '2024-10-28',
    category: 'Invoices & Receipts',
    wpRef: 'WP-001',
    ocrStatus: 'Processed',
    extracted: 'Supplier: Apex Media Group | Inv #: INV-8812 | Total Due: $12,400.00 | VAT: $0.00'
  },
]

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

const INITIAL_BANK_ITEMS = [
  { id: 1, clientId: 1, date: '2024-10-28', desc: 'Digital Marketing Agency Wire', amount: -12400, ref: 'EFT-9912', matched: true, matchRef: 'JE-1007' },
  { id: 2, clientId: 1, date: '2024-10-25', desc: 'Equipment Depreciation Amortization', amount: -1200, ref: 'SYS-AUTO', matched: true, matchRef: 'JE-1006' },
  { id: 3, clientId: 1, date: '2024-10-20', desc: 'Office Depot - Stationary Invoices', amount: -840, ref: 'EFT-9910', matched: true, matchRef: 'JE-1005' },
  { id: 4, clientId: 1, date: '2024-10-15', desc: 'Premises Lease Rental - Suite 400', amount: -5500, ref: 'EFT-9909', matched: true, matchRef: 'JE-1004' },
  { id: 5, clientId: 1, date: '2024-10-10', desc: 'Staff Payroll Disbursement - October', amount: -48000, ref: 'EFT-9908', matched: true, matchRef: 'JE-1003' },
  { id: 6, clientId: 1, date: '2024-10-08', desc: 'Client Direct Settlement - Beta Ltd', amount: 8750, ref: 'DEP-2234', matched: false, matchRef: null },
  { id: 7, clientId: 1, date: '2024-10-05', desc: 'Customer Invoice Receipt - Acme Corp', amount: 91000, ref: 'DEP-2233', matched: false, matchRef: null },
  { id: 8, clientId: 1, date: '2024-10-02', desc: 'Commercial Banking Charges & Fees', amount: -125, ref: 'FEE-OCT', matched: false, matchRef: null },
  { id: 9, clientId: 1, date: '2024-10-01', desc: 'Monthly Deposit Interest Accrued', amount: 340, ref: 'INT-OCT', matched: false, matchRef: null },
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
      addClient: (client) => {
        const newClient = { ...client, id: Date.now() }
        set((s) => ({ clients: [newClient, ...s.clients] }))
        return newClient
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

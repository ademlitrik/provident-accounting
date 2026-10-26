/**
 * Provident Accounting — SQLite Database Layer
 * Uses better-sqlite3 for synchronous, high-performance SQLite.
 */
const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db;

function getDbPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'provident.db');
}

function initDatabase() {
  const dbPath = getDbPath();
  db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run migrations
  createTables();
  seedDemoData();

  console.log(`[DB] Initialized at: ${dbPath}`);
  return db;
}

function createTables() {
  db.exec(`
    -- ═══════════════════════════════════════════════
    -- USERS & AUTHENTICATION
    -- ═══════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Accountant',
      avatar_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- ═══════════════════════════════════════════════
    -- CLIENTS / ENTITIES
    -- ═══════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      trading_as TEXT,
      registration_no TEXT,
      tax_number TEXT,
      vat_number TEXT,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      country TEXT,
      industry TEXT,
      type TEXT DEFAULT 'Audit & Tax',
      status TEXT DEFAULT 'Active',
      currency TEXT DEFAULT 'USD',
      fiscal_year_end TEXT DEFAULT '12-31',
      notes TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- ═══════════════════════════════════════════════
    -- CHART OF ACCOUNTS
    -- ═══════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- Asset, Liability, Equity, Income, Expense
      sub_type TEXT,      -- Current Asset, Non-Current, etc.
      parent_id INTEGER REFERENCES accounts(id),
      is_active INTEGER DEFAULT 1,
      description TEXT,
      opening_balance REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(client_id, code)
    );

    -- ═══════════════════════════════════════════════
    -- JOURNAL ENTRIES
    -- ═══════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      reference TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      source TEXT DEFAULT 'Manual',  -- Manual, Import, System
      status TEXT DEFAULT 'Draft',   -- Draft, Posted, Reversed
      currency TEXT DEFAULT 'USD',
      exchange_rate REAL DEFAULT 1.0,
      created_by INTEGER REFERENCES users(id),
      approved_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      posted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS journal_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER REFERENCES journal_entries(id) ON DELETE CASCADE,
      account_id INTEGER REFERENCES accounts(id),
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      description TEXT,
      tax_code TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- ═══════════════════════════════════════════════
    -- BANK RECONCILIATION
    -- ═══════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS bank_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      account_id INTEGER REFERENCES accounts(id),
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      reference TEXT,
      category TEXT,
      is_reconciled INTEGER DEFAULT 0,
      matched_entry_id INTEGER REFERENCES journal_entries(id),
      imported_at TEXT DEFAULT (datetime('now'))
    );

    -- ═══════════════════════════════════════════════
    -- WORKING PAPERS / AUDIT
    -- ═══════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS working_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      reference TEXT NOT NULL,
      title TEXT NOT NULL,
      section TEXT,          -- Revenue, Expenses, Assets, etc.
      assigned_to INTEGER REFERENCES users(id),
      reviewed_by INTEGER REFERENCES users(id),
      status TEXT DEFAULT 'Not Started', -- Not Started, In Progress, Review, Complete
      risk_level TEXT DEFAULT 'Low',     -- Low, Medium, High
      conclusion TEXT,
      notes TEXT,
      due_date TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- ═══════════════════════════════════════════════
    -- DOCUMENTS
    -- ═══════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      working_paper_id INTEGER REFERENCES working_papers(id),
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT,
      file_size INTEGER,
      category TEXT,       -- Invoice, Statement, Contract, etc.
      ocr_text TEXT,       -- Extracted text from OCR
      uploaded_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- ═══════════════════════════════════════════════
    -- TAX COMPUTATIONS
    -- ═══════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS tax_computations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      tax_year TEXT NOT NULL,
      type TEXT NOT NULL,    -- Corporate, VAT, PAYE
      taxable_income REAL,
      tax_rate REAL,
      tax_payable REAL,
      status TEXT DEFAULT 'Draft',
      notes TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- ═══════════════════════════════════════════════
    -- AI AUDIT LOG
    -- ═══════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS ai_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      model TEXT DEFAULT 'gemini-2.0-flash',
      tokens_used INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- ═══════════════════════════════════════════════
    -- INDEXES
    -- ═══════════════════════════════════════════════
    CREATE INDEX IF NOT EXISTS idx_accounts_client ON accounts(client_id);
    CREATE INDEX IF NOT EXISTS idx_journal_entries_client ON journal_entries(client_id);
    CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
    CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON journal_lines(entry_id);
    CREATE INDEX IF NOT EXISTS idx_bank_transactions_client ON bank_transactions(client_id);
    CREATE INDEX IF NOT EXISTS idx_working_papers_client ON working_papers(client_id);
    CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);
  `);
}

function seedDemoData() {
  // Only seed if no users exist
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
  if (userCount.cnt > 0) return;

  console.log('[DB] Seeding demo data...');

  // ── Users ──
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)
  `);
  insertUser.run('admin@provident.com', 'admin123', 'Admin User', 'Administrator');
  insertUser.run('accountant@provident.com', 'acc123', 'Jane Doe', 'Senior Accountant');
  insertUser.run('auditor@provident.com', 'aud123', 'John Smith', 'Audit Manager');

  // ── Clients ──
  const insertClient = db.prepare(`
    INSERT INTO clients (name, contact_person, email, phone, city, country, type, status, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertClient.run('Acme Corporation', 'John Smith', 'john@acme.com', '+1 555-0101', 'New York', 'USA', 'Audit & Tax', 'Active', 'USD');
  insertClient.run('Beta Technologies Ltd', 'Sarah Jones', 'sarah@beta.com', '+44 20-7946-0958', 'London', 'UK', 'Bookkeeping', 'Active', 'GBP');
  insertClient.run('Gamma Industries Inc', 'Mike Chen', 'mike@gamma.com', '+1 416-555-0103', 'Toronto', 'Canada', 'Tax Only', 'Inactive', 'CAD');
  insertClient.run('Delta Consulting Group', 'Lisa Park', 'lisa@delta.com', '+61 2-8765-0104', 'Sydney', 'Australia', 'Audit & Tax', 'Active', 'AUD');
  insertClient.run('Epsilon Ventures', 'Tom Wilson', 'tom@epsilon.com', '+27 21-555-0105', 'Cape Town', 'South Africa', 'Full Service', 'Active', 'ZAR');

  // ── Chart of Accounts (for Acme Corp) ──
  const insertAcct = db.prepare(`
    INSERT INTO accounts (client_id, code, name, type, sub_type, opening_balance)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const acmeAccounts = [
    [1, '1000', 'Cash & Cash Equivalents', 'Asset', 'Current Asset', 284500],
    [1, '1100', 'Accounts Receivable', 'Asset', 'Current Asset', 156300],
    [1, '1200', 'Inventory', 'Asset', 'Current Asset', 93400],
    [1, '1500', 'Property, Plant & Equipment', 'Asset', 'Non-Current Asset', 620000],
    [1, '1510', 'Accumulated Depreciation', 'Asset', 'Non-Current Asset', -184000],
    [1, '2000', 'Accounts Payable', 'Liability', 'Current Liability', 89700],
    [1, '2100', 'Short-term Borrowings', 'Liability', 'Current Liability', 50000],
    [1, '2500', 'Long-term Debt', 'Liability', 'Non-Current Liability', 230000],
    [1, '3000', 'Share Capital', 'Equity', 'Capital', 300000],
    [1, '3100', 'Retained Earnings', 'Equity', 'Retained', 62500],
    [1, '4000', 'Sales Revenue', 'Income', 'Operating Revenue', 0],
    [1, '4100', 'Consulting Revenue', 'Income', 'Operating Revenue', 0],
    [1, '5000', 'Cost of Goods Sold', 'Expense', 'Cost of Sales', 0],
    [1, '5100', 'Salaries Expense', 'Expense', 'Operating Expense', 0],
    [1, '5200', 'Rent Expense', 'Expense', 'Operating Expense', 0],
    [1, '5300', 'Office Expenses', 'Expense', 'Operating Expense', 0],
    [1, '5400', 'Depreciation Expense', 'Expense', 'Operating Expense', 0],
    [1, '5500', 'Marketing Expense', 'Expense', 'Operating Expense', 0],
    [1, '5600', 'Utilities Expense', 'Expense', 'Operating Expense', 0],
  ];
  for (const a of acmeAccounts) insertAcct.run(...a);

  // ── Sample Journal Entries ──
  const insertJE = db.prepare(`
    INSERT INTO journal_entries (client_id, reference, date, description, status, created_by)
    VALUES (?, ?, ?, ?, 'Posted', 1)
  `);
  const insertLine = db.prepare(`
    INSERT INTO journal_lines (entry_id, account_id, debit, credit, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  const entries = [
    { ref: 'JE-1001', date: '2024-10-01', desc: 'Sales Revenue - October', lines: [[2, 91000, 0, 'Oct revenue receivable'], [11, 0, 91000, 'Oct sales']] },
    { ref: 'JE-1002', date: '2024-10-05', desc: 'Consulting Fee - Beta Ltd', lines: [[2, 8750, 0, 'Consulting receivable'], [12, 0, 8750, 'Consulting revenue']] },
    { ref: 'JE-1003', date: '2024-10-10', desc: 'Staff Salaries - October', lines: [[14, 48000, 0, 'Oct salaries'], [1, 0, 48000, 'Salary payment']] },
    { ref: 'JE-1004', date: '2024-10-15', desc: 'Rent Payment - October', lines: [[15, 5500, 0, 'Oct rent'], [1, 0, 5500, 'Rent payment']] },
    { ref: 'JE-1005', date: '2024-10-20', desc: 'Office Supplies Purchase', lines: [[16, 840, 0, 'Office supplies'], [1, 0, 840, 'Supplies payment']] },
    { ref: 'JE-1006', date: '2024-10-25', desc: 'Depreciation - Equipment', lines: [[17, 1200, 0, 'Monthly depreciation'], [5, 0, 1200, 'Acc. depreciation']] },
    { ref: 'JE-1007', date: '2024-10-28', desc: 'Marketing Campaign', lines: [[18, 12400, 0, 'Digital marketing'], [1, 0, 12400, 'Marketing payment']] },
  ];

  for (const e of entries) {
    const result = insertJE.run(1, e.ref, e.date, e.desc);
    const entryId = result.lastInsertRowid;
    for (const [acctId, debit, credit, lineDesc] of e.lines) {
      insertLine.run(entryId, acctId, debit, credit, lineDesc);
    }
  }

  // ── Working Papers ──
  const insertWP = db.prepare(`
    INSERT INTO working_papers (client_id, reference, title, section, assigned_to, status, risk_level)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertWP.run(1, 'WP-001', 'Lead Schedule — Revenue', 'Revenue', 2, 'Complete', 'Low');
  insertWP.run(1, 'WP-002', 'Bank Reconciliation', 'Cash', 3, 'In Progress', 'Medium');
  insertWP.run(1, 'WP-003', 'Debtors Confirmation', 'Receivables', 2, 'Not Started', 'High');
  insertWP.run(1, 'WP-004', 'Fixed Asset Register', 'Fixed Assets', 3, 'Complete', 'Low');
  insertWP.run(1, 'WP-005', 'Tax Computation FY2024', 'Tax', 1, 'In Progress', 'Medium');
  insertWP.run(1, 'WP-006', 'Inventory Count', 'Inventory', 2, 'Not Started', 'High');
  insertWP.run(1, 'WP-007', 'Creditors Confirmation', 'Payables', 3, 'In Progress', 'Medium');

  console.log('[DB] Demo data seeded successfully');
}

// ── Query helpers ──

function getDb() {
  return db;
}

function getClients() {
  return db.prepare('SELECT * FROM clients ORDER BY name').all();
}

function getClient(id) {
  return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
}

function createClient(data) {
  const stmt = db.prepare(`
    INSERT INTO clients (name, trading_as, registration_no, tax_number, vat_number,
      contact_person, email, phone, address, city, country, industry, type, status, currency, fiscal_year_end, notes, created_by)
    VALUES (@name, @trading_as, @registration_no, @tax_number, @vat_number,
      @contact_person, @email, @phone, @address, @city, @country, @industry, @type, @status, @currency, @fiscal_year_end, @notes, @created_by)
  `);
  return stmt.run(data);
}

function getAccounts(clientId) {
  return db.prepare('SELECT * FROM accounts WHERE client_id = ? ORDER BY code').all(clientId);
}

function getJournalEntries(clientId) {
  return db.prepare('SELECT * FROM journal_entries WHERE client_id = ? ORDER BY date DESC').all(clientId);
}

function getJournalLines(entryId) {
  return db.prepare(`
    SELECT jl.*, a.code as account_code, a.name as account_name, a.type as account_type
    FROM journal_lines jl
    JOIN accounts a ON a.id = jl.account_id
    WHERE jl.entry_id = ?
  `).all(entryId);
}

function getTrialBalance(clientId) {
  return db.prepare(`
    SELECT
      a.code, a.name, a.type, a.sub_type, a.opening_balance,
      COALESCE(SUM(jl.debit), 0) as total_debit,
      COALESCE(SUM(jl.credit), 0) as total_credit,
      a.opening_balance + COALESCE(SUM(jl.debit), 0) - COALESCE(SUM(jl.credit), 0) as closing_balance
    FROM accounts a
    LEFT JOIN journal_lines jl ON jl.account_id = a.id
    LEFT JOIN journal_entries je ON je.id = jl.entry_id AND je.status = 'Posted'
    WHERE a.client_id = ?
    GROUP BY a.id
    ORDER BY a.code
  `).all(clientId);
}

function getWorkingPapers(clientId) {
  return db.prepare(`
    SELECT wp.*, u.name as assignee_name
    FROM working_papers wp
    LEFT JOIN users u ON u.id = wp.assigned_to
    WHERE wp.client_id = ?
    ORDER BY wp.reference
  `).all(clientId);
}

function getUsers() {
  return db.prepare('SELECT id, email, name, role, is_active, created_at FROM users').all();
}

module.exports = {
  initDatabase,
  getDb,
  getClients,
  getClient,
  createClient,
  getAccounts,
  getJournalEntries,
  getJournalLines,
  getTrialBalance,
  getWorkingPapers,
  getUsers,
};

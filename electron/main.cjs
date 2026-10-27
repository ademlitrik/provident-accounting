const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

// ── React DevTools (development only, optional with graceful fallback) ────────
if (!app.isPackaged) {
  try {
    const devtools = require('electron-devtools-installer');
    const installExtension = devtools.default || devtools;
    const { REACT_DEVELOPER_TOOLS } = devtools;
    if (installExtension && REACT_DEVELOPER_TOOLS) {
      installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension: ${name}`))
        .catch((err) => console.log('DevTools extension skipped: ', err?.message || err));
    }
  } catch (_) {
    console.log('electron-devtools-installer not installed, skipping devtools injection.');
  }
}


let mainWindow;

// ── Database ─────────────────────────────────────────────────────────────────
const {
  initDatabase, getClients, getClient, createClient,
  getAccounts, getJournalEntries, getJournalLines,
  getTrialBalance, getWorkingPapers, getUsers
} = require('./database.cjs');

// ── Native C++ Hardened Security & Compliance Engine ────────────────────────
const { securityEngine } = require('./nativeSecurity.cjs');

function createApplicationMenu() {
  const template = [
    {
      label: '&File',
      submenu: [
        {
          label: '&New Engagement File',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu-navigate', '/clients')
        },
        {
          label: '&Open Engagement...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu-navigate', '/clients')
        },
        {
          label: '&Save Engagement Data',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu-action', 'save')
        },
        { type: 'separator' },
        {
          label: 'Recent &Engagements',
          submenu: [
            {
              label: '1. Acme Corporation (Pty) Ltd — FY2024',
              click: () => mainWindow?.webContents.send('menu-load-client', 1)
            },
            {
              label: '2. Epsilon Ventures (Pty) Ltd — FY2025',
              click: () => mainWindow?.webContents.send('menu-load-client', 5)
            },
            {
              label: '3. Delta Consulting Group — FY2024',
              click: () => mainWindow?.webContents.send('menu-load-client', 4)
            },
            {
              label: '4. Beta Technologies Ltd — FY2025',
              click: () => mainWindow?.webContents.send('menu-load-client', 2)
            },
            {
              label: '5. Gamma Industries Inc — FY2024',
              click: () => mainWindow?.webContents.send('menu-load-client', 3)
            },
            { type: 'separator' },
            {
              label: 'Manage All Engagement Files...',
              click: () => mainWindow?.webContents.send('menu-navigate', '/clients')
            }
          ]
        },
        {
          label: 'Recent &Documents & Working Papers',
          submenu: [
            {
              label: 'DOC-001: First National Bank Statement (WP-002)',
              click: () => mainWindow?.webContents.send('menu-navigate', '/documents')
            },
            {
              label: 'DOC-002: Acme Office Lease Agreement (WP-004)',
              click: () => mainWindow?.webContents.send('menu-navigate', '/documents')
            },
            {
              label: 'DOC-003: Tax Clearance Certificate (WP-005)',
              click: () => mainWindow?.webContents.send('menu-navigate', '/documents')
            },
            {
              label: 'DOC-004: Marketing Invoice INV-8812 (WP-001)',
              click: () => mainWindow?.webContents.send('menu-navigate', '/documents')
            },
            { type: 'separator' },
            {
              label: 'Open Document Cabinet...',
              click: () => mainWindow?.webContents.send('menu-navigate', '/documents')
            },
            {
              label: 'Open Audit PDF Studio...',
              click: () => mainWindow?.webContents.send('menu-navigate', '/unlock-pdf')
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Backup Engagement File (.pvd)...',
          click: () => mainWindow?.webContents.send('menu-action', 'backup')
        },
        {
          label: 'Restore Engagement File (.pvd)...',
          click: () => mainWindow?.webContents.send('menu-action', 'restore')
        },
        {
          label: 'Roll Forward Engagement to Next FY...',
          click: () => mainWindow?.webContents.send('menu-action', 'roll-forward')
        },
        { type: 'separator' },
        {
          label: 'Import External Package (.cwp)...',
          click: () => mainWindow?.webContents.send('menu-navigate', '/migrate')
        },
        {
          label: 'Import &Trial Balance (CSV / Excel)...',
          click: () => mainWindow?.webContents.send('menu-navigate', '/trial-balance')
        },
        {
          label: 'Export Annual &Financial Statements (PDF)...',
          click: () => mainWindow?.webContents.send('menu-navigate', '/financials')
        },
        {
          label: 'Export CIPC &iXBRL Package (.xhtml)...',
          click: () => mainWindow?.webContents.send('menu-navigate', '/cipc-ixbrl')
        },
        { type: 'separator' },
        {
          label: '&Print Schedule / Working Paper...',
          accelerator: 'CmdOrCtrl+P',
          click: () => mainWindow?.webContents.print()
        },
        { type: 'separator' },
        {
          label: 'E&xit Provident',
          accelerator: 'Alt+F4',
          click: () => app.quit()
        }
      ]
    },
    {
      label: '&Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: '&View',
      submenu: [
        {
          label: '&Overview Dashboard',
          click: () => mainWindow?.webContents.send('menu-navigate', '/dashboard')
        },
        {
          label: '&Chart of Accounts',
          click: () => mainWindow?.webContents.send('menu-navigate', '/accounts')
        },
        {
          label: '&General Ledger',
          click: () => mainWindow?.webContents.send('menu-navigate', '/ledger')
        },
        {
          label: '&Trial Balance Sheet',
          click: () => mainWindow?.webContents.send('menu-navigate', '/trial-balance')
        },
        {
          label: '&Bank Reconciliation',
          click: () => mainWindow?.webContents.send('menu-navigate', '/bank-recon')
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'toggleDevTools', label: 'Toggle Diagnostics (F12)', accelerator: 'F12' }
      ]
    },
    {
      label: '&Engagement',
      submenu: [
        {
          label: 'ISA 210 Client Acceptance & Independence',
          click: () => mainWindow?.webContents.send('menu-navigate', '/acceptance')
        },
        {
          label: 'SA Audit Scoping & PIS Calculator (Companies Act)',
          click: () => mainWindow?.webContents.send('menu-navigate', '/sa-audit')
        },
        {
          label: 'Probe MMX Lead Schedules (ISA 230)',
          click: () => mainWindow?.webContents.send('menu-navigate', '/working-papers')
        },
        {
          label: 'ISA 530 Substantive Audit Sampling',
          click: () => mainWindow?.webContents.send('menu-navigate', '/sampling')
        },
        {
          label: 'Practice Timesheet & WIP Billing',
          click: () => mainWindow?.webContents.send('menu-navigate', '/practice')
        }
      ]
    },
    {
      label: '&Statutory & Tax',
      submenu: [
        {
          label: 'Annual Financial Statements (IFRS / SME)',
          click: () => mainWindow?.webContents.send('menu-navigate', '/financials')
        },
        {
          label: 'SARS Corporate Income Tax (CIT 27%)',
          click: () => mainWindow?.webContents.send('menu-navigate', '/tax')
        },
        {
          label: 'CIPC iXBRL E-Filing Validation',
          click: () => mainWindow?.webContents.send('menu-navigate', '/cipc-ixbrl')
        },
        {
          label: 'Evidence OCR & Document Cabinet',
          click: () => mainWindow?.webContents.send('menu-navigate', '/documents')
        },
        {
          label: 'PDF Password Security Stripper',
          click: () => mainWindow?.webContents.send('menu-navigate', '/unlock-pdf')
        }
      ]
    },
    {
      label: '&Tools',
      submenu: [
        {
          label: 'External File Migration Hub (.cwp / Draftworx)',
          click: () => mainWindow?.webContents.send('menu-navigate', '/migrate')
        },
        {
          label: 'ISQM 1 Security & Compliance Center',
          click: () => mainWindow?.webContents.send('menu-navigate', '/security')
        },
        {
          label: 'Practice Preferences & Currency Settings',
          click: () => mainWindow?.webContents.send('menu-navigate', '/settings')
        }
      ]
    },
    {
      label: '&Help',
      submenu: [
        {
          label: 'Developer GitHub Repository (@ademlitrik)...',
          click: () => shell.openExternal('https://github.com/ademlitrik')
        },
        {
          label: 'Provident Financial Consultants Portal...',
          click: () => shell.openExternal('https://pfconsultants.co.za/')
        },
        { type: 'separator' },
        {
          label: 'South African Regulatory Standards (IRBA/SAICA)',
          click: () => mainWindow?.webContents.send('menu-navigate', '/sa-audit')
        },
        {
          label: 'Legacy .CWP File Import Guide',
          click: () => mainWindow?.webContents.send('menu-navigate', '/migrate')
        },
        { type: 'separator' },
        {
          label: 'About Provident & Developer Credits...',
          click: () => mainWindow?.webContents.send('menu-action', 'about')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  // Menu is built for keyboard shortcuts (accelerators) only.
  // The native menu bar is hidden — the custom React TitleBar is used instead.
  Menu.setApplicationMenu(null);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    frame: false, // Use custom React title bar instead of native Windows title bar
    autoHideMenuBar: true, // Hide native menu bar unless Alt is pressed
    title: 'Provident Accounting & Audit — South Africa Practice Suite',
    backgroundColor: '#0f172a',
    icon: path.join(__dirname, '../public/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  createApplicationMenu();

  if (isDev) {
    mainWindow.loadURL('http://localhost:5205');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // F12 toggles Developer Tools for auditing and diagnostics
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  // Initialize database with safe error handling
  try {
    initDatabase();
  } catch (err) {
    console.error('[Database Initialization Note]:', err.message);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Window Controls ──────────────────────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());

// ── File dialogs ─────────────────────────────────────────────────────────────
ipcMain.handle('dialog:open-file', async (_, options) => {
  return dialog.showOpenDialog(mainWindow, options);
});
ipcMain.handle('dialog:save-file', async (_, options) => {
  return dialog.showSaveDialog(mainWindow, options);
});

// ── Desktop / Cloud Sync & Storage Operations ────────────────────────────────
ipcMain.handle('storage:get-desktop-path', async () => {
  return app.getPath('desktop');
});

ipcMain.handle('storage:create-client-folder', async (_, { clientName, folderPath }) => {
  try {
    const sanitized = (clientName || 'Provident_Client').replace(/[/\\?%*:|"<>]/g, '_');
    const targetBase = folderPath || path.join(app.getPath('desktop'), 'Provident Clients');
    const clientDir = path.join(targetBase, sanitized);
    
    // Create standard accounting folders (Working Papers, Financials, Evidence, Tax)
    const subDirs = ['Audit Evidence & Documents', 'Working Papers', 'Trial Balance & Journals', 'Tax Schedules & CIPC'];
    if (!fs.existsSync(clientDir)) {
      fs.mkdirSync(clientDir, { recursive: true });
    }
    subDirs.forEach(sub => {
      const subPath = path.join(clientDir, sub);
      if (!fs.existsSync(subPath)) fs.mkdirSync(subPath, { recursive: true });
    });

    return { success: true, path: clientDir };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('storage:save-client-file', async (_, { clientName, fileName, fileData, subFolder, folderPath }) => {
  try {
    const sanitizedClient = (clientName || 'Provident_Client').replace(/[/\\?%*:|"<>]/g, '_');
    const targetBase = folderPath || path.join(app.getPath('desktop'), 'Provident Clients');
    const targetDir = subFolder ? path.join(targetBase, sanitizedClient, subFolder) : path.join(targetBase, sanitizedClient);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, fileName);
    // If fileData is base64 string or buffer
    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const base64Data = fileData.split(',')[1];
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    } else if (typeof fileData === 'string') {
      fs.writeFileSync(filePath, fileData, 'utf-8');
    } else {
      fs.writeFileSync(filePath, Buffer.from(fileData));
    }

    return { success: true, filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('storage:open-folder-in-explorer', async (_, folderPath) => {
  const target = folderPath || path.join(app.getPath('desktop'), 'Provident Clients');
  shell.openPath(target);
  return true;
});

// ── Database IPC handlers ────────────────────────────────────────────────────
ipcMain.handle('db:get-clients', () => getClients());
ipcMain.handle('db:get-client', (_, id) => getClient(id));
ipcMain.handle('db:create-client', (_, data) => createClient(data));
ipcMain.handle('db:get-accounts', (_, clientId) => getAccounts(clientId));
ipcMain.handle('db:get-journal-entries', (_, clientId) => getJournalEntries(clientId));
ipcMain.handle('db:get-journal-lines', (_, entryId) => getJournalLines(entryId));
ipcMain.handle('db:get-trial-balance', (_, clientId) => getTrialBalance(clientId));
ipcMain.handle('db:get-working-papers', (_, clientId) => getWorkingPapers(clientId));
ipcMain.handle('db:get-users', () => getUsers());

// ── Native Security IPC Handlers ─────────────────────────────────────────────
ipcMain.handle('security:get-posture', () => securityEngine.getSecurityPosture());
ipcMain.handle('security:encrypt', (_, text) => securityEngine.encryptField(text));
ipcMain.handle('security:decrypt', (_, payload) => securityEngine.decryptField(payload));
ipcMain.handle('security:log-audit', (_, { action, actor, details }) => securityEngine.logComplianceEvent(action, actor, details));
ipcMain.handle('security:verify-chain', () => securityEngine.verifyChainIntegrity());

// ── Native Print & Page Setup Handlers ───────────────────────────────────────
ipcMain.handle('print:page', async (_, options = {}) => {
  if (!mainWindow) return { success: false, error: 'Main window not found' };
  try {
    mainWindow.webContents.print({
      silent: false,
      printBackground: true,
      color: true,
      pageSize: 'A4',
      margins: { marginType: 'custom', top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },
      ...options
    }, (success, failureReason) => {
      console.log(`Print result: ${success}, reason: ${failureReason}`);
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('print:to-pdf', async (_, options = {}) => {
  if (!mainWindow) return { success: false, error: 'Main window not found' };
  try {
    const data = await mainWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      landscape: options.landscape || false,
      margins: { marginType: 'custom', top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },
      ...options
    });
    return { success: true, data: Array.from(data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('print:get-printers', async () => {
  if (!mainWindow) return [];
  try {
    return await mainWindow.webContents.getPrintersAsync();
  } catch (_) {
    return [];
  }
});

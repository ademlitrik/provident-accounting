const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('provident', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  onMaximizedChange: (callback) => {
    const handler = (event, isMax) => callback(isMax);
    ipcRenderer.on('window-is-maximized', handler);
    return () => ipcRenderer.removeListener('window-is-maximized', handler);
  },

  // File dialogs
  openFile: (options) => ipcRenderer.invoke('dialog:open-file', options),
  saveFile: (options) => ipcRenderer.invoke('dialog:save-file', options),

  // Desktop / Cloud & SharePoint Storage Operations
  storage: {
    getDesktopPath: () => ipcRenderer.invoke('storage:get-desktop-path'),
    createClientFolder: (data) => ipcRenderer.invoke('storage:create-client-folder', data),
    saveClientFile: (data) => ipcRenderer.invoke('storage:save-client-file', data),
    openFolder: (path) => ipcRenderer.invoke('storage:open-folder-in-explorer', path),
  },

  // Database API
  db: {
    getClients: () => ipcRenderer.invoke('db:get-clients'),
    getClient: (id) => ipcRenderer.invoke('db:get-client', id),
    createClient: (data) => ipcRenderer.invoke('db:create-client', data),
    getAccounts: (clientId) => ipcRenderer.invoke('db:get-accounts', clientId),
    getJournalEntries: (clientId) => ipcRenderer.invoke('db:get-journal-entries', clientId),
    getJournalLines: (entryId) => ipcRenderer.invoke('db:get-journal-lines', entryId),
    getTrialBalance: (clientId) => ipcRenderer.invoke('db:get-trial-balance', clientId),
    getWorkingPapers: (clientId) => ipcRenderer.invoke('db:get-working-papers', clientId),
    getUsers: () => ipcRenderer.invoke('db:get-users'),
  },

  // Native C++ Security & Cryptography API
  security: {
    getPosture: () => ipcRenderer.invoke('security:get-posture'),
    encrypt: (text) => ipcRenderer.invoke('security:encrypt', text),
    decrypt: (payload) => ipcRenderer.invoke('security:decrypt', payload),
    logAudit: (event) => ipcRenderer.invoke('security:log-audit', event),
    verifyChain: () => ipcRenderer.invoke('security:verify-chain'),
  },

  // Native Print & Page Setup Controls
  print: {
    printPage: (options) => ipcRenderer.invoke('print:page', options),
    printToPDF: (options) => ipcRenderer.invoke('print:to-pdf', options),
    getPrinters: () => ipcRenderer.invoke('print:get-printers'),
  },

  // Native Menu Listeners
  onMenuNavigate: (callback) => {
    const handler = (event, route) => callback(route);
    ipcRenderer.on('menu-navigate', handler);
    return () => ipcRenderer.removeListener('menu-navigate', handler);
  },
  onMenuAction: (callback) => {
    const handler = (event, action) => callback(action);
    ipcRenderer.on('menu-action', handler);
    return () => ipcRenderer.removeListener('menu-action', handler);
  },
  onMenuLoadClient: (callback) => {
    const handler = (event, clientId) => callback(clientId);
    ipcRenderer.on('menu-load-client', handler);
    return () => ipcRenderer.removeListener('menu-load-client', handler);
  },

  // Platform info
  platform: process.platform,
});

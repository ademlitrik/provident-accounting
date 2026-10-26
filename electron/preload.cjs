const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('provident', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // File dialogs
  openFile: (options) => ipcRenderer.invoke('dialog:open-file', options),
  saveFile: (options) => ipcRenderer.invoke('dialog:save-file', options),

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

  // Native Menu Listeners
  onMenuNavigate: (callback) => {
    ipcRenderer.on('menu-navigate', (event, route) => callback(route));
  },
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action));
  },
  onMenuLoadClient: (callback) => {
    ipcRenderer.on('menu-load-client', (event, clientId) => callback(clientId));
  },

  // Platform info
  platform: process.platform,
});

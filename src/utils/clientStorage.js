import { useAppStore } from '@/store/appStore'

/**
 * Standard client subfolders as requested in specification
 */
export const CLIENT_SUBFOLDERS = {
  UPLOADED_DOCUMENTS: 'Uploaded Documents',
  PDF_DOCUMENTS: 'PDF Documents',
  BANK_STATEMENTS: 'Bank Statements',
  WORKING_PAPERS: 'Working Papers',
  DRAFT_FINANCIAL_STATEMENTS: 'Draft Financial Statements',
  LEDGERS: 'Ledgers',
  EXCEL_FILES: 'Excel Files',
  WORD_DOCUMENTS: 'Word Documents',
  REPORTS: 'Reports',
  TAX_SCHEDULES: 'Tax Schedules & CIPC',
  AUDIT_EVIDENCE: 'Audit Evidence'
}

/**
 * Get configured storage base path or default
 */
export function getStorageBasePath() {
  const cloudSync = useAppStore.getState().cloudSync
  return cloudSync?.customStoragePath || ''
}

/**
 * Ensures the physical client folder and its subdirectories exist on disk.
 */
export async function ensureClientFolder(clientName) {
  if (!window.provident?.storage?.createClientFolder) return { success: false, reason: 'web_mode' }
  const folderPath = getStorageBasePath()
  return await window.provident.storage.createClientFolder({
    clientName: clientName || 'Provident_Client',
    folderPath: folderPath || undefined
  })
}

/**
 * Saves a file into the client's dedicated physical folder on disk.
 * Supports binary data, base64 data URLs, or UTF-8 text strings.
 */
export async function saveToClientFolder({ clientName, subFolder, fileName, fileData }) {
  if (!window.provident?.storage?.saveClientFile) {
    return { success: false, reason: 'web_mode' }
  }

  const folderPath = getStorageBasePath()
  const sanitizedClient = clientName || 'Provident_Client'

  try {
    const res = await window.provident.storage.saveClientFile({
      clientName: sanitizedClient,
      subFolder: subFolder || '',
      fileName,
      fileData,
      folderPath: folderPath || undefined
    })
    return res
  } catch (err) {
    console.error('Failed to save to client folder:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Opens the client's dedicated folder in Windows Explorer
 */
export async function openClientFolderInExplorer(clientName, subFolder = '') {
  if (!window.provident?.storage?.openFolder) return false
  const basePath = getStorageBasePath()
  // If desktop path is available
  try {
    let target = basePath
    if (!target && window.provident.storage.getDesktopPath) {
      const desktop = await window.provident.storage.getDesktopPath()
      target = `${desktop}\\Provident Clients`
    }
    if (clientName) {
      const sanitized = clientName.replace(/[/\\?%*:|"<>]/g, '_')
      target = subFolder ? `${target}\\${sanitized}\\${subFolder}` : `${target}\\${sanitized}`
    }
    await window.provident.storage.openFolder(target)
    return true
  } catch (err) {
    console.error('Failed to open client folder in Explorer:', err)
    return false
  }
}

/**
 * Standard Print Utility for Provident Accounting Suite
 * Provides native print and fallback to window.print() with custom A4 layout settings
 */
export function triggerSystemPrint(options = {}) {
  // If in Electron desktop environment, invoke native print
  if (window.provident?.print?.printPage) {
    window.provident.print.printPage(options)
    return
  }

  // Fallback to browser print dialog
  window.print()
}

export async function exportCurrentViewToPDF(filename = 'Provident_Document.pdf', options = {}) {
  if (window.provident?.print?.printToPDF) {
    try {
      const res = await window.provident.print.printToPDF(options)
      if (res.success && res.data) {
        const uint8 = new Uint8Array(res.data)
        const blob = new Blob([uint8], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return { success: true }
      }
    } catch (err) {
      console.warn('Native PDF export warning, falling back to window.print():', err)
    }
  }

  window.print()
  return { success: true }
}

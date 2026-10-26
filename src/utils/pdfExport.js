import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// Professional Color Palette
const COLORS = {
  navy: rgb(0.06, 0.09, 0.16),       // #0f172a
  indigo: rgb(0.24, 0.27, 0.54),     // #3e448b
  slateDark: rgb(0.2, 0.25, 0.33),   // #334155
  slateLight: rgb(0.4, 0.45, 0.55),  // #64748b
  border: rgb(0.85, 0.88, 0.92),     // #e2e8f0
  tableBg: rgb(0.96, 0.97, 0.98),    // #f8fafc
  white: rgb(1, 1, 1),
  emerald: rgb(0.05, 0.55, 0.35)
}

function triggerDownload(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function drawHeaderAndFooter(page, pageNum, totalPages, clientName, reportTitle, boldFont, normalFont) {
  const { width, height } = page.getSize()

  // Top Header Banner
  page.drawText('PROVIDENT FINANCIAL CONSULTANTS', {
    x: 40,
    y: height - 35,
    size: 8.5,
    font: boldFont,
    color: COLORS.navy
  })

  page.drawText('INDEPENDENT AUDIT & ASSURANCE PRACTICE', {
    x: 40,
    y: height - 46,
    size: 6.5,
    font: normalFont,
    color: COLORS.slateLight
  })

  page.drawText(`${clientName.toUpperCase()}`, {
    x: width - 260,
    y: height - 35,
    size: 8,
    font: boldFont,
    color: COLORS.navy
  })

  page.drawText(`${reportTitle} · CIPC & IRBA COMPLIANT`, {
    x: width - 260,
    y: height - 46,
    size: 6.5,
    font: normalFont,
    color: COLORS.slateLight
  })

  page.drawLine({
    start: { x: 40, y: height - 52 },
    end: { x: width - 40, y: height - 52 },
    thickness: 0.75,
    color: COLORS.border
  })

  // Bottom Footer
  page.drawLine({
    start: { x: 40, y: 35 },
    end: { x: width - 40, y: 35 },
    thickness: 0.75,
    color: COLORS.border
  })

  page.drawText('Prepared under Companies Act 71 of 2008 & International Financial Reporting Standards', {
    x: 40,
    y: 22,
    size: 6.5,
    font: normalFont,
    color: COLORS.slateLight
  })

  page.drawText(`Page ${pageNum} of ${totalPages}`, {
    x: width - 90,
    y: 22,
    size: 7,
    font: boldFont,
    color: COLORS.navy
  })
}

/**
 * 1. EXPORT ANNUAL FINANCIAL STATEMENTS PDF
 */
export async function exportFinancialStatementsPdf({ client, firm, statementsData, currency = 'ZAR (R)' }) {
  const doc = await PDFDocument.create()
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)
  const normalFont = await doc.embedFont(StandardFonts.Helvetica)

  const clientName = client?.name || 'Acme Corporation (Pty) Ltd'
  const fyEnd = client?.fyEnd || '31 December 2024'
  const currencyLabel = currency.includes('USD') ? 'USD ($)' : 'ZAR (R)'

  // ── PAGE 1: COVER & PRACTICE DETAILS ──────────────────────
  const p1 = doc.addPage([595.28, 841.89])
  const { width: w1, height: h1 } = p1.getSize()

  // Decorative border
  p1.drawRectangle({
    x: 35,
    y: 35,
    width: w1 - 70,
    height: h1 - 70,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    color: COLORS.white
  })

  p1.drawText('ANNUAL FINANCIAL STATEMENTS', {
    x: 55,
    y: h1 - 120,
    size: 22,
    font: boldFont,
    color: COLORS.navy
  })

  p1.drawText(`FOR THE FINANCIAL YEAR ENDED ${fyEnd.toUpperCase()}`, {
    x: 55,
    y: h1 - 145,
    size: 11,
    font: boldFont,
    color: COLORS.indigo
  })

  p1.drawLine({
    start: { x: 55, y: h1 - 160 },
    end: { x: w1 - 55, y: h1 - 160 },
    thickness: 2,
    color: COLORS.indigo
  })

  // Entity Details Box
  const infoX = 55
  let curY = h1 - 210

  const details = [
    ['Entity Legal Name:', clientName],
    ['Registration Number:', client?.regNo || '2018/489102/07'],
    ['Country of Incorporation:', 'Republic of South Africa'],
    ['Accounting Reporting Framework:', 'IFRS for SMEs (International Financial Reporting Standards)'],
    ['Nature of Business & Activities:', 'Commercial Operations, Technology Advisory & Manufacturing'],
    ['Independent Assurance Practitioner:', firm?.name || 'Provident Financial Consultants'],
    ['IRBA Practice Registration Number:', firm?.irbaNumber || '904812'],
    ['Authorised Lead Engagement Partner:', 'Alexander Wright (CA(SA) / RA)']
  ]

  p1.drawRectangle({
    x: 50,
    y: curY - 220,
    width: w1 - 100,
    height: 240,
    color: COLORS.tableBg,
    borderColor: COLORS.border,
    borderWidth: 1
  })

  details.forEach(([lbl, val]) => {
    p1.drawText(lbl, { x: infoX + 10, y: curY, size: 8.5, font: boldFont, color: COLORS.navy })
    p1.drawText(val, { x: infoX + 180, y: curY, size: 8.5, font: normalFont, color: COLORS.slateDark })
    curY -= 25
  })

  // Auditor & Directors Approval Block
  const sigY = 160
  p1.drawText('DIRECTORS’ STATEMENT OF RESPONSIBILITY AND APPROVAL', {
    x: 55,
    y: sigY + 50,
    size: 9,
    font: boldFont,
    color: COLORS.navy
  })

  p1.drawText('The annual financial statements set out on pages 2 to 4 have been compiled in accordance with the\nCompanies Act 71 of 2008 and IFRS for SMEs, and are hereby approved by the Board of Directors.', {
    x: 55,
    y: sigY + 30,
    size: 7.5,
    font: normalFont,
    color: COLORS.slateDark,
    lineHeight: 11
  })

  p1.drawLine({ start: { x: 55, y: sigY - 20 }, end: { x: 230, y: sigY - 20 }, thickness: 1, color: COLORS.navy })
  p1.drawText('Director / Managing Member', { x: 55, y: sigY - 32, size: 7.5, font: boldFont, color: COLORS.navy })

  p1.drawLine({ start: { x: w1 - 230, y: sigY - 20 }, end: { x: w1 - 55, y: sigY - 20 }, thickness: 1, color: COLORS.navy })
  p1.drawText('Independent Auditor (RA / CA(SA))', { x: w1 - 230, y: sigY - 32, size: 7.5, font: boldFont, color: COLORS.navy })

  drawHeaderAndFooter(p1, 1, 4, clientName, 'Financial Statements', boldFont, normalFont)

  // ── PAGE 2: STATEMENT OF FINANCIAL POSITION (BALANCE SHEET) ─
  const p2 = doc.addPage([595.28, 841.89])
  drawHeaderAndFooter(p2, 2, 4, clientName, 'Statement of Financial Position', boldFont, normalFont)

  let y2 = 750
  p2.drawText('STATEMENT OF FINANCIAL POSITION (BALANCE SHEET)', { x: 40, y: y2, size: 13, font: boldFont, color: COLORS.navy })
  p2.drawText(`As at ${fyEnd} · Figures in ${currencyLabel}`, { x: 40, y: y2 - 14, size: 8, font: normalFont, color: COLORS.slateLight })

  y2 -= 40

  // Table Header
  p2.drawRectangle({ x: 40, y: y2 - 6, width: 515, height: 20, color: COLORS.navy })
  p2.drawText('Accounting Item & Classification', { x: 45, y: y2, size: 8, font: boldFont, color: COLORS.white })
  p2.drawText('Note', { x: 330, y: y2, size: 8, font: boldFont, color: COLORS.white })
  p2.drawText('2024', { x: 420, y: y2, size: 8, font: boldFont, color: COLORS.white })
  p2.drawText('2023', { x: 490, y: y2, size: 8, font: boldFont, color: COLORS.white })

  y2 -= 22

  const balanceSheetRows = [
    { type: 'sec', name: 'Assets', note: '', c24: '', c23: '' },
    { type: 'sub', name: 'Non-Current Assets', note: '', c24: '', c23: '' },
    { type: 'row', name: 'Property, plant and equipment (Gross)', note: '3', c24: '620,000', c23: '580,000' },
    { type: 'row', name: 'Accumulated depreciation - plant', note: '3', c24: '(184,000)', c23: '(150,000)' },
    { type: 'row', name: 'Intangible software & IP assets', note: '4', c24: '45,000', c23: '45,000' },
    { type: 'subtot', name: 'Total Non-Current Assets', note: '', c24: '481,000', c23: '475,000' },
    { type: 'sub', name: 'Current Assets', note: '', c24: '', c23: '' },
    { type: 'row', name: 'Merchandise inventories at cost', note: '5', c24: '93,400', c23: '88,000' },
    { type: 'row', name: 'Trade and other receivables', note: '6', c24: '156,300', c23: '142,000' },
    { type: 'row', name: 'Cash and cash equivalents', note: '7', c24: '284,500', c23: '215,000' },
    { type: 'subtot', name: 'Total Current Assets', note: '', c24: '534,200', c23: '445,000' },
    { type: 'tot', name: 'TOTAL ASSETS', note: '', c24: '1,015,200', c23: '920,000' },
    { type: 'sec', name: 'Equity and Liabilities', note: '', c24: '', c23: '' },
    { type: 'sub', name: 'Equity & Reserves', note: '', c24: '', c23: '' },
    { type: 'row', name: 'Ordinary share capital (stated capital)', note: '8', c24: '300,000', c23: '300,000' },
    { type: 'row', name: 'Retained earnings (accumulated profits)', note: '9', c24: '348,500', c23: '194,000' },
    { type: 'subtot', name: 'Total Equity', note: '', c24: '648,500', c23: '494,000' },
    { type: 'sub', name: 'Non-Current Liabilities', note: '', c24: '', c23: '' },
    { type: 'row', name: 'Long-term commercial bank facilities', note: '10', c24: '230,000', c23: '270,000' },
    { type: 'row', name: 'Deferred tax liabilities', note: '11', c24: '18,000', c23: '15,000' },
    { type: 'sub', name: 'Current Liabilities', note: '', c24: '', c23: '' },
    { type: 'row', name: 'Trade and other payables', note: '12', c24: '89,700', c23: '74,000' },
    { type: 'row', name: 'Short-term working capital borrowings', note: '10', c24: '50,000', c23: '65,000' },
    { type: 'tot', name: 'TOTAL EQUITY AND LIABILITIES', note: '', c24: '1,015,200', c23: '920,000' }
  ]

  balanceSheetRows.forEach(row => {
    if (row.type === 'sec') {
      p2.drawRectangle({ x: 40, y: y2 - 3, width: 515, height: 16, color: COLORS.tableBg })
      p2.drawText(row.name.toUpperCase(), { x: 45, y: y2 + 1, size: 8, font: boldFont, color: COLORS.indigo })
      y2 -= 18
    } else if (row.type === 'sub') {
      p2.drawText(row.name, { x: 45, y: y2, size: 7.5, font: boldFont, color: COLORS.navy })
      y2 -= 14
    } else if (row.type === 'row') {
      p2.drawText(row.name, { x: 55, y: y2, size: 7.5, font: normalFont, color: COLORS.slateDark })
      p2.drawText(row.note, { x: 335, y: y2, size: 7.5, font: normalFont, color: COLORS.slateLight })
      p2.drawText(row.c24, { x: 420, y: y2, size: 7.5, font: normalFont, color: COLORS.navy })
      p2.drawText(row.c23, { x: 490, y: y2, size: 7.5, font: normalFont, color: COLORS.slateLight })
      y2 -= 13
    } else if (row.type === 'subtot') {
      p2.drawLine({ start: { x: 410, y: y2 + 10 }, end: { x: 540, y: y2 + 10 }, thickness: 0.5, color: COLORS.border })
      p2.drawText(row.name, { x: 50, y: y2, size: 7.5, font: boldFont, color: COLORS.navy })
      p2.drawText(row.c24, { x: 420, y: y2, size: 7.5, font: boldFont, color: COLORS.navy })
      p2.drawText(row.c23, { x: 490, y: y2, size: 7.5, font: boldFont, color: COLORS.slateDark })
      y2 -= 16
    } else if (row.type === 'tot') {
      p2.drawLine({ start: { x: 40, y: y2 + 10 }, end: { x: 555, y: y2 + 10 }, thickness: 0.75, color: COLORS.navy })
      p2.drawText(row.name, { x: 45, y: y2, size: 8, font: boldFont, color: COLORS.navy })
      p2.drawText(row.c24, { x: 420, y: y2, size: 8, font: boldFont, color: COLORS.navy })
      p2.drawText(row.c23, { x: 490, y: y2, size: 8, font: boldFont, color: COLORS.navy })
      // Double underline
      p2.drawLine({ start: { x: 410, y: y2 - 3 }, end: { x: 550, y: y2 - 3 }, thickness: 0.75, color: COLORS.navy })
      p2.drawLine({ start: { x: 410, y: y2 - 5 }, end: { x: 550, y: y2 - 5 }, thickness: 0.75, color: COLORS.navy })
      y2 -= 20
    }
  })

  // ── PAGE 3: STATEMENT OF COMPREHENSIVE INCOME (P&L) ────────
  const p3 = doc.addPage([595.28, 841.89])
  drawHeaderAndFooter(p3, 3, 4, clientName, 'Statement of Comprehensive Income', boldFont, normalFont)

  let y3 = 750
  p3.drawText('STATEMENT OF COMPREHENSIVE INCOME (PROFIT & LOSS)', { x: 40, y: y3, size: 13, font: boldFont, color: COLORS.navy })
  p3.drawText(`For the year ended ${fyEnd} · Figures in ${currencyLabel}`, { x: 40, y: y3 - 14, size: 8, font: normalFont, color: COLORS.slateLight })

  y3 -= 40

  p3.drawRectangle({ x: 40, y: y3 - 6, width: 515, height: 20, color: COLORS.navy })
  p3.drawText('Accounting Item & Description', { x: 45, y: y3, size: 8, font: boldFont, color: COLORS.white })
  p3.drawText('Note', { x: 330, y: y3, size: 8, font: boldFont, color: COLORS.white })
  p3.drawText('2024', { x: 420, y: y3, size: 8, font: boldFont, color: COLORS.white })
  p3.drawText('2023', { x: 490, y: y3, size: 8, font: boldFont, color: COLORS.white })

  y3 -= 22

  const pnlRows = [
    ['Revenue from contracts with customers', '13', '741,500', '659,000', false],
    ['Cost of sales & direct merchandise costs', '14', '(312,000)', '(285,000)', false],
    ['Gross Profit', '', '429,500', '374,000', true],
    ['Salaries, wages and employee benefits', '15', '(144,000)', '(130,000)', false],
    ['Premises lease and rental costs', '16', '(33,000)', '(30,000)', false],
    ['Depreciation and amortization expense', '3', '(14,400)', '(12,000)', false],
    ['Digital marketing & brand development', '17', '(12,400)', '(9,800)', false],
    ['Administrative, municipal & telecoms costs', '18', '(12,700)', '(11,200)', false],
    ['Total Operating Expenses', '', '(216,500)', '(193,000)', true],
    ['Operating Profit before Net Finance Costs', '', '213,000', '181,000', true],
    ['Finance income / bank interest earned', '19', '8,400', '6,200', false],
    ['Finance costs & bank loan servicing', '19', '(18,500)', '(22,000)', false],
    ['Profit before Corporate Tax', '', '202,900', '165,200', true],
    ['Income Tax Expense (SARS CIT 27%)', '20', '(48,400)', '(38,000)', false],
    ['TOTAL COMPREHENSIVE INCOME FOR THE YEAR', '', '154,500', '127,200', true]
  ]

  pnlRows.forEach(([desc, note, c24, c23, isTotal]) => {
    if (isTotal) {
      p3.drawLine({ start: { x: 40, y: y3 + 10 }, end: { x: 555, y: y3 + 10 }, thickness: 0.5, color: COLORS.border })
      p3.drawText(desc, { x: 45, y: y3, size: 8, font: boldFont, color: COLORS.navy })
      p3.drawText(c24, { x: 420, y: y3, size: 8, font: boldFont, color: COLORS.navy })
      p3.drawText(c23, { x: 490, y: y3, size: 8, font: boldFont, color: COLORS.navy })
      y3 -= 18
    } else {
      p3.drawText(desc, { x: 55, y: y3, size: 7.5, font: normalFont, color: COLORS.slateDark })
      p3.drawText(note, { x: 335, y: y3, size: 7.5, font: normalFont, color: COLORS.slateLight })
      p3.drawText(c24, { x: 420, y: y3, size: 7.5, font: normalFont, color: COLORS.navy })
      p3.drawText(c23, { x: 490, y: y3, size: 7.5, font: normalFont, color: COLORS.slateLight })
      y3 -= 15
    }
  })

  // ── PAGE 4: STATEMENT OF CASH FLOWS & AUDIT REPORT ──────────
  const p4 = doc.addPage([595.28, 841.89])
  drawHeaderAndFooter(p4, 4, 4, clientName, 'Statement of Cash Flows', boldFont, normalFont)

  let y4 = 750
  p4.drawText('STATEMENT OF CASH FLOWS', { x: 40, y: y4, size: 13, font: boldFont, color: COLORS.navy })
  p4.drawText(`For the year ended ${fyEnd} · Direct Method`, { x: 40, y: y4 - 14, size: 8, font: normalFont, color: COLORS.slateLight })

  y4 -= 35

  const cfItems = [
    ['Cash flows from operating activities', '', ''],
    ['Operating profit before working capital changes', '213,000', false],
    ['Adjustments for non-cash depreciation', '14,400', false],
    ['Movement in trade debtors and receivables', '(14,300)', false],
    ['Movement in inventories', '(5,400)', false],
    ['Movement in trade creditors and payables', '15,700', false],
    ['Direct taxation paid to SARS', '(42,000)', false],
    ['Net cash generated from operating activities', '181,400', true],
    ['Cash flows from investing activities', '', ''],
    ['Additions to property, plant and machinery', '(40,000)', false],
    ['Proceeds from disposal of redundant assets', '8,500', false],
    ['Net cash utilized in investing activities', '(31,500)', true],
    ['Cash flows from financing activities', '', ''],
    ['Repayment of commercial bank borrowings', '(35,000)', false],
    ['Dividends distributed to shareholders', '(45,400)', false],
    ['Net cash utilized in financing activities', '(80,400)', true],
    ['Net increase in cash and cash equivalents', '69,500', true],
    ['Cash and cash equivalents at beginning of year', '215,000', false],
    ['Cash and cash equivalents at end of year', '284,500', true]
  ]

  cfItems.forEach(([desc, amt, isTot]) => {
    if (!amt) {
      p4.drawText(desc.toUpperCase(), { x: 45, y: y4, size: 8, font: boldFont, color: COLORS.indigo })
      y4 -= 14
    } else if (isTot) {
      p4.drawLine({ start: { x: 410, y: y4 + 10 }, end: { x: 540, y: y4 + 10 }, thickness: 0.5, color: COLORS.border })
      p4.drawText(desc, { x: 45, y: y4, size: 7.5, font: boldFont, color: COLORS.navy })
      p4.drawText(amt, { x: 460, y: y4, size: 7.5, font: boldFont, color: COLORS.navy })
      y4 -= 16
    } else {
      p4.drawText(desc, { x: 55, y: y4, size: 7.5, font: normalFont, color: COLORS.slateDark })
      p4.drawText(amt, { x: 460, y: y4, size: 7.5, font: normalFont, color: COLORS.navy })
      y4 -= 13
    }
  })

  // Audit Partner Opinion Seal
  y4 -= 20
  p4.drawRectangle({
    x: 40,
    y: y4 - 70,
    width: 515,
    height: 75,
    color: COLORS.tableBg,
    borderColor: COLORS.indigo,
    borderWidth: 1
  })

  p4.drawText('INDEPENDENT AUDITOR’S REPORT SUMMARY & OPINION', { x: 50, y: y4 - 15, size: 8.5, font: boldFont, color: COLORS.navy })
  p4.drawText('In our opinion, the financial statements present fairly, in all material respects, the financial position\nof the entity as at 31 December 2024, and its financial performance and cash flows for the year then ended\nin accordance with the International Financial Reporting Standard for Small and Medium-sized Entities.', {
    x: 50,
    y: y4 - 30,
    size: 7,
    font: normalFont,
    color: COLORS.slateDark,
    lineHeight: 10
  })

  p4.drawText(`Practice: Provident Financial Consultants · IRBA Practice #${firm?.irbaNumber || '904812'} · Date: ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: y4 - 60,
    size: 7,
    font: boldFont,
    color: COLORS.indigo
  })

  const pdfBytes = await doc.save()
  const outName = `${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_Annual_Financial_Statements_FY2024.pdf`
  triggerDownload(pdfBytes, outName)
  return outName
}

/**
 * 2. EXPORT TRIAL BALANCE PDF
 */
export async function exportTrialBalancePdf({ client, firm, accounts, currency = 'ZAR (R)' }) {
  const doc = await PDFDocument.create()
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)
  const normalFont = await doc.embedFont(StandardFonts.Helvetica)

  const clientName = client?.name || 'Acme Corporation (Pty) Ltd'
  const fyEnd = client?.fyEnd || '31 December 2024'

  const p = doc.addPage([595.28, 841.89])
  drawHeaderAndFooter(p, 1, 1, clientName, 'Trial Balance Sheet', boldFont, normalFont)

  let y = 750
  p.drawText('MASTER AUDIT TRIAL BALANCE SHEET', { x: 40, y, size: 14, font: boldFont, color: COLORS.navy })
  p.drawText(`Client: ${clientName} · Financial Year: ${fyEnd} · Currency: ${currency}`, { x: 40, y: y - 14, size: 8, font: normalFont, color: COLORS.slateLight })

  y -= 40

  // Table header
  p.drawRectangle({ x: 40, y: y - 6, width: 515, height: 20, color: COLORS.navy })
  p.drawText('Code', { x: 45, y, size: 8, font: boldFont, color: COLORS.white })
  p.drawText('Account Name & Description', { x: 85, y, size: 8, font: boldFont, color: COLORS.white })
  p.drawText('Type', { x: 280, y, size: 8, font: boldFont, color: COLORS.white })
  p.drawText('Debit (Dr)', { x: 380, y, size: 8, font: boldFont, color: COLORS.white })
  p.drawText('Credit (Cr)', { x: 470, y, size: 8, font: boldFont, color: COLORS.white })

  y -= 20

  let totalDebit = 0
  let totalCredit = 0

  const items = accounts || [
    { code: '1000', name: 'Cash and Cash Equivalents', type: 'Asset', balance: 284500 },
    { code: '1100', name: 'Trade and Other Receivables', type: 'Asset', balance: 156300 },
    { code: '1200', name: 'Merchandise Inventory at Cost', type: 'Asset', balance: 93400 },
    { code: '1500', name: 'Property, Plant & Equipment (Gross)', type: 'Asset', balance: 620000 },
    { code: '1510', name: 'Accumulated Depreciation - Plant', type: 'Asset', balance: -184000 },
    { code: '2000', name: 'Trade and Other Payables', type: 'Liability', balance: -89700 },
    { code: '2100', name: 'Short-term Borrowings', type: 'Liability', balance: -50000 },
    { code: '2500', name: 'Long-term Bank Facilities', type: 'Liability', balance: -230000 },
    { code: '3000', name: 'Ordinary Share Capital', type: 'Equity', balance: -300000 },
    { code: '3100', name: 'Retained Earnings (Accumulated Reserves)', type: 'Equity', balance: -62500 },
    { code: '4000', name: 'Operating Sales Revenue', type: 'Income', balance: -654000 },
    { code: '4100', name: 'Professional Advisory Fee Income', type: 'Income', balance: -87500 },
    { code: '5000', name: 'Direct Cost of Merchandise Sold', type: 'Expense', balance: 312000 },
    { code: '5100', name: 'Salaries, Wages & Employee Benefits', type: 'Expense', balance: 144000 },
    { code: '5200', name: 'Premises Lease Rentals', type: 'Expense', balance: 33000 },
    { code: '5300', name: 'Administrative & Operating Expenses', type: 'Expense', balance: 8500 },
    { code: '5400', name: 'Depreciation & Amortization Expense', type: 'Expense', balance: 14400 },
    { code: '5500', name: 'Digital Advertising & Marketing', type: 'Expense', balance: 12400 },
    { code: '5600', name: 'Municipal Utilities, Power & Telecoms', type: 'Expense', balance: 4200 },
  ]

  items.forEach((acc, i) => {
    const isDr = acc.balance > 0
    const drStr = isDr ? acc.balance.toLocaleString() : '—'
    const crStr = !isDr ? Math.abs(acc.balance).toLocaleString() : '—'

    if (isDr) totalDebit += acc.balance
    else totalCredit += Math.abs(acc.balance)

    if (i % 2 === 0) {
      p.drawRectangle({ x: 40, y: y - 3, width: 515, height: 14, color: COLORS.tableBg })
    }

    p.drawText(acc.code, { x: 45, y, size: 7.5, font: boldFont, color: COLORS.navy })
    p.drawText(acc.name, { x: 85, y, size: 7.5, font: normalFont, color: COLORS.slateDark })
    p.drawText(acc.type, { x: 280, y, size: 7, font: normalFont, color: COLORS.slateLight })
    p.drawText(drStr, { x: 380, y, size: 7.5, font: normalFont, color: COLORS.navy })
    p.drawText(crStr, { x: 470, y, size: 7.5, font: normalFont, color: COLORS.navy })

    y -= 15
  })

  // Totals Line
  y -= 5
  p.drawLine({ start: { x: 40, y: y + 10 }, end: { x: 555, y: y + 10 }, thickness: 1, color: COLORS.navy })
  p.drawText('TRIAL BALANCE TOTALS & BALANCE CHECK', { x: 45, y, size: 8, font: boldFont, color: COLORS.navy })
  p.drawText(totalDebit.toLocaleString(), { x: 380, y, size: 8, font: boldFont, color: COLORS.navy })
  p.drawText(totalCredit.toLocaleString(), { x: 470, y, size: 8, font: boldFont, color: COLORS.navy })

  p.drawLine({ start: { x: 370, y: y - 4 }, end: { x: 555, y: y - 4 }, thickness: 0.75, color: COLORS.navy })
  p.drawLine({ start: { x: 370, y: y - 6 }, end: { x: 555, y: y - 6 }, thickness: 0.75, color: COLORS.navy })

  // Parity badge
  const variance = Math.abs(totalDebit - totalCredit)
  p.drawText(variance === 0 ? '✓ PARITY VERIFIED: DEBITS EQUAL CREDITS' : `⚠ VARIANCE DETECTED: R ${variance}`, {
    x: 45,
    y: y - 25,
    size: 7.5,
    font: boldFont,
    color: variance === 0 ? COLORS.emerald : rgb(0.8, 0.1, 0.1)
  })

  const pdfBytes = await doc.save()
  const outName = `${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_Trial_Balance.pdf`
  triggerDownload(pdfBytes, outName)
  return outName
}

/**
 * 3. EXPORT SARS CORPORATE TAX (CIT 27%) PDF
 */
export async function exportTaxComputationPdf({ client, firm, taxData, currency = 'ZAR (R)' }) {
  const doc = await PDFDocument.create()
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold)
  const normalFont = await doc.embedFont(StandardFonts.Helvetica)

  const clientName = client?.name || 'Acme Corporation (Pty) Ltd'

  const p = doc.addPage([595.28, 841.89])
  drawHeaderAndFooter(p, 1, 1, clientName, 'SARS CIT 27% Tax Computation', boldFont, normalFont)

  let y = 750
  p.drawText('SARS CORPORATE INCOME TAX COMPUTATION (CIT 27%)', { x: 40, y, size: 13, font: boldFont, color: COLORS.navy })
  p.drawText(`Tax Year of Assessment: 2024 · SARS Income Tax Act No. 58 of 1962`, { x: 40, y: y - 14, size: 8, font: normalFont, color: COLORS.slateLight })

  y -= 40

  const taxRows = [
    ['Net Accounting Profit before Tax (from AFS)', '', '202,900', true],
    ['Add: Non-deductible accounting depreciation (s 11(e) replacement)', '+', '14,400', false],
    ['Add: Penalties, fines and non-allowable interest', '+', '3,500', false],
    ['Add: Entertainment and client hospitality expenditure', '+', '4,200', false],
    ['Less: SARS Section 11(e) Wear and Tear tax allowances', '-', '(18,000)', false],
    ['Less: Section 12C Manufacturing assets accelerated wear & tear', '-', '(12,500)', false],
    ['Less: Dividend income exempt under Section 10(1)(k)', '-', '(4,500)', false],
    ['Taxable Income / (Assessed Loss) for the Year', '', '190,000', true],
    ['Standard Corporate Income Tax Rate applied', '27.0%', '27.0%', false],
    ['GROSS NORMAL TAX LIABILITY FOR THE YEAR (27%)', '', '51,300', true],
    ['Less: First Provisional Tax Payment (IRP6 Period 1)', '-', '(22,000)', false],
    ['Less: Second Provisional Tax Payment (IRP6 Period 2)', '-', '(20,000)', false],
    ['NET TAX PAYABLE / (REFUNDABLE) TO SARS (IT14)', '', '9,300', true]
  ]

  p.drawRectangle({ x: 40, y: y - 6, width: 515, height: 20, color: COLORS.navy })
  p.drawText('Tax Computation Line Item & Statutory Reference', { x: 45, y, size: 8, font: boldFont, color: COLORS.white })
  p.drawText('Adjustment', { x: 380, y, size: 8, font: boldFont, color: COLORS.white })
  p.drawText('Amount (ZAR)', { x: 460, y, size: 8, font: boldFont, color: COLORS.white })

  y -= 22

  taxRows.forEach(([desc, adj, amt, isBold]) => {
    if (isBold) {
      p.drawLine({ start: { x: 40, y: y + 10 }, end: { x: 555, y: y + 10 }, thickness: 0.5, color: COLORS.border })
      p.drawText(desc, { x: 45, y, size: 8, font: boldFont, color: COLORS.navy })
      p.drawText(adj, { x: 385, y, size: 8, font: boldFont, color: COLORS.navy })
      p.drawText(amt, { x: 465, y, size: 8, font: boldFont, color: COLORS.navy })
      y -= 17
    } else {
      p.drawText(desc, { x: 55, y, size: 7.5, font: normalFont, color: COLORS.slateDark })
      p.drawText(adj, { x: 385, y, size: 7.5, font: normalFont, color: COLORS.slateLight })
      p.drawText(amt, { x: 465, y, size: 7.5, font: normalFont, color: COLORS.navy })
      y -= 14
    }
  })

  // Sign off
  y -= 25
  p.drawText(`SARS Tax Practitioner: ${firm?.name || 'Provident Financial Consultants'} · PR-009182`, {
    x: 45,
    y,
    size: 7.5,
    font: boldFont,
    color: COLORS.indigo
  })

  const pdfBytes = await doc.save()
  const outName = `${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_SARS_Tax_Computation_2024.pdf`
  triggerDownload(pdfBytes, outName)
  return outName
}

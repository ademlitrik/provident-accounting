/**
 * South African Companies Act No. 71 of 2008
 * Public Interest Score (PIS) & Engagement Determination Engine
 * Under Companies Regulation 26:
 * - 1 point for every employee (average during financial year)
 * - 1 point for every R1m of third-party liabilities at financial year end
 * - 1 point for every R1m of turnover (or gross revenue)
 * - 1 point for every individual with a direct/indirect beneficial interest (shareholders/beneficiaries)
 */

export function calculatePublicInterestScore({
  avgEmployees = 0,
  thirdPartyLiabilities = 0,
  turnover = 0,
  beneficialHolders = 0,
  isPublicOrStateOwned = false,
  isHoldingFiduciaryAssets = false,
  fiduciaryAssetValue = 0,
  isInternallyCompiled = false
}) {
  // Point calculations
  const employeePoints = Math.floor(avgEmployees)
  const liabilityPoints = Math.floor(thirdPartyLiabilities / 1000000)
  const turnoverPoints = Math.floor(turnover / 1000000)
  const holderPoints = Math.floor(beneficialHolders)

  const totalScore = employeePoints + liabilityPoints + turnoverPoints + holderPoints

  // Engagement determination rules
  let requiredService = 'Compilation'
  let reportingFramework = 'IFRS for SMEs'
  let requiresAuditReason = ''

  if (isPublicOrStateOwned) {
    requiredService = 'Statutory Audit'
    reportingFramework = 'Full IFRS'
    requiresAuditReason = 'Public Company (Ltd) or State-Owned Company (SOC) - Mandatory Audit (Section 30(2)(a))'
  } else if (isHoldingFiduciaryAssets && fiduciaryAssetValue > 5000000) {
    requiredService = 'Statutory Audit'
    reportingFramework = 'Full IFRS or IFRS for SMEs'
    requiresAuditReason = 'Holds assets in fiduciary capacity exceeding R5 million (Regulation 28(2)(b))'
  } else if (totalScore >= 350) {
    requiredService = 'Statutory Audit'
    reportingFramework = 'Full IFRS or IFRS for SMEs'
    requiresAuditReason = 'PIS Score >= 350 - Mandatory Audit regardless of compiler (Regulation 28(2)(c)(i))'
  } else if (totalScore >= 100 && totalScore < 350) {
    if (isInternallyCompiled) {
      requiredService = 'Statutory Audit'
      reportingFramework = 'IFRS for SMEs or SA GAAP'
      requiresAuditReason = 'PIS between 100 and 349, AND financial statements compiled internally (Regulation 28(2)(c)(ii))'
    } else {
      requiredService = 'Independent Review (by CA/RA)'
      reportingFramework = 'IFRS for SMEs'
      requiresAuditReason = 'PIS between 100 and 349, compiled independently - Independent Review required'
    }
  } else {
    // Score < 100
    if (isInternallyCompiled) {
      requiredService = 'Independent Review (by Registered Accounting Officer / CA)'
      reportingFramework = 'Financial Reporting Standard for SMEs'
      requiresAuditReason = 'PIS < 100, internally compiled - Independent Review required (Regulation 29)'
    } else {
      requiredService = 'Compilation / Accounting Officer Report'
      reportingFramework = 'Financial Reporting Standard for Micro Entities or Entity Specific'
      requiresAuditReason = 'PIS < 100, independently compiled - Exempt from Audit and Review'
    }
  }

  return {
    totalScore,
    breakdown: {
      employeePoints,
      liabilityPoints,
      turnoverPoints,
      holderPoints
    },
    requiredService,
    reportingFramework,
    requiresAuditReason,
    cipcStandard: totalScore >= 350 ? 'CIPC iXBRL Full AFS Filing' : 'CIPC Financial Accountability Supplement (FAS) or iXBRL'
  }
}

/**
 * ISA 320 Materiality Engine
 */
export function calculateAuditMateriality({
  turnover = 0,
  preTaxProfit = 0,
  totalAssets = 0,
  equity = 0,
  benchmarkType = 'Turnover', // 'Turnover', 'PreTaxProfit', 'TotalAssets', 'Equity'
  benchmarkPercentage = 1.0, // 0.5% - 2% for Turnover, 5% - 10% for Profit
  performanceMaterialityPct = 75, // 50% - 75%
  clearlyTrivialPct = 5 // 3% - 5% of Overall Materiality
}) {
  let benchmarkValue = turnover
  if (benchmarkType === 'PreTaxProfit') benchmarkValue = preTaxProfit
  if (benchmarkType === 'TotalAssets') benchmarkValue = totalAssets
  if (benchmarkType === 'Equity') benchmarkValue = equity

  const overallMateriality = Math.round(benchmarkValue * (benchmarkPercentage / 100))
  const performanceMateriality = Math.round(overallMateriality * (performanceMaterialityPct / 100))
  const clearlyTrivialThreshold = Math.round(overallMateriality * (clearlyTrivialPct / 100))

  return {
    benchmarkType,
    benchmarkValue,
    benchmarkPercentage,
    overallMateriality,
    performanceMateriality,
    clearlyTrivialThreshold,
    scopeSummary: `Procedures designed to detect misstatements exceeding R ${performanceMateriality.toLocaleString()}. Errors below R ${clearlyTrivialThreshold.toLocaleString()} considered clearly trivial (ISA 450).`
  }
}

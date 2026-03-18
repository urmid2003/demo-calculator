// Corporate (In-house HR) cost calculations
// Based on India Talent Report 2026 — Corporate avg ₹71,800/hire

export const CORPORATE_CONSTANTS = {
  // Benchmark per-hire components (corporate in-house, mid-level ₹8L CTC)
  DEFAULT_COST_PER_HIRE: 71800,

  // Component-level defaults (per hire)
  INTERNAL_TA_COST_PER_HIRE: 22000,        // C1 — Internal TA pro-rata
  JOB_PORTAL_COST_PER_HIRE: 12000,         // C2 — LinkedIn/Naukri premium
  BGV_COST_PER_HIRE: 1800,                 // C3 — Background verification
  ASSESSMENT_TOOLS_PER_HIRE: 7500,         // C4 — Enterprise ATS + tools
  ONBOARDING_COST_PER_HIRE: 16000,         // C5 — Structured L&D
  INTERNAL_PRODUCTIVITY_PER_HIRE: 12500,   // C6 — Manager hours

  // Skillbrew costs
  SKILLBREW_ASSESSMENT_PER_CANDIDATE: 30,
  SKILLBREW_INTERVIEW_PER_CANDIDATE: 70,
  SKILLBREW_JOB_POSTING_COST: 0,           // Free
  SKILLBREW_RESUME_SHORTLIST_COST: 0,      // Free

  // Typical candidates screened per role
  CANDIDATES_PER_ROLE: 50,

  // Interview funnel: ~20% of screened candidates reach interview stage
  INTERVIEW_FUNNEL_RATE: 0.2,

  // Skillbrew reduces internal productivity cost by 60% (automation)
  PRODUCTIVITY_REDUCTION: 0.6,

  // Work constants
  WORKING_DAYS_MONTH: 22,
  HOURS_PER_DAY: 8,
  MONTHS_PER_YEAR: 12,

  // Time allocation for HR (percentage of work time)
  SCREENING_TIME_PERCENT: 0.4,   // 40% of HR time on screening calls
  FILTERING_TIME_PERCENT: 0.25,  // 25% of HR time on resume filtering

  // Skillbrew automation saves
  SCREENING_TIME_SAVED: 0.75,    // 75% of screening time eliminated
  FILTERING_TIME_SAVED: 0.80,    // 80% of filtering time eliminated

  // Quality & automation improvements
  AUTOMATION_PERCENT: 75,        // WhatsApp + email automation
  GOOD_HIRES_IMPROVEMENT: 20,    // 20% better hire quality
};

export interface CorporateInputs {
  positionsToFill: number;         // hires per year
  hrTeamSize: number;              // number of HR/TA members
  costPerHire: number;             // blended cost per hire (₹)
  filteringToolCost: number;       // annual ATS/filtering tool spend (₹)
  screeningToolCost: number;       // annual assessment/screening tool spend (₹)
  jobPostingPremiumCost: number;   // annual LinkedIn/Naukri premium (₹)
}

export interface CorporateResults {
  totalAnnualCostCurrent: number;
  totalAnnualCostSkillbrew: number;
  totalAnnualSavings: number;
  savingsPercent: number;
  tickets: {
    screeningHoursSaved: number;
    filteringHoursSaved: number;
    moreAutomationPercent: number;
    moreGoodHiresPercent: number;
  };
}

export function calculateCorporateROI(inputs: CorporateInputs): CorporateResults {
  const {
    positionsToFill,
    hrTeamSize,
    costPerHire,
    filteringToolCost,
    screeningToolCost,
    jobPostingPremiumCost,
  } = inputs;
  const C = CORPORATE_CONSTANTS;

  // ──── CURRENT (Traditional) COST ────
  // Total annual cost = (positions × blended cost/hire) + tool subscriptions
  const hiringCostCurrent = positionsToFill * costPerHire;
  const totalAnnualCostCurrent =
    hiringCostCurrent + filteringToolCost + screeningToolCost + jobPostingPremiumCost;

  // ──── SKILLBREW COST ────
  const totalCandidates = positionsToFill * C.CANDIDATES_PER_ROLE;
  const interviewCandidates = Math.ceil(totalCandidates * C.INTERVIEW_FUNNEL_RATE);

  // Per-hire costs that SkillBrew replaces
  const skillbrewAssessmentCost = totalCandidates * C.SKILLBREW_ASSESSMENT_PER_CANDIDATE;
  const skillbrewInterviewCost = interviewCandidates * C.SKILLBREW_INTERVIEW_PER_CANDIDATE;

  // Costs that remain unchanged (BGV + Onboarding)
  const unchangedPerHireCost = C.BGV_COST_PER_HIRE + C.ONBOARDING_COST_PER_HIRE;
  const unchangedTotal = positionsToFill * unchangedPerHireCost;

  // Internal productivity cost — reduced by 60% with automation
  const reducedProductivityCost =
    positionsToFill * C.INTERNAL_PRODUCTIVITY_PER_HIRE * (1 - C.PRODUCTIVITY_REDUCTION);

  // Internal TA salary still needed but reduced scope
  // We keep 50% of internal TA cost (they focus on strategy, not sourcing)
  const reducedTACost = positionsToFill * C.INTERNAL_TA_COST_PER_HIRE * 0.5;

  const totalAnnualCostSkillbrew =
    skillbrewAssessmentCost +
    skillbrewInterviewCost +
    unchangedTotal +
    reducedProductivityCost +
    reducedTACost +
    C.SKILLBREW_JOB_POSTING_COST +
    C.SKILLBREW_RESUME_SHORTLIST_COST;

  // ──── SAVINGS ────
  const totalAnnualSavings = Math.max(0, totalAnnualCostCurrent - totalAnnualCostSkillbrew);
  const savingsPercent =
    totalAnnualCostCurrent > 0
      ? Math.round((totalAnnualSavings / totalAnnualCostCurrent) * 100)
      : 0;

  // ──── TICKET CALCULATIONS ────
  // Total HR hours per year
  const totalHRHoursYear =
    hrTeamSize * C.WORKING_DAYS_MONTH * C.HOURS_PER_DAY * C.MONTHS_PER_YEAR;

  // Screening hours saved (40% of time on screening, 75% eliminated)
  const currentScreeningHours = totalHRHoursYear * C.SCREENING_TIME_PERCENT;
  const screeningHoursSaved = Math.round(currentScreeningHours * C.SCREENING_TIME_SAVED);

  // Filtering hours saved (25% of time on filtering, 80% eliminated)
  const currentFilteringHours = totalHRHoursYear * C.FILTERING_TIME_PERCENT;
  const filteringHoursSaved = Math.round(currentFilteringHours * C.FILTERING_TIME_SAVED);

  return {
    totalAnnualCostCurrent,
    totalAnnualCostSkillbrew,
    totalAnnualSavings,
    savingsPercent,
    tickets: {
      screeningHoursSaved,
      filteringHoursSaved,
      moreAutomationPercent: C.AUTOMATION_PERCENT,
      moreGoodHiresPercent: C.GOOD_HIRES_IMPROVEMENT,
    },
  };
}

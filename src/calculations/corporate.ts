/**
 * Corporate (In-house HR) cost calculations.
 * Based on India Talent Report 2026 — Corporate avg ₹71,800/hire
 */
export const CORPORATE_CONSTANTS = {
  // Benchmark per-hire components (corporate in-house, mid-level ₹8L CTC)
  /** Default estimated cost per hire in the market */
  DEFAULT_COST_PER_HIRE: 71800,

  // Component-level defaults (per hire)
  /** C1 — Internal Talent Acquisition pro-rata cost per hire */
  INTERNAL_TA_COST_PER_HIRE: 22000,        
  /** C2 — LinkedIn/Naukri premium cost per hire */
  JOB_PORTAL_COST_PER_HIRE: 12000,         
  /** C3 — Background verification cost per hire */
  BGV_COST_PER_HIRE: 1800,                 
  /** C4 — Enterprise ATS & assessment tools cost per hire */
  ASSESSMENT_TOOLS_PER_HIRE: 7500,         
  /** C5 — Structured L&D / Onboarding cost per hire */
  ONBOARDING_COST_PER_HIRE: 16000,         
  /** C6 — Internal Manager productivity cost per hire */
  INTERNAL_PRODUCTIVITY_PER_HIRE: 12500,   

  // Skillbrew costs
  /** Cost to assess a single candidate via Skillbrew */
  SKILLBREW_ASSESSMENT_PER_CANDIDATE: 30,
  /** Cost to interview a single candidate via Skillbrew */
  SKILLBREW_INTERVIEW_PER_CANDIDATE: 70,
  /** Job posting cost using Skillbrew */
  SKILLBREW_JOB_POSTING_COST: 0,           // Free
  /** Resume shortlisting cost using Skillbrew */
  SKILLBREW_RESUME_SHORTLIST_COST: 0,      // Free

  // Funnel & Quality parameters
  /** Typical number of candidates screened per open role */
  CANDIDATES_PER_ROLE: 50,
  /** Interview funnel: ~20% of screened candidates reach the interview stage */
  INTERVIEW_FUNNEL_RATE: 0.2,

  // Skillbrew automation & improvements
  /** Skillbrew reduces internal productivity cost by 60% due to automation */
  PRODUCTIVITY_REDUCTION: 0.6,
  /** 75% of screening calls eliminated by Skillbrew */
  SCREENING_TIME_SAVED: 0.75,    
  /** 80% of manual filtering time eliminated by Skillbrew */
  FILTERING_TIME_SAVED: 0.80,    
  /** 75% outreach automated via WhatsApp + email */
  AUTOMATION_PERCENT: 75,        
  /** 20% better hire quality leading to fewer bad hires */
  GOOD_HIRES_IMPROVEMENT: 20,    

  // Work constants
  /** Standard working days in a month */
  WORKING_DAYS_MONTH: 22,
  /** Standard working hours in a day */
  HOURS_PER_DAY: 8,
  /** Months in a year */
  MONTHS_PER_YEAR: 12,

  // Time allocation for HR (percentage of work time)
  /** 40% of standard HR time is spent on screening calls */
  SCREENING_TIME_PERCENT: 0.4,   
  /** 25% of standard HR time is spent on resume filtering */
  FILTERING_TIME_PERCENT: 0.25,  
};

/**
 * Inputs required to calculate Corporate ROI.
 */
export interface CorporateInputs {
  /** Target number of hires per year */
  positionsToFill: number;         
  /** Total number of HR/TA team members */
  hrTeamSize: number;              
  /** Blended cost per hire baseline (₹) */
  costPerHire: number;             
  /** Annual spend on ATS and filtering tools (₹) */
  filteringToolCost: number;       
  /** Annual spend on assessment and screening tools (₹) */
  screeningToolCost: number;       
  /** Annual spend on LinkedIn/Naukri premiums (₹) */
  jobPostingPremiumCost: number;   
}

/**
 * The structured result of the Corporate ROI Calculation.
 */
export interface CorporateResults {
  /** Total projected annual cost using traditional methods (₹) */
  totalAnnualCostCurrent: number;
  /** Total projected annual cost using Skillbrew (₹) */
  totalAnnualCostSkillbrew: number;
  /** Total calculated savings using Skillbrew (Current Cost - Skillbrew Cost) (₹) */
  totalAnnualSavings: number;
  /** Percentage of cost saved using Skillbrew */
  savingsPercent: number;
  tickets: {
    screeningHoursSaved: number;
    filteringHoursSaved: number;
    moreAutomationPercent: number;
    moreGoodHiresPercent: number;
  };
}

/**
 * Calculates current hiring costs for corporate recruitment.
 * @param inputs Corporate metrics provided by the user.
 * @returns Total traditional annual hiring cost.
 */
function calculateCurrentCorporateCosts(inputs: CorporateInputs): number {
  const {
    positionsToFill,
    costPerHire,
    filteringToolCost,
    screeningToolCost,
    jobPostingPremiumCost,
  } = inputs;

  // Total annual cost = (positions × basic blended cost/hire) + direct tool subscriptions
  const hiringCostCurrent = positionsToFill * costPerHire;
  const totalAnnualCostCurrent =
    hiringCostCurrent + filteringToolCost + screeningToolCost + jobPostingPremiumCost;

  return totalAnnualCostCurrent;
}

/**
 * Calculates projected hiring costs when using Skillbrew for corporate recruitment.
 * @param inputs Corporate metrics provided by the user.
 * @param C Corporate calculated constants.
 * @returns Total Skillbrew projected annual cost.
 */
function calculateSkillbrewCorporateCosts(inputs: CorporateInputs, C: typeof CORPORATE_CONSTANTS): number {
  const { positionsToFill } = inputs;
  
  const totalCandidates = positionsToFill * C.CANDIDATES_PER_ROLE;
  const interviewCandidates = Math.ceil(totalCandidates * C.INTERVIEW_FUNNEL_RATE);

  // Per-hire direct assessment costs that SkillBrew replaces
  const skillbrewAssessmentCost = totalCandidates * C.SKILLBREW_ASSESSMENT_PER_CANDIDATE;
  const skillbrewInterviewCost = interviewCandidates * C.SKILLBREW_INTERVIEW_PER_CANDIDATE;

  // Costs that remain unchanged (Background Verification + Onboarding)
  const unchangedPerHireCost = C.BGV_COST_PER_HIRE + C.ONBOARDING_COST_PER_HIRE;
  const unchangedTotal = positionsToFill * unchangedPerHireCost;

  // Internal productivity cost — reduced significantly with automation
  const reducedProductivityCost =
    positionsToFill * C.INTERNAL_PRODUCTIVITY_PER_HIRE * (1 - C.PRODUCTIVITY_REDUCTION);

  // Internal TA salary still needed but reduced scope (e.g. they focus on strategy, not sourcing)
  const reducedTACost = positionsToFill * C.INTERNAL_TA_COST_PER_HIRE * 0.5;

  const totalAnnualCostSkillbrew =
    skillbrewAssessmentCost +
    skillbrewInterviewCost +
    unchangedTotal +
    reducedProductivityCost +
    reducedTACost +
    C.SKILLBREW_JOB_POSTING_COST +
    C.SKILLBREW_RESUME_SHORTLIST_COST;

  return totalAnnualCostSkillbrew;
}

/**
 * Calculates time-savings tickets based on HR team size.
 * @param hrTeamSize Total number of HR team members.
 * @param C Corporate constants.
 * @returns Object mapping all time-saving tickets.
 */
function calculateCorporateTimeTickets(hrTeamSize: number, C: typeof CORPORATE_CONSTANTS) {
  // Total HR hours per year
  const totalHRHoursYear =
    hrTeamSize * C.WORKING_DAYS_MONTH * C.HOURS_PER_DAY * C.MONTHS_PER_YEAR;

  // Screening hours saved
  const currentScreeningHours = totalHRHoursYear * C.SCREENING_TIME_PERCENT;
  const screeningHoursSaved = Math.round(currentScreeningHours * C.SCREENING_TIME_SAVED);

  // Filtering hours saved 
  const currentFilteringHours = totalHRHoursYear * C.FILTERING_TIME_PERCENT;
  const filteringHoursSaved = Math.round(currentFilteringHours * C.FILTERING_TIME_SAVED);

  return {
    screeningHoursSaved,
    filteringHoursSaved,
    moreAutomationPercent: C.AUTOMATION_PERCENT,
    moreGoodHiresPercent: C.GOOD_HIRES_IMPROVEMENT,
  };
}

/**
 * Calculates the complete Return on Investment (ROI) for Corporate (In-house HR).
 * 
 * @param inputs Corporate metrics provided by the user.
 * @returns The structured results containing current costs, Skillbrew projected costs, and impact tickets.
 */
export function calculateCorporateROI(inputs: CorporateInputs): CorporateResults {
  const C = CORPORATE_CONSTANTS;

  const totalAnnualCostCurrent = calculateCurrentCorporateCosts(inputs);
  const totalAnnualCostSkillbrew = calculateSkillbrewCorporateCosts(inputs, C);

  // --- SAVINGS CALCULATIONS ---
  const totalAnnualSavings = Math.max(0, totalAnnualCostCurrent - totalAnnualCostSkillbrew);
  const savingsPercent = totalAnnualCostCurrent > 0
    ? Math.round((totalAnnualSavings / totalAnnualCostCurrent) * 100)
    : 0;

  // --- TICKET CALCULATIONS ---
  const tickets = calculateCorporateTimeTickets(inputs.hrTeamSize, C);

  return {
    totalAnnualCostCurrent,
    totalAnnualCostSkillbrew,
    totalAnnualSavings,
    savingsPercent,
    tickets,
  };
}

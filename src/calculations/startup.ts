/**
 * Startup / Small Company hiring cost calculations.
 * Based on India Talent Report 2026 — Startup avg ₹55,000/hire.
 * 
 * Key insight: Startups appear cheapest on paper but carry the HIGHEST hidden
 * cost — founders spend 20-40 hrs per hire on sourcing, screening, interviews,
 * and coordination. That's ₹15,000-₹30,000 of opportunity cost per hire.
 * A bad hire within 6 months costs 2-3× the original CPH.
 */
export const STARTUP_CONSTANTS = {
  // Benchmark per-hire components (startup, mid-level CTC ₹5-10L)
  /** Market average default cost per hire for a startup */
  DEFAULT_COST_PER_HIRE: 55000,

  // Component-level defaults (per hire)
  /** C1 — Estimated Founder time cost per hire */
  FOUNDER_TIME_COST_PER_HIRE: 10000,       
  /** C2 — Budget portals + free listings cost per hire */
  JOB_PORTAL_COST_PER_HIRE: 6500,          
  /** C3 — Background checks cost per hire */
  BGV_COST_PER_HIRE: 3000,                 
  /** C4 — SMB / freemium assessment tools per hire */
  ASSESSMENT_TOOLS_PER_HIRE: 4000,         
  /** C5 — Lean onboarding cost per hire */
  ONBOARDING_COST_PER_HIRE: 9500,          
  /** C6 — High founder distraction opportunity cost */
  PRODUCTIVITY_COST_PER_HIRE: 22000,       

  // Typical volume
  /** Average number of hires per year for a seeded startup */
  DEFAULT_HIRES_PER_YEAR: 6,

  // Time & Value assumptions
  /** Founder spends 30 hrs per hire on average (range 20-40) */
  DEFAULT_FOUNDER_HOURS_PER_HIRE: 30,
  /** 
   * Founder hourly opportunity cost: ₹1,000/hr
   * (Based on a founder billing/valued at ₹15-20L/yr ≈ ₹800-1200/hr) 
   */
  DEFAULT_FOUNDER_HOURLY_VALUE: 1000,
  /** Typical candidates screened per role by a founder */
  CANDIDATES_PER_ROLE: 40,

  // Skillbrew costs
  /** Cost to assess a single candidate via Skillbrew */
  SKILLBREW_ASSESSMENT_PER_CANDIDATE: 30,
  /** Cost to interview a single candidate via Skillbrew */
  SKILLBREW_INTERVIEW_PER_CANDIDATE: 70,

  // Interview funnel
  /** Only ~20% of candidates reach the interview stage */
  INTERVIEW_FUNNEL_RATE: 0.2,

  // Skillbrew Time calculations
  /** With SkillBrew, founder time per hire drops from 30hrs to ~5hrs (final interviews only) */
  SKILLBREW_FOUNDER_HOURS_PER_HIRE: 5,

  // Fixed components
  /** BGV + Onboarding stay the same (3000 + 9500 = ₹12,500) */
  FIXED_COST_PER_HIRE: 12500, 

  // Quality improvements
  /** Skillbrew reduces bad hires by 35% */
  BAD_HIRE_REDUCTION: 35,            
  /** ~83% time saved (30hrs → 5hrs) using Skillbrew */
  FOUNDER_TIME_SAVED_PERCENT: 83,    
};

/**
 * Inputs required to calculate Startup ROI.
 */
export interface StartupInputs {
  /** Target number of hires planned for the year */
  hiresPlanned: number;            
  /** Estimated hours the founding team spends per hire */
  founderHoursPerHire: number;     
  /** Approximate monetary value of the founder's time per hour (₹) */
  founderHourlyValue: number;      
  /** Total annual budget directed towards job portals (₹) */
  jobPostingBudget: number;        
  /** Total annual budget for ATS/filtering software (₹) */
  filteringToolCost: number;       
  /** Total annual budget for screening/assessment tools (₹) */
  screeningToolCost: number;       
}

/**
 * The structured result of the Startup ROI Calculation.
 */
export interface StartupResults {
  /** Total projected annual cost using traditional startup scaling (₹) */
  totalCostCurrent: number;
  /** Total projected annual cost using Skillbrew (₹) */
  totalCostSkillbrew: number;
  /** Total expected savings calculated as (Current Cost - Skillbrew Cost) (₹) */
  totalSavings: number;
  /** Total calculated percentage of cost saved out of traditional spend */
  savingsPercent: number;
  /** Total net founder hours successfully reclaimed annually */
  founderHoursReclaimed: number;   
  tickets: {
    founderHoursSaved: number;
    costPerHireReduction: number;  
    badHireReduction: number;      
    toolCostEliminated: number;    
  };
}

/**
 * Evaluates the baseline current hiring cost for early-stage startups.
 * Calculation includes founder opportunity cost + direct hiring tooling.
 * 
 * @param inputs Startup scaling metrics provided by the user.
 * @returns Total calculated traditional startup hiring cost.
 */
function calculateCurrentStartupCosts(inputs: StartupInputs, C: typeof STARTUP_CONSTANTS): number {
  const {
    hiresPlanned,
    founderHoursPerHire,
    founderHourlyValue,
    jobPostingBudget,
    filteringToolCost,
    screeningToolCost,
  } = inputs;

  // Founder time = biggest hidden cost
  const founderTimeCostCurrent = hiresPlanned * founderHoursPerHire * founderHourlyValue;

  // Direct hiring costs (portal fees, tools, BGV, onboarding, etc.)
  // Exclude productivity cost as it's reflected via founder hours above.
  const directCostPerHire = C.FOUNDER_TIME_COST_PER_HIRE + C.JOB_PORTAL_COST_PER_HIRE +
    C.BGV_COST_PER_HIRE + C.ASSESSMENT_TOOLS_PER_HIRE + C.ONBOARDING_COST_PER_HIRE;

  const directHiringCost = hiresPlanned * directCostPerHire;

  return founderTimeCostCurrent + directHiringCost + jobPostingBudget + filteringToolCost + screeningToolCost;
}

/**
 * Evaluates the hiring cost scaling when adopting Skillbrew over traditional strategies.
 * Automation substantially replaces founder time investments.
 * 
 * @param inputs Startup scaling metrics provided by the user.
 * @returns Total calculated Skillbrew startup hiring cost.
 */
function calculateSkillbrewStartupCosts(inputs: StartupInputs, C: typeof STARTUP_CONSTANTS): number {
  const {
    hiresPlanned,
    founderHourlyValue,
  } = inputs;

  const totalCandidates = hiresPlanned * C.CANDIDATES_PER_ROLE;
  const interviewCandidates = Math.ceil(totalCandidates * C.INTERVIEW_FUNNEL_RATE);

  // SkillBrew direct candidate processing costs
  const skillbrewAssessmentCost = totalCandidates * C.SKILLBREW_ASSESSMENT_PER_CANDIDATE;
  const skillbrewInterviewCost = interviewCandidates * C.SKILLBREW_INTERVIEW_PER_CANDIDATE;

  // Founder time with SkillBrew (drastically reduced)
  const founderTimeCostSkillbrew = hiresPlanned * C.SKILLBREW_FOUNDER_HOURS_PER_HIRE * founderHourlyValue;

  // Fixed costs that always remain (BGV + Onboarding)
  const fixedCosts = hiresPlanned * C.FIXED_COST_PER_HIRE;

  return skillbrewAssessmentCost + skillbrewInterviewCost + founderTimeCostSkillbrew + fixedCosts;
}

/**
 * Calculates the complete Return on Investment (ROI) for Startups matching founders efficiency scale.
 * 
 * @param inputs The startup growth metrics provided by the user.
 * @returns The structured results containing current costs, Skillbrew projected costs, and impact tickets.
 */
export function calculateStartupROI(inputs: StartupInputs): StartupResults {
  const C = STARTUP_CONSTANTS;

  const totalCostCurrent = calculateCurrentStartupCosts(inputs, C);
  const totalCostSkillbrew = calculateSkillbrewStartupCosts(inputs, C);

  // --- SAVINGS CALCULATIONS ---
  const totalSavings = Math.max(0, totalCostCurrent - totalCostSkillbrew);
  const savingsPercent = totalCostCurrent > 0
    ? Math.round((totalSavings / totalCostCurrent) * 100)
    : 0;

  // --- FOUNDER TIME CALCULATIONS ---
  const currentTotalFounderHours = inputs.hiresPlanned * inputs.founderHoursPerHire;
  const skillbrewTotalFounderHours = inputs.hiresPlanned * C.SKILLBREW_FOUNDER_HOURS_PER_HIRE;
  const founderHoursReclaimed = Math.max(0, currentTotalFounderHours - skillbrewTotalFounderHours);

  // --- TICKET CALCULATIONS ---
  const currentCPH = totalCostCurrent / Math.max(1, inputs.hiresPlanned);
  const skillbrewCPH = totalCostSkillbrew / Math.max(1, inputs.hiresPlanned);
  const costPerHireReduction = currentCPH > 0
    ? Math.round(((currentCPH - skillbrewCPH) / currentCPH) * 100)
    : 0;

  // Tool costs eliminated = job portal budget + tool subscriptions (built directly using provided budgets)
  const toolCostEliminated = inputs.jobPostingBudget + inputs.filteringToolCost + inputs.screeningToolCost;

  return {
    totalCostCurrent,
    totalCostSkillbrew,
    totalSavings,
    savingsPercent,
    founderHoursReclaimed,
    tickets: {
      founderHoursSaved: founderHoursReclaimed,
      costPerHireReduction: Math.max(0, costPerHireReduction),
      badHireReduction: C.BAD_HIRE_REDUCTION,
      toolCostEliminated,
    },
  };
}

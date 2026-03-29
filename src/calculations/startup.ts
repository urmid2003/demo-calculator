// Startup / Small Company hiring cost calculations
// Based on India Talent Report 2026 — Startup avg ₹55,000/hire
//
// Key insight: Startups appear cheapest on paper but carry the HIGHEST hidden
// cost — founders spend 20-40 hrs per hire on sourcing, screening, interviews,
// and coordination. That's ₹15,000-₹30,000 of opportunity cost per hire.
// A bad hire within 6 months costs 2-3× the original CPH.

export const STARTUP_CONSTANTS = {
  // Benchmark per-hire components (startup, mid-level CTC ₹5-10L)
  DEFAULT_COST_PER_HIRE: 55000,

  // Component-level defaults (per hire)
  FOUNDER_TIME_COST_PER_HIRE: 10000,       // C1 — Founder time cost
  JOB_PORTAL_COST_PER_HIRE: 6500,          // C2 — Budget portals + free
  BGV_COST_PER_HIRE: 3000,                 // C3 — No bulk pricing
  ASSESSMENT_TOOLS_PER_HIRE: 4000,         // C4 — SMB / freemium tools
  ONBOARDING_COST_PER_HIRE: 9500,          // C5 — Lean onboarding
  PRODUCTIVITY_COST_PER_HIRE: 22000,       // C6 — Founder distraction HIGH

  // Typical hires/year for a startup
  DEFAULT_HIRES_PER_YEAR: 6,

  // Founder spends 30 hrs per hire on average (range 20-40)
  DEFAULT_FOUNDER_HOURS_PER_HIRE: 30,

  // Founder hourly opportunity cost: ₹1,000/hr
  // (a founder billing/valued at ₹15-20L/yr ≈ ₹800-1200/hr)
  DEFAULT_FOUNDER_HOURLY_VALUE: 1000,

  // Typical candidates screened per role
  CANDIDATES_PER_ROLE: 40,

  // Skillbrew costs
  SKILLBREW_ASSESSMENT_PER_CANDIDATE: 30,
  SKILLBREW_INTERVIEW_PER_CANDIDATE: 70,

  // Interview funnel: ~20% candidates reach interview
  INTERVIEW_FUNNEL_RATE: 0.2,

  // With SkillBrew, founder time per hire drops from 30hrs to ~5hrs
  // (only final interviews & culture-fit calls remain)
  SKILLBREW_FOUNDER_HOURS_PER_HIRE: 5,

  // SkillBrew eliminates job portal costs (free posting)
  // SkillBrew eliminates assessment tool costs (built-in)

  // BGV + Onboarding stay the same
  FIXED_COST_PER_HIRE: 3000 + 9500, // BGV + Onboarding = ₹12,500

  // Quality improvements
  BAD_HIRE_REDUCTION: 35,            // 35% fewer bad hires
  FOUNDER_TIME_SAVED_PERCENT: 83,    // ~83% time saved (30hrs → 5hrs)
};

export interface StartupInputs {
  hiresPlanned: number;            // hires planned this year
  founderHoursPerHire: number;     // hours founder/team spends per hire
  founderHourlyValue: number;      // opportunity cost per hour (₹)
  jobPostingBudget: number;        // annual budget for job portals (₹)
  filteringToolCost: number;       // annual ATS/filtering tool spend (₹)
  screeningToolCost: number;       // annual assessment/screening tool spend (₹)
}

export interface StartupResults {
  totalCostCurrent: number;
  totalCostSkillbrew: number;
  totalSavings: number;
  savingsPercent: number;
  founderHoursReclaimed: number;   // total hours given back to founder
  tickets: {
    founderHoursSaved: number;
    costPerHireReduction: number;  // percentage
    badHireReduction: number;      // percentage
    toolCostEliminated: number;    // ₹ saved on tools
  };
}

export function calculateStartupROI(inputs: StartupInputs): StartupResults {
  const {
    hiresPlanned,
    founderHoursPerHire,
    founderHourlyValue,
    jobPostingBudget,
    filteringToolCost,
    screeningToolCost,
  } = inputs;
  const C = STARTUP_CONSTANTS;

  // ──── CURRENT (Traditional) COST ────
  // Founder time = biggest hidden cost
  const founderTimeCostCurrent = hiresPlanned * founderHoursPerHire * founderHourlyValue;

  // Direct hiring costs (portal fees, tools, BGV, onboarding, etc.)
  // We use blended avg minus the productivity component (already counted via founder hours)
  const directCostPerHire = C.FOUNDER_TIME_COST_PER_HIRE + C.JOB_PORTAL_COST_PER_HIRE +
    C.BGV_COST_PER_HIRE + C.ASSESSMENT_TOOLS_PER_HIRE + C.ONBOARDING_COST_PER_HIRE;
  const directHiringCost = hiresPlanned * directCostPerHire;

  const totalCostCurrent = founderTimeCostCurrent + directHiringCost + jobPostingBudget + filteringToolCost + screeningToolCost;

  // ──── SKILLBREW COST ────
  const totalCandidates = hiresPlanned * C.CANDIDATES_PER_ROLE;
  const interviewCandidates = Math.ceil(totalCandidates * C.INTERVIEW_FUNNEL_RATE);

  // SkillBrew per-candidate costs
  const skillbrewAssessmentCost = totalCandidates * C.SKILLBREW_ASSESSMENT_PER_CANDIDATE;
  const skillbrewInterviewCost = interviewCandidates * C.SKILLBREW_INTERVIEW_PER_CANDIDATE;

  // Founder time with SkillBrew (drastically reduced)
  const founderTimeCostSkillbrew = hiresPlanned * C.SKILLBREW_FOUNDER_HOURS_PER_HIRE * founderHourlyValue;

  // Fixed costs that remain (BGV + Onboarding)
  const fixedCosts = hiresPlanned * C.FIXED_COST_PER_HIRE;

  // No job portal costs (free posting), no tool subscriptions (built-in)
  const totalCostSkillbrew =
    skillbrewAssessmentCost +
    skillbrewInterviewCost +
    founderTimeCostSkillbrew +
    fixedCosts;

  // ──── SAVINGS ────
  const totalSavings = Math.max(0, totalCostCurrent - totalCostSkillbrew);
  const savingsPercent = totalCostCurrent > 0
    ? Math.round((totalSavings / totalCostCurrent) * 100)
    : 0;

  // Founder hours reclaimed
  const currentTotalFounderHours = hiresPlanned * founderHoursPerHire;
  const skillbrewTotalFounderHours = hiresPlanned * C.SKILLBREW_FOUNDER_HOURS_PER_HIRE;
  const founderHoursReclaimed = Math.max(0, currentTotalFounderHours - skillbrewTotalFounderHours);

  // ──── TICKET CALCULATIONS ────
  // Cost per hire reduction
  const currentCPH = totalCostCurrent / Math.max(1, hiresPlanned);
  const skillbrewCPH = totalCostSkillbrew / Math.max(1, hiresPlanned);
  const costPerHireReduction = currentCPH > 0
    ? Math.round(((currentCPH - skillbrewCPH) / currentCPH) * 100)
    : 0;

  // Tool costs eliminated = job portal budget + tool subscriptions
  const toolCostEliminated = jobPostingBudget + filteringToolCost + screeningToolCost;

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

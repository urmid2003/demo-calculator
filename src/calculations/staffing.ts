/**
 * Cost assumptions and market averages for Staffing agencies.
 * All monetary values are in INR (₹) unless otherwise specified.
 */
export const STAFFING_CONSTANTS = {
  // Current Market Averages
  MARKET_JOB_POSTING: 3000,
  MARKET_ASSESSMENT: 400, // Average of 300-500
  MARKET_INTERVIEW_COST_PER_CANDIDATE: 180,
  MARKET_RECRUITER_SALARY_MONTHLY: 35000,
  MARKET_WORKING_DAYS_MONTH: 22,
  MARKET_HOURS_PER_DAY: 8,
  
  /** 40% of recruiter time is spent on screening currently */
  MARKET_SCREENING_TIME_PERCENTAGE: 0.4,
  
  /** Market Agency Fee per hire (12% of 8L CTC) */
  MARKET_AGENCY_FEE_PER_HIRE: 96000,
  
  // Skillbrew Costs
  SKILLBREW_JOB_POSTING_COST: 0,        // Free with Skillbrew
  SKILLBREW_RESUME_SHORTLIST_COST: 0,    // Free with Skillbrew
  SKILLBREW_ASSESSMENT_COST: 30,
  SKILLBREW_INTERVIEW_COST: 70,

  // Skillbrew optimizations
  /** Reduces screening time from 40% to 10% */
  SKILLBREW_SCREENING_TIME_PERCENTAGE: 0.1,
  
  /** Assuming a conservative 20% increase in successful closures due to better AI matching */
  SKILLBREW_CLOSURE_IMPROVEMENT_PERCENTAGE: 0.2,
};

/**
 * Inputs required to calculate staffing ROI.
 */
export interface StaffingInputs {
  /** Annual jobs posted by the agency */
  jobsPosted: number;
  /** Number of active recruiters on the team */
  recruitersOnTeam: number;
  /** Number of successful closures (hires) annually/monthly depending on input scale */
  successfulClosures: number;
  /** Candidates screened per role before shortlisting */
  candidatesPerRole: number;
  /** Base internal cost overrides from Lead Capture */
  baseInternalCost?: number;
  /** Base external cost overrides from Lead Capture */
  baseExternalCost?: number;
}

/**
 * The structured result of the Staffing ROI Calculation.
 */
export interface StaffingResults {
  current: {
    revenue: number;
    jobPostingCost: number;
    screeningCost: number;
  };
  skillbrew: {
    revenue: number;
    jobPostingCost: number;
    screeningCost: number;
  };
  /** Total calculated savings using Skillbrew (Current Cost - Skillbrew Cost) */
  totalSavings: number;
  /** Percentage of cost saved using Skillbrew */
  savingsPercent: number;
  tickets: {
    increasedRevenue: number;
    filteringHoursSaved: number;
    moreSuccessfulClosuresPercentage: number;
    hoursSavedOnShortlisting: number;
  };
}

/**
 * Calculates the current, traditional costs for the staffing agency.
 * @param inputs Staffing metrics and inputs provided by the user.
 * @param C Staffing constants used for calculation.
 * @param totalCandidates The total number of candidates processed.
 * @returns Object containing current revenue, job posting cost, and screening cost.
 */
function calculateCurrentStaffingCosts(inputs: StaffingInputs, C: typeof STAFFING_CONSTANTS, totalCandidates: number) {
  const currentRevenue = inputs.successfulClosures * C.MARKET_AGENCY_FEE_PER_HIRE;
  const currentJobPostingCost = inputs.baseExternalCost !== undefined 
    ? inputs.baseExternalCost 
    : inputs.jobsPosted * C.MARKET_JOB_POSTING;

  // Total screening hours currently 
  // Based on total candidates to reflect workload volume (assuming ~24 mins or 0.4 hours per candidate manually)
  const currentScreeningHours = totalCandidates * 0.4;

  const recruiterHourlyRate = C.MARKET_RECRUITER_SALARY_MONTHLY / (C.MARKET_WORKING_DAYS_MONTH * C.MARKET_HOURS_PER_DAY);
  const calculatedScreeningCost = Math.round(currentScreeningHours * recruiterHourlyRate);
  const currentScreeningCost = inputs.baseInternalCost !== undefined 
    ? inputs.baseInternalCost 
    : calculatedScreeningCost;

  return {
    revenue: currentRevenue,
    jobPostingCost: currentJobPostingCost,
    screeningCost: currentScreeningCost,
    screeningHours: currentScreeningHours,
  };
}

/**
 * Calculates the projected costs and benefits using Skillbrew.
 * @param inputs Staffing metrics and inputs provided by the user.
 * @param C Staffing constants used for calculation.
 * @param totalCandidates The total number of candidates processed.
 * @returns Object containing Skillbrew projected revenue, job posting cost, and screening cost.
 */
function calculateSkillbrewStaffingCosts(inputs: StaffingInputs, C: typeof STAFFING_CONSTANTS, totalCandidates: number) {
  // Revenue increases due to better matching efficiency
  const additionalClosures = Math.round(inputs.successfulClosures * C.SKILLBREW_CLOSURE_IMPROVEMENT_PERCENTAGE);
  const skillbrewRevenue = (inputs.successfulClosures + additionalClosures) * C.MARKET_AGENCY_FEE_PER_HIRE;

  const skillbrewJobPostingCost = C.SKILLBREW_JOB_POSTING_COST;

  // Screening / Resume Shortlisting — Free with Skillbrew
  // Only assessment and interview costs apply
  const skillbrewAssessmentCost = totalCandidates * C.SKILLBREW_ASSESSMENT_COST;
  const skillbrewInterviewCandidates = Math.ceil(totalCandidates * 0.2); // assume 20% make it to interview
  const skillbrewInterviewCost = skillbrewInterviewCandidates * C.SKILLBREW_INTERVIEW_COST;
  
  const skillbrewScreeningEvalCost = skillbrewAssessmentCost + skillbrewInterviewCost;
  
  // Skillbrew Time tracking: Reduced from ~24 mins to ~6 mins (0.1 hours) per candidate
  const skillbrewScreeningHours = totalCandidates * 0.1;

  return {
    revenue: skillbrewRevenue,
    jobPostingCost: skillbrewJobPostingCost,
    screeningCost: skillbrewScreeningEvalCost,
    screeningHours: skillbrewScreeningHours,
  };
}

/**
 * Calculates the complete Return on Investment (ROI) for a Staffing Agency.
 * 
 * @param inputs The staffing metrics provided by the user.
 * @returns The structured results containing current costs, Skillbrew projected costs, and impact tickets.
 */
export function calculateStaffingROI(inputs: StaffingInputs): StaffingResults {
  const C = STAFFING_CONSTANTS;
  const totalCandidates = inputs.jobsPosted * inputs.candidatesPerRole;

  const current = calculateCurrentStaffingCosts(inputs, C, totalCandidates);
  const skillbrew = calculateSkillbrewStaffingCosts(inputs, C, totalCandidates);

  // --- SAVINGS CALCULATIONS ---
  const currentTotalCost = current.jobPostingCost + current.screeningCost;
  const skillbrewTotalCost = skillbrew.jobPostingCost + skillbrew.screeningCost;
  const totalSavings = Math.max(0, currentTotalCost - skillbrewTotalCost);
  const savingsPercent = currentTotalCost > 0 ? Math.round((totalSavings / currentTotalCost) * 100) : 0;

  // --- TICKET CALCULATIONS ---
  const increasedRevenue = skillbrew.revenue - current.revenue;
  const filteringHoursSaved = Math.max(0, current.screeningHours - skillbrew.screeningHours);

  return {
    current: {
      revenue: current.revenue,
      jobPostingCost: current.jobPostingCost,
      screeningCost: current.screeningCost,
    },
    skillbrew: {
      revenue: skillbrew.revenue,
      jobPostingCost: skillbrew.jobPostingCost,
      screeningCost: skillbrew.screeningCost,
    },
    totalSavings,
    savingsPercent,
    tickets: {
      increasedRevenue: Math.max(0, increasedRevenue),
      filteringHoursSaved: Math.round(filteringHoursSaved),
      moreSuccessfulClosuresPercentage: C.SKILLBREW_CLOSURE_IMPROVEMENT_PERCENTAGE * 100, // 20%
      hoursSavedOnShortlisting: Math.round(filteringHoursSaved),
    }
  };
}

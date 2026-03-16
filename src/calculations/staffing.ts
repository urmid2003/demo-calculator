// Cost assumptions from market vs Skillbrew

export const STAFFING_CONSTANTS = {
  // Current Market Averages (in INR unless specified)
  MARKET_JOB_POSTING: 3000,
  MARKET_ASSESSMENT: 400, // Average of 300-500
  MARKET_INTERVIEW_COST_PER_CANDIDATE: 180,
  MARKET_RECRUITER_SALARY_MONTHLY: 35000,
  MARKET_WORKING_DAYS_MONTH: 22,
  MARKET_HOURS_PER_DAY: 8,
  // 40% of recruiter time is spent on screening currently
  MARKET_SCREENING_TIME_PERCENTAGE: 0.4,
  
  // Market Agency Fee per hire (12% of 8L CTC)
  MARKET_AGENCY_FEE_PER_HIRE: 96000,
  
  // Skillbrew Costs
  SKILLBREW_JOB_POSTING_FREE_LIMIT: 10,
  SKILLBREW_JOB_POSTING_COST_EXTRA: 100,
  
  SKILLBREW_RESUME_SHORTLIST_FREE_LIMIT_PER_JOB: 50,
  SKILLBREW_RESUME_SHORTLIST_COST_EXTRA: 10,
  
  SKILLBREW_ASSESSMENT_COST: 30,
  SKILLBREW_INTERVIEW_COST: 70,

  // Skillbrew optimizations
  // Reduces screening time from 40% to 10%
  SKILLBREW_SCREENING_TIME_PERCENTAGE: 0.1,
  
  // Assuming a conservative 20% increase in successful closures due to better AI matching
  SKILLBREW_CLOSURE_IMPROVEMENT_PERCENTAGE: 0.2,
};

export interface StaffingInputs {
  jobsPosted: number;
  recruitersOnTeam: number;
  successfulClosures: number; // per month
  candidatesPerRole: number; // screened before shortlisting
}

export interface StaffingResults {
  current: {
    revenue: number;
    jobPostingCost: number;
    screeningCost: number; // Monetary value of recruiter time
  };
  skillbrew: {
    revenue: number;
    jobPostingCost: number;
    screeningCost: number;
  };
  tickets: {
    increasedRevenue: number;
    filteringHoursSaved: number;
    moreSuccessfulClosuresPercentage: number;
    hoursSavedOnShortlisting: number;
  };
}

export function calculateStaffingROI(inputs: StaffingInputs): StaffingResults {
  const { jobsPosted, recruitersOnTeam, successfulClosures, candidatesPerRole } = inputs;
  const C = STAFFING_CONSTANTS;

  // --- CURRENT CALCULATIONS ---
  const currentRevenue = successfulClosures * C.MARKET_AGENCY_FEE_PER_HIRE;
  const currentJobPostingCost = jobsPosted * C.MARKET_JOB_POSTING;
  
  // Screening completely done manually. Recruiter cost dedicated to screening:
  const totalRecruiterCost = recruitersOnTeam * C.MARKET_RECRUITER_SALARY_MONTHLY;
  const currentScreeningCost = totalRecruiterCost * C.MARKET_SCREENING_TIME_PERCENTAGE;

  // Calculating total candidates processed
  const totalCandidates = jobsPosted * candidatesPerRole;

  // Total screening hours currently (assuming roughly proportional to cost percentage)
  const totalRecruiterHoursMonthly = recruitersOnTeam * C.MARKET_WORKING_DAYS_MONTH * C.MARKET_HOURS_PER_DAY;
  const currentScreeningHours = totalRecruiterHoursMonthly * C.MARKET_SCREENING_TIME_PERCENTAGE;

  // --- SKILLBREW CALCULATIONS ---
  // Revenue increases due to better matching efficiency
  const additionalClosures = Math.round(successfulClosures * C.SKILLBREW_CLOSURE_IMPROVEMENT_PERCENTAGE);
  const skillbrewRevenue = (successfulClosures + additionalClosures) * C.MARKET_AGENCY_FEE_PER_HIRE;

  // Job Posting Cost
  const billableJobs = Math.max(0, jobsPosted - C.SKILLBREW_JOB_POSTING_FREE_LIMIT);
  let skillbrewJobPostingCost = billableJobs * C.SKILLBREW_JOB_POSTING_COST_EXTRA;

  // Screening / Resume Shortlisting Cost
  // Total resumes to shortlist is totalCandidates.
  // Free limit is 50 PER JOB.
  const freeShortlists = jobsPosted * C.SKILLBREW_RESUME_SHORTLIST_FREE_LIMIT_PER_JOB;
  const billableShortlists = Math.max(0, totalCandidates - freeShortlists);
  const skillbrewShortlistCost = billableShortlists * C.SKILLBREW_RESUME_SHORTLIST_COST_EXTRA;

  // Additional Skillbrew costs replacing manual interviewing/assessments
  const skillbrewAssessmentCost = totalCandidates * C.SKILLBREW_ASSESSMENT_COST;
  let skillbrewInterviewCandidates = Math.ceil(totalCandidates * 0.2); // assume 20% make it to interview
  const skillbrewInterviewCost = skillbrewInterviewCandidates * C.SKILLBREW_INTERVIEW_COST;
  
  // Total Skillbrew 'Screening & Eval' cost
  const skillbrewScreeningEvalCost = skillbrewShortlistCost + skillbrewAssessmentCost + skillbrewInterviewCost;
  
  // Skillbrew Time tracking
  const skillbrewScreeningHours = totalRecruiterHoursMonthly * C.SKILLBREW_SCREENING_TIME_PERCENTAGE;

  // --- TICKET CALCULATIONS ---
  const increasedRevenue = skillbrewRevenue - currentRevenue;
  const filteringHoursSaved = Math.max(0, currentScreeningHours - skillbrewScreeningHours);
  const hoursSavedOnShortlisting = Math.round(filteringHoursSaved); // synonymous for this display

  return {
    current: {
      revenue: currentRevenue,
      jobPostingCost: currentJobPostingCost,
      screeningCost: currentScreeningCost,
    },
    skillbrew: {
      revenue: skillbrewRevenue,
      jobPostingCost: skillbrewJobPostingCost,
      screeningCost: skillbrewScreeningEvalCost,
    },
    tickets: {
      increasedRevenue: Math.max(0, increasedRevenue),
      filteringHoursSaved: Math.round(filteringHoursSaved),
      moreSuccessfulClosuresPercentage: C.SKILLBREW_CLOSURE_IMPROVEMENT_PERCENTAGE * 100, // 20%
      hoursSavedOnShortlisting: hoursSavedOnShortlisting,
    }
  };
}

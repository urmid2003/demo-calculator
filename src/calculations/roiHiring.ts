/**
 * ROI hiring calculator: current manual process vs Skillbrew (credits).
 *
 * Benchmarks for default dummy values (India, 2024 to 2026 hiring context):
 * - Job boards / sourcing (Naukri + LinkedIn Recruiter Lite style): about 2 to 5 L/year is common for SMB teams; we use 2,40,000 INR.
 * - First-pass resume review: recruiters often cite about 10 to 25 minutes per CV; 0.22 hr is about 13 min.
 * - Scheduling / coordination per shortlisted candidate: about 1 to 2.5 hours of back-and-forth (HR time).
 * - Hiring-manager / expert panel time per shortlisted candidate: about 2 to 4 hours interviews; feedback loops add about 1 to 2 hours.
 * - Loaded HR cost for screening TA: roughly 400 to 700 INR/hour in major Indian cities (salary + overhead / billable hours).
 * - Loaded senior IC/manager engineering rate for interviews: roughly 1,800 to 3,000 INR/hour for 25 to 45 L CTC bands.
 */

export const IN_PER_CREDIT = 10; // 1 Credit = ₹10
export const CREATION_CREDITS = 100; // Assessment or Interview creation
export const CREDIT_PER_RESUME_SHORTLIST = 1;
export const CREDIT_PER_SHORTLISTED_ASSESSMENT = 10;
export const CREDIT_PER_SHORTLISTED_INTERVIEW = 150;
export const SKILLBREW_DISCOUNT = 0.7; // 70% off → pay 30%

export interface RoiHiringInputs {
  companyName: string;
  techAnnualPositions: number;
  nonTechAnnualPositions: number;
  /** Avg resumes received per tech job opening */
  techResumesReceived: number;
  /** Avg resumes received per non-tech job opening */
  nonTechResumesReceived: number;
  /** Avg shortlisted resumes per tech job */
  techShortlisted: number;
  /** Avg shortlisted resumes per non-tech job */
  nonTechShortlisted: number;
  /**
   * Interpreted as avg HR hours spent per resume for manual shortlisting (matches formula).
   * Typical first-pass screen: about 0.15 to 0.35 hr in India TA workflows.
   */
  hrHoursPerResumeManualShortlist: number;
  /** Back-and-forth scheduling hours per shortlisted candidate (HR rate applies). */
  interviewSchedulingHoursPerShortlisted: number;
  /** Expert / panel interview hours per shortlisted candidate (manager rate). */
  expertInterviewHoursPerShortlisted: number;
  /** Manager feedback & alignment hours per shortlisted candidate (manager rate). */
  feedbackManagerHoursPerShortlisted: number;
  jobBoardAnnualCost: number;
  hrCostPerHour: number;
  managerCostPerHour: number;
}

/** Defaults grounded in typical India SMB / mid-market hiring (see file header). */
export const DEFAULT_ROI_INPUTS: RoiHiringInputs = {
  companyName: 'Brudite Pvt Ltd',
  techAnnualPositions: 28,
  nonTechAnnualPositions: 14,
  techResumesReceived: 118,
  nonTechResumesReceived: 86,
  techShortlisted: 9,
  nonTechShortlisted: 11,
  hrHoursPerResumeManualShortlist: 0.22,
  interviewSchedulingHoursPerShortlisted: 1.6,
  expertInterviewHoursPerShortlisted: 2.4,
  feedbackManagerHoursPerShortlisted: 1.1,
  jobBoardAnnualCost: 240000,
  hrCostPerHour: 480,
  managerCostPerHour: 2200,
};

export interface CurrentCostBreakdown {
  resumeShortlistingCost: number;
  interviewSchedulingCost: number;
  interviewAndFeedbackCost: number;
  additionalCost: number;
  total: number;
}

export interface SkillbrewCostBreakdown {
  resumeShortlistCredits: number;
  resumeShortlistInr: number;
  proctoredAssessmentCredits: number;
  proctoredAssessmentInr: number;
  proctoredInterviewCredits: number;
  proctoredInterviewInr: number;
  subtotalBeforeDiscountInr: number;
  finalAmountInr: number;
}

export interface HourEstimates {
  /** Total person-hours (HR + manager-weighted not applied; raw hours). */
  currentTotalHours: number;
  /** Heuristic hours with Skillbrew (mostly async / automated). */
  skillbrewEquivalentHours: number;
  hoursSaved: number;
}

export interface ImpactMetrics {
  /** Annual money saved vs Skillbrew final (same as revenue uplift for ops). */
  revenueIncreasedInr: number;
  hoursSaved: number;
  moreAutomationPercent: number;
  moreGoodHiresPercent: number;
}

export interface RoiHiringResults {
  current: CurrentCostBreakdown;
  skillbrew: SkillbrewCostBreakdown;
  hours: HourEstimates;
  impact: ImpactMetrics;
}

function safeNum(n: number): boolean {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0;
}

export function validateRoiInputs(i: RoiHiringInputs): boolean {
  if (!i.companyName || !i.companyName.trim()) return false;
  const nums: number[] = [
    i.techAnnualPositions,
    i.nonTechAnnualPositions,
    i.techResumesReceived,
    i.nonTechResumesReceived,
    i.techShortlisted,
    i.nonTechShortlisted,
    i.hrHoursPerResumeManualShortlist,
    i.interviewSchedulingHoursPerShortlisted,
    i.expertInterviewHoursPerShortlisted,
    i.feedbackManagerHoursPerShortlisted,
    i.jobBoardAnnualCost,
    i.hrCostPerHour,
    i.managerCostPerHour,
  ];
  if (!nums.every(safeNum)) return false;
  if (i.techAnnualPositions + i.nonTechAnnualPositions <= 0) return false;
  return true;
}

export function calculateCurrentCosts(i: RoiHiringInputs): CurrentCostBreakdown {
  const resumeShortlistingCost =
    i.techResumesReceived *
      i.hrHoursPerResumeManualShortlist *
      i.hrCostPerHour *
      i.techAnnualPositions +
    i.nonTechResumesReceived *
      i.hrHoursPerResumeManualShortlist *
      i.hrCostPerHour *
      i.nonTechAnnualPositions;

  const interviewSchedulingCost =
    i.techShortlisted *
      i.interviewSchedulingHoursPerShortlisted *
      i.hrCostPerHour *
      i.techAnnualPositions +
    i.nonTechShortlisted *
      i.interviewSchedulingHoursPerShortlisted *
      i.hrCostPerHour *
      i.nonTechAnnualPositions;

  const managerHoursPerShortlisted =
    i.expertInterviewHoursPerShortlisted + i.feedbackManagerHoursPerShortlisted;

  const interviewAndFeedbackCost =
    i.techShortlisted *
      managerHoursPerShortlisted *
      i.managerCostPerHour *
      i.techAnnualPositions +
    i.nonTechShortlisted *
      managerHoursPerShortlisted *
      i.managerCostPerHour *
      i.nonTechAnnualPositions;

  const additionalCost = i.jobBoardAnnualCost;

  const total =
    resumeShortlistingCost +
    interviewSchedulingCost +
    interviewAndFeedbackCost +
    additionalCost;

  return {
    resumeShortlistingCost,
    interviewSchedulingCost,
    interviewAndFeedbackCost,
    additionalCost,
    total,
  };
}

export function calculateSkillbrewCosts(i: RoiHiringInputs): SkillbrewCostBreakdown {
  const resumeShortlistCredits =
    i.techResumesReceived * CREDIT_PER_RESUME_SHORTLIST * i.techAnnualPositions +
    i.nonTechResumesReceived * CREDIT_PER_RESUME_SHORTLIST * i.nonTechAnnualPositions;

  const proctoredAssessmentCredits =
    (CREATION_CREDITS + i.techShortlisted * CREDIT_PER_SHORTLISTED_ASSESSMENT) *
      i.techAnnualPositions +
    (CREATION_CREDITS + i.nonTechShortlisted * CREDIT_PER_SHORTLISTED_ASSESSMENT) *
      i.nonTechAnnualPositions;

  const proctoredInterviewCredits =
    (CREATION_CREDITS + i.techShortlisted * CREDIT_PER_SHORTLISTED_INTERVIEW) *
      i.techAnnualPositions +
    (CREATION_CREDITS + i.nonTechShortlisted * CREDIT_PER_SHORTLISTED_INTERVIEW) *
      i.nonTechAnnualPositions;

  const totalCredits =
    resumeShortlistCredits + proctoredAssessmentCredits + proctoredInterviewCredits;

  const resumeShortlistInr = resumeShortlistCredits * IN_PER_CREDIT;
  const proctoredAssessmentInr = proctoredAssessmentCredits * IN_PER_CREDIT;
  const proctoredInterviewInr = proctoredInterviewCredits * IN_PER_CREDIT;
  const subtotalBeforeDiscountInr = totalCredits * IN_PER_CREDIT;
  const finalAmountInr = subtotalBeforeDiscountInr * (1 - SKILLBREW_DISCOUNT);

  return {
    resumeShortlistCredits,
    resumeShortlistInr,
    proctoredAssessmentCredits,
    proctoredAssessmentInr,
    proctoredInterviewCredits,
    proctoredInterviewInr,
    subtotalBeforeDiscountInr,
    finalAmountInr,
  };
}

function estimateHours(i: RoiHiringInputs): HourEstimates {
  const shortlistHours =
    i.techResumesReceived * i.hrHoursPerResumeManualShortlist * i.techAnnualPositions +
    i.nonTechResumesReceived * i.hrHoursPerResumeManualShortlist * i.nonTechAnnualPositions;

  const schedulingHours =
    i.techShortlisted * i.interviewSchedulingHoursPerShortlisted * i.techAnnualPositions +
    i.nonTechShortlisted * i.interviewSchedulingHoursPerShortlisted * i.nonTechAnnualPositions;

  const expertFbHours =
    i.techShortlisted *
      (i.expertInterviewHoursPerShortlisted + i.feedbackManagerHoursPerShortlisted) *
      i.techAnnualPositions +
    i.nonTechShortlisted *
      (i.expertInterviewHoursPerShortlisted + i.feedbackManagerHoursPerShortlisted) *
      i.nonTechAnnualPositions;

  const currentTotalHours = shortlistHours + schedulingHours + expertFbHours;

  // Skillbrew: heavy automation on screening, scheduling, and structured feedback; illustrative remainder.
  const skillbrewEquivalentHours = Math.min(
    currentTotalHours * 0.12,
    i.techAnnualPositions * 3 + i.nonTechAnnualPositions * 2.5
  );

  const hoursSaved = Math.max(0, currentTotalHours - skillbrewEquivalentHours);

  return { currentTotalHours, skillbrewEquivalentHours, hoursSaved };
}

function impactFromResults(
  currentTotal: number,
  finalSkillbrew: number,
  hoursSaved: number
): ImpactMetrics {
  const revenueIncreasedInr = Math.max(0, currentTotal - finalSkillbrew);
  const ratio = currentTotal > 0 ? revenueIncreasedInr / currentTotal : 0;
  const moreAutomationPercent = Math.min(98, Math.round(58 + ratio * 38));
  const moreGoodHiresPercent = Math.min(52, Math.round(14 + ratio * 34));
  return {
    revenueIncreasedInr,
    hoursSaved: Math.round(hoursSaved),
    moreAutomationPercent,
    moreGoodHiresPercent,
  };
}

export function calculateRoiHiring(i: RoiHiringInputs): RoiHiringResults {
  const current = calculateCurrentCosts(i);
  const skillbrew = calculateSkillbrewCosts(i);
  const hours = estimateHours(i);
  const impact = impactFromResults(current.total, skillbrew.finalAmountInr, hours.hoursSaved);
  return { current, skillbrew, hours, impact };
}

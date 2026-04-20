/**
 * ROI hiring calculator: current manual process vs Skillbrew (credits).
 *
 * Benchmarks for default dummy values (India, 2024 to 2026 hiring context):
 * - Job boards / sourcing (Naukri + LinkedIn Recruiter Lite style): about 2 to 5 L/year is common for SMB teams; we use 2,40,000 INR.
 * - First-pass resume review: recruiters often cite about 10 to 25 minutes per CV; 0.22 hr is about 13 min.
 * - Scheduling / coordination per shortlisted candidate: about 1 to 2.5 hours of back-and-forth (HR time).
 * - Hiring-manager / expert panel time per shortlisted candidate: about 2 to 4 hours interviews; feedback loops add about 1 to 2 hours.
 * - HR and manager inputs are annual loaded cost (Rs); hourly rates use {@link WORKING_HOURS_FOR_ANNUAL_TO_HOURLY}.
 * - Typical defaults: HR role about Rs 5 L/year, manager/engineer about Rs 10 L/year (illustrative).
 */

/** Hours per year used to convert annual loaded cost into an effective hourly rate (8 h x ~250 days). */
export const WORKING_HOURS_FOR_ANNUAL_TO_HOURLY = 2000;

export function hourlyRateFromAnnualLoadedCost(annualInr: number): number {
  if (!Number.isFinite(annualInr) || annualInr <= 0) return 0;
  return annualInr / WORKING_HOURS_FOR_ANNUAL_TO_HOURLY;
}

export const CREATION_CREDITS = 100; // Assessment or Interview creation

/** Headcount band (employees). Drives INR per credit via {@link getInrPerCredit}. */
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';

export const COMPANY_SIZE_OPTIONS: readonly { value: CompanySize; label: string }[] = [
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-500', label: '201-500' },
  { value: '501-1000', label: '501-1,000' },
  { value: '1000+', label: '1000+' },
] as const;

const COMPANY_SIZE_SET: ReadonlySet<string> = new Set(
  COMPANY_SIZE_OPTIONS.map((o) => o.value)
);

/** INR charged per credit by company size (tiered pricing). */
export function getInrPerCredit(companySize: CompanySize): number {
  switch (companySize) {
    case '1-10':
    case '11-50':
    case '51-200':
      return 3;
    case '201-500':
      return 5;
    case '501-1000':
    case '1000+':
      return 10;
    default:
      return 10;
  }
}

export function companySizeLabel(size: CompanySize): string {
  const found = COMPANY_SIZE_OPTIONS.find((o) => o.value === size);
  return found?.label ?? size;
}
export const CREDIT_PER_RESUME_SHORTLIST = 1;
export const CREDIT_PER_SHORTLISTED_ASSESSMENT = 10;
export const CREDIT_PER_SHORTLISTED_INTERVIEW = 150;

/**
 * Discount by credit-value tier:
 * - Rs 3/credit => 30% off
 * - Rs 5 or Rs 10/credit => 50% off
 */
export function getSkillbrewDiscountRate(inrPerCredit: number): number {
  return inrPerCredit === 3 ? 0.3 : 0.5;
}

export interface RoiHiringInputs {
  companyName: string;
  companySize: CompanySize;
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
  /** Annual loaded cost for an HR / TA role used in shortlisting and scheduling (Rs/year). */
  hrRoleAnnualCost: number;
  /** Annual loaded cost for an experienced manager or engineer on interviews / feedback (Rs/year). */
  managerRoleAnnualCost: number;
}

/** Defaults grounded in typical India SMB / mid-market hiring (see file header). */
export const DEFAULT_ROI_INPUTS: RoiHiringInputs = {
  companyName: 'Brudite Pvt Ltd',
  companySize: '51-200',
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
  hrRoleAnnualCost: 500000,
  managerRoleAnnualCost: 1000000,
};

export interface CurrentCostBreakdown {
  resumeShortlistingCost: number;
  interviewSchedulingCost: number;
  interviewAndFeedbackCost: number;
  additionalCost: number;
  total: number;
}

export interface SkillbrewCostBreakdown {
  /** INR per credit for this company size tier. */
  inrPerCredit: number;
  /** Discount rate applied on subtotal for this tier (e.g. 0.3 => 30%). */
  discountRate: number;
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
  if (!COMPANY_SIZE_SET.has(i.companySize)) return false;
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
    i.hrRoleAnnualCost,
    i.managerRoleAnnualCost,
  ];
  if (!nums.every(safeNum)) return false;
  if (i.techAnnualPositions + i.nonTechAnnualPositions <= 0) return false;
  return true;
}

export function calculateCurrentCosts(i: RoiHiringInputs): CurrentCostBreakdown {
  const hrCostPerHour = hourlyRateFromAnnualLoadedCost(i.hrRoleAnnualCost);
  const managerCostPerHour = hourlyRateFromAnnualLoadedCost(i.managerRoleAnnualCost);

  const resumeShortlistingCost =
    i.techResumesReceived *
      i.hrHoursPerResumeManualShortlist *
      hrCostPerHour *
      i.techAnnualPositions +
    i.nonTechResumesReceived *
      i.hrHoursPerResumeManualShortlist *
      hrCostPerHour *
      i.nonTechAnnualPositions;

  const interviewSchedulingCost =
    i.techShortlisted *
      i.interviewSchedulingHoursPerShortlisted *
      hrCostPerHour *
      i.techAnnualPositions +
    i.nonTechShortlisted *
      i.interviewSchedulingHoursPerShortlisted *
      hrCostPerHour *
      i.nonTechAnnualPositions;

  const managerHoursPerShortlisted =
    i.expertInterviewHoursPerShortlisted + i.feedbackManagerHoursPerShortlisted;

  const interviewAndFeedbackCost =
    i.techShortlisted *
      managerHoursPerShortlisted *
      managerCostPerHour *
      i.techAnnualPositions +
    i.nonTechShortlisted *
      managerHoursPerShortlisted *
      managerCostPerHour *
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
  const inrPerCredit = getInrPerCredit(i.companySize);
  const discountRate = getSkillbrewDiscountRate(inrPerCredit);

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

  const resumeShortlistInr = resumeShortlistCredits * inrPerCredit;
  const proctoredAssessmentInr = proctoredAssessmentCredits * inrPerCredit;
  const proctoredInterviewInr = proctoredInterviewCredits * inrPerCredit;
  const subtotalBeforeDiscountInr = totalCredits * inrPerCredit;
  const finalAmountInr = subtotalBeforeDiscountInr * (1 - discountRate);

  return {
    inrPerCredit,
    discountRate,
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

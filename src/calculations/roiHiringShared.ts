/**
 * ROI hiring calculator shared primitives and core calculations.
 */

/** Hours per year used to convert annual loaded cost into an effective hourly rate (8 h x ~250 days). */
export const WORKING_HOURS_FOR_ANNUAL_TO_HOURLY = 2000;

export function hourlyRateFromAnnualLoadedCost(annualInr: number): number {
  if (!Number.isFinite(annualInr) || annualInr <= 0) return 0;
  return annualInr / WORKING_HOURS_FOR_ANNUAL_TO_HOURLY;
}

export const CREATION_CREDITS = 100; // Assessment or Interview creation

/** Headcount band (employees). */
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';

export const COMPANY_SIZE_OPTIONS: readonly { value: CompanySize; label: string }[] = [
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-500', label: '201-500' },
  { value: '501-1000', label: '501-1,000' },
  { value: '1000+', label: '1000+' },
] as const;

const COMPANY_SIZE_SET: ReadonlySet<string> = new Set(COMPANY_SIZE_OPTIONS.map((o) => o.value));

export function companySizeLabel(size: CompanySize): string {
  const found = COMPANY_SIZE_OPTIONS.find((o) => o.value === size);
  return found?.label ?? size;
}
export const CREDIT_PER_RESUME_SHORTLIST = 1;
export const CREDIT_PER_SHORTLISTED_ASSESSMENT = 10;
export const CREDIT_PER_SHORTLISTED_INTERVIEW = 150;

export interface RoiHiringInputs {
  companyName: string;
  companySize: CompanySize;
  techAnnualPositions: number;
  nonTechAnnualPositions: number;
  techResumesReceived: number;
  nonTechResumesReceived: number;
  techShortlisted: number;
  nonTechShortlisted: number;
  hrHoursPerResumeManualShortlist: number;
  interviewSchedulingHoursPerShortlisted: number;
  expertInterviewHoursPerShortlisted: number;
  feedbackManagerHoursPerShortlisted: number;
  jobBoardAnnualCost: number;
  hrRoleAnnualCost: number;
  managerRoleAnnualCost: number;
  skillbrewCreditValue: number;
  skillbrewDiscountPercent: number;
}

export interface CurrentCostBreakdown {
  resumeShortlistingCost: number;
  interviewSchedulingCost: number;
  interviewAndFeedbackCost: number;
  additionalCost: number;
  total: number;
}

export interface SkillbrewCostBreakdown {
  inrPerCredit: number;
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
  currentTotalHours: number;
  skillbrewEquivalentHours: number;
  hoursSaved: number;
}

export interface ImpactMetrics {
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

export function validateRoiInputsBase(i: RoiHiringInputs): boolean {
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
    i.skillbrewCreditValue,
    i.skillbrewDiscountPercent,
  ];
  if (!nums.every(safeNum)) return false;
  if (i.skillbrewCreditValue <= 0) return false;
  if (i.skillbrewDiscountPercent > 100) return false;
  if (i.techAnnualPositions + i.nonTechAnnualPositions <= 0) return false;
  return true;
}

export function calculateCurrentCosts(i: RoiHiringInputs): CurrentCostBreakdown {
  const hrCostPerHour = hourlyRateFromAnnualLoadedCost(i.hrRoleAnnualCost);
  const managerCostPerHour = hourlyRateFromAnnualLoadedCost(i.managerRoleAnnualCost);

  const resumeShortlistingCost =
    i.techResumesReceived * i.hrHoursPerResumeManualShortlist * hrCostPerHour * i.techAnnualPositions +
    i.nonTechResumesReceived * i.hrHoursPerResumeManualShortlist * hrCostPerHour * i.nonTechAnnualPositions;

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
    i.techShortlisted * managerHoursPerShortlisted * managerCostPerHour * i.techAnnualPositions +
    i.nonTechShortlisted * managerHoursPerShortlisted * managerCostPerHour * i.nonTechAnnualPositions;

  const additionalCost = i.jobBoardAnnualCost;

  const total =
    resumeShortlistingCost + interviewSchedulingCost + interviewAndFeedbackCost + additionalCost;

  return {
    resumeShortlistingCost,
    interviewSchedulingCost,
    interviewAndFeedbackCost,
    additionalCost,
    total,
  };
}

export function calculateSkillbrewCosts(i: RoiHiringInputs): SkillbrewCostBreakdown {
  const inrPerCredit = i.skillbrewCreditValue;
  const discountRate = i.skillbrewDiscountPercent / 100;

  const resumeShortlistCredits =
    i.techResumesReceived * CREDIT_PER_RESUME_SHORTLIST * i.techAnnualPositions +
    i.nonTechResumesReceived * CREDIT_PER_RESUME_SHORTLIST * i.nonTechAnnualPositions;

  const proctoredAssessmentCredits =
    (CREATION_CREDITS + i.techShortlisted * CREDIT_PER_SHORTLISTED_ASSESSMENT) * i.techAnnualPositions +
    (CREATION_CREDITS + i.nonTechShortlisted * CREDIT_PER_SHORTLISTED_ASSESSMENT) *
      i.nonTechAnnualPositions;

  const proctoredInterviewCredits =
    (CREATION_CREDITS + i.techShortlisted * CREDIT_PER_SHORTLISTED_INTERVIEW) * i.techAnnualPositions +
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

export function calculateRoiHiringCore(i: RoiHiringInputs): RoiHiringResults {
  const current = calculateCurrentCosts(i);
  const skillbrew = calculateSkillbrewCosts(i);
  const hours = estimateHours(i);
  const impact = impactFromResults(current.total, skillbrew.finalAmountInr, hours.hoursSaved);
  return { current, skillbrew, hours, impact };
}

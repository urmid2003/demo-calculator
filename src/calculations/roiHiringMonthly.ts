import { DEFAULT_ROI_INPUTS_ANNUAL } from './roiHiringAnnual';
import {
  calculateRoiHiringCore,
  validateRoiInputsBase,
  type CurrentCostBreakdown,
  type HourEstimates,
  type RoiHiringInputs,
  type RoiHiringResults,
  type SkillbrewCostBreakdown,
} from './roiHiringShared';

const MONTHS_IN_YEAR = 12;

function mapMonthlyToAnnualInput(i: RoiHiringInputs): RoiHiringInputs {
  return {
    ...i,
    techAnnualPositions: i.techAnnualPositions * MONTHS_IN_YEAR,
    nonTechAnnualPositions: i.nonTechAnnualPositions * MONTHS_IN_YEAR,
    jobBoardAnnualCost: i.jobBoardAnnualCost * MONTHS_IN_YEAR,
    hrRoleAnnualCost: i.hrRoleAnnualCost * MONTHS_IN_YEAR,
    managerRoleAnnualCost: i.managerRoleAnnualCost * MONTHS_IN_YEAR,
  };
}

function toMonthlyCurrent(c: CurrentCostBreakdown): CurrentCostBreakdown {
  return {
    resumeShortlistingCost: c.resumeShortlistingCost / MONTHS_IN_YEAR,
    interviewSchedulingCost: c.interviewSchedulingCost / MONTHS_IN_YEAR,
    interviewAndFeedbackCost: c.interviewAndFeedbackCost / MONTHS_IN_YEAR,
    additionalCost: c.additionalCost / MONTHS_IN_YEAR,
    total: c.total / MONTHS_IN_YEAR,
  };
}

function toMonthlySkillbrew(s: SkillbrewCostBreakdown): SkillbrewCostBreakdown {
  return {
    ...s,
    resumeShortlistCredits: s.resumeShortlistCredits / MONTHS_IN_YEAR,
    resumeShortlistInr: s.resumeShortlistInr / MONTHS_IN_YEAR,
    proctoredAssessmentCredits: s.proctoredAssessmentCredits / MONTHS_IN_YEAR,
    proctoredAssessmentInr: s.proctoredAssessmentInr / MONTHS_IN_YEAR,
    proctoredInterviewCredits: s.proctoredInterviewCredits / MONTHS_IN_YEAR,
    proctoredInterviewInr: s.proctoredInterviewInr / MONTHS_IN_YEAR,
    subtotalBeforeDiscountInr: s.subtotalBeforeDiscountInr / MONTHS_IN_YEAR,
    finalAmountInr: s.finalAmountInr / MONTHS_IN_YEAR,
  };
}

function toMonthlyHours(h: HourEstimates): HourEstimates {
  return {
    currentTotalHours: h.currentTotalHours / MONTHS_IN_YEAR,
    skillbrewEquivalentHours: h.skillbrewEquivalentHours / MONTHS_IN_YEAR,
    hoursSaved: h.hoursSaved / MONTHS_IN_YEAR,
  };
}

export const DEFAULT_ROI_INPUTS_MONTHLY: RoiHiringInputs = {
  ...DEFAULT_ROI_INPUTS_ANNUAL,
  techAnnualPositions: Math.round(DEFAULT_ROI_INPUTS_ANNUAL.techAnnualPositions / MONTHS_IN_YEAR),
  nonTechAnnualPositions: Math.round(
    DEFAULT_ROI_INPUTS_ANNUAL.nonTechAnnualPositions / MONTHS_IN_YEAR
  ),
  jobBoardAnnualCost: Math.round(DEFAULT_ROI_INPUTS_ANNUAL.jobBoardAnnualCost / MONTHS_IN_YEAR),
  hrRoleAnnualCost: Math.round(DEFAULT_ROI_INPUTS_ANNUAL.hrRoleAnnualCost / MONTHS_IN_YEAR),
  managerRoleAnnualCost: Math.round(DEFAULT_ROI_INPUTS_ANNUAL.managerRoleAnnualCost / MONTHS_IN_YEAR),
};

export function validateRoiInputsMonthly(i: RoiHiringInputs): boolean {
  return validateRoiInputsBase(i);
}

export function calculateRoiHiringMonthly(i: RoiHiringInputs): RoiHiringResults {
  const annualized = mapMonthlyToAnnualInput(i);
  const annualResult = calculateRoiHiringCore(annualized);
  return {
    current: toMonthlyCurrent(annualResult.current),
    skillbrew: toMonthlySkillbrew(annualResult.skillbrew),
    hours: toMonthlyHours(annualResult.hours),
    impact: {
      ...annualResult.impact,
      revenueIncreasedInr: annualResult.impact.revenueIncreasedInr / MONTHS_IN_YEAR,
      hoursSaved: Math.round(annualResult.impact.hoursSaved / MONTHS_IN_YEAR),
    },
  };
}

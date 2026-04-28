import {
  calculateRoiHiringCore,
  validateRoiInputsBase,
  type RoiHiringInputs,
  type RoiHiringResults,
} from './roiHiringShared';

/** Defaults grounded in typical India SMB / mid-market hiring (annual view). */
export const DEFAULT_ROI_INPUTS_ANNUAL: RoiHiringInputs = {
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
  skillbrewCreditValue: 3,
  skillbrewDiscountPercent: 30,
};

export function validateRoiInputsAnnual(i: RoiHiringInputs): boolean {
  return validateRoiInputsBase(i);
}

export function calculateRoiHiringAnnual(i: RoiHiringInputs): RoiHiringResults {
  return calculateRoiHiringCore(i);
}

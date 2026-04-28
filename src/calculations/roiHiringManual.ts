import { DEFAULT_ROI_INPUTS_ANNUAL } from './roiHiringAnnual';
import {
  calculateRoiHiringCore,
  validateRoiInputsBase,
  type RoiHiringInputs,
  type RoiHiringResults,
} from './roiHiringShared';

/**
 * Manual tab uses the same formula as annual mode,
 * but stays isolated in its own module for future custom logic.
 */
export const DEFAULT_ROI_INPUTS_MANUAL: RoiHiringInputs = {
  ...DEFAULT_ROI_INPUTS_ANNUAL,
};

export function validateRoiInputsManual(i: RoiHiringInputs): boolean {
  return validateRoiInputsBase(i);
}

export function calculateRoiHiringManual(i: RoiHiringInputs): RoiHiringResults {
  return calculateRoiHiringCore(i);
}

export type ProctoringMode = 'proctored' | 'unproctored';

export interface ManualPlannerInputs {
  creditsOwned: number;
  creditValue: number;
  assessmentsWanted: number;
  interviewsWanted: number;
  assessmentMode: ProctoringMode;
  interviewMode: ProctoringMode;
}

export interface ManualPlannerResults {
  assessmentCreditsPerCandidate: number;
  interviewCreditsPerCandidate: number;
  maxAssessmentsFromCredits: number;
  maxInterviewsFromCredits: number;
  assessmentCreditsNeeded: number;
  interviewCreditsNeeded: number;
  totalCreditsNeeded: number;
  creditsBalance: number;
  totalBudgetValueInr: number;
}

const ASSESSMENT_CREDITS_PROCTORED = 10;
const ASSESSMENT_CREDITS_UNPROCTORED = 6;
const INTERVIEW_CREDITS_PROCTORED = 150;
const INTERVIEW_CREDITS_UNPROCTORED = 100;

export const DEFAULT_MANUAL_PLANNER_INPUTS: ManualPlannerInputs = {
  creditsOwned: 10000,
  creditValue: 3,
  assessmentsWanted: 0,
  interviewsWanted: 0,
  assessmentMode: 'proctored',
  interviewMode: 'proctored',
};

export function validateManualPlannerInputs(i: ManualPlannerInputs): boolean {
  const nums = [i.creditsOwned, i.creditValue, i.assessmentsWanted, i.interviewsWanted];
  if (!nums.every((n) => Number.isFinite(n) && n >= 0)) return false;
  if (i.creditValue <= 0) return false;
  if (i.assessmentsWanted <= 0 && i.interviewsWanted <= 0) return false;
  return true;
}

export function calculateManualPlanner(i: ManualPlannerInputs): ManualPlannerResults {
  const assessmentCreditsPerCandidate =
    i.assessmentMode === 'proctored'
      ? ASSESSMENT_CREDITS_PROCTORED
      : ASSESSMENT_CREDITS_UNPROCTORED;
  const interviewCreditsPerCandidate =
    i.interviewMode === 'proctored' ? INTERVIEW_CREDITS_PROCTORED : INTERVIEW_CREDITS_UNPROCTORED;

  const maxAssessmentsFromCredits =
    assessmentCreditsPerCandidate > 0 ? Math.floor(i.creditsOwned / assessmentCreditsPerCandidate) : 0;
  const maxInterviewsFromCredits =
    interviewCreditsPerCandidate > 0 ? Math.floor(i.creditsOwned / interviewCreditsPerCandidate) : 0;

  const assessmentCreditsNeeded = i.assessmentsWanted * assessmentCreditsPerCandidate;
  const interviewCreditsNeeded = i.interviewsWanted * interviewCreditsPerCandidate;
  const totalCreditsNeeded = assessmentCreditsNeeded + interviewCreditsNeeded;
  const creditsBalance = i.creditsOwned - totalCreditsNeeded;
  const totalBudgetValueInr = i.creditsOwned * i.creditValue;

  return {
    assessmentCreditsPerCandidate,
    interviewCreditsPerCandidate,
    maxAssessmentsFromCredits,
    maxInterviewsFromCredits,
    assessmentCreditsNeeded,
    interviewCreditsNeeded,
    totalCreditsNeeded,
    creditsBalance,
    totalBudgetValueInr,
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────
export const hrRate = (monthly: number) => monthly / (22 * 8);

// ─── types ──────────────────────────────────────────────────────────────────
export interface CalcInputs {
  // Step 1
  num_positions: number;
  num_departments: number;
  candidates_per_job: number;
  shortlisted_per_job: number;
  hr_team_size: number;
  offer_acceptance: number;
  // Step 2
  jd_time: number;
  jd_salary: number;
  jd_revisions: number;
  platforms: Record<string, boolean>;
  platform_cost: number;
  posting_time: number;
  reposts: number;
  // Step 3
  resume_time: number;
  screening_salary: number;
  second_review_time: number;
  second_review_pct: number;
  // Step 4
  call_duration: number;
  scheduling_time: number;
  caller_salary: number;
  interview_rounds: number;
  interview_duration: number;
  num_interviewers: number;
  interviewer_salary: number;
  interview_conversion: number;
  coord_hours: number;
  coord_salary: number;
  // Step 5
  sb_jd_time: number;
  sb_cost: number;
  sb_db_pct: number;
  sb_screen_sec: number;
  sb_hr_review: number;
  manual_assess_time: number;
  sb_assess_time: number;
  sb_assess_pct: number;
  manual_eval_time: number;
  interview_mode: 'full_ai' | 'hybrid' | 'full_manual';
  sb_interview_time: number;
  sb_coord_reduction: number;
  // Step 6
  cr_assess_proct_created: number;
  cr_assess_unproct_created: number;
  cr_assess_proct_cands: number;
  cr_assess_unproct_cands: number;
  cr_int_proct_created: number;
  cr_int_unproct_created: number;
  cr_int_proct_cands: number;
  cr_int_unproct_cands: number;
}

export interface RequirementsResult {
  totalCandidates: number;
  totalShortlisted: number;
  expectedHires: number;
}

export interface TraditionalResult {
  jdCost: number;
  totalJDHours: number;
  annualPlatformCost: number;
  postingHours: number;
  postingCost: number;
  totalScreenHours: number;
  screenCost: number;
  callHours: number;
  callCost: number;
  interviewHours: number;
  interviewCost: number;
  coordHours: number;
  coordCost: number;
  totalCost: number;
  totalHours: number;
}

export interface SkillbrewResult {
  sbJDHours: number;
  sbJDCost: number;
  sbPlatformCost: number;
  sbPostingHours: number;
  sbScreenHours: number;
  sbScreenCost: number;
  sbCallHours: number;
  sbCallCost: number;
  sbInterviewHours: number;
  sbInterviewCost: number;
  sbCoordHours: number;
  sbCoordCost: number;
  totalCost: number;
  totalHours: number;
}

export interface CreditsResult {
  assessCreationCredits: number;
  assessCompletionCredits: number;
  assessTotalCredits: number;
  assessCreditCost: number;
  intCreationCredits: number;
  intCompletionCredits: number;
  intTotalCredits: number;
  intCreditCost: number;
  totalCredits: number;
  totalCreditCost: number;
}

export interface FinalResult {
  costSaved: number;
  hoursSaved: number;
  daysSaved: number;
  efficiencyPct: number;
  roiMultiple: number;
  costPerHireTrad: number;
  costPerHireSB: number;
  costPerHireSavings: number;
  creditCostPerCandidate: number;
  creditCostPerHire: number;
  totalHires: number;
  totalCandidates: number;
}

// ─── calc functions ──────────────────────────────────────────────────────────

export function calcRequirements(i: CalcInputs): RequirementsResult {
  const totalCandidates = i.num_positions * i.candidates_per_job;
  const totalShortlisted = i.num_positions * i.shortlisted_per_job;
  const expectedHires = Math.round(totalShortlisted * (i.offer_acceptance / 100) * 0.5);
  return { totalCandidates, totalShortlisted, expectedHires };
}

export function platformCount(platforms: Record<string, boolean>): number {
  return Object.values(platforms).filter(Boolean).length;
}

export function calcTraditional(i: CalcInputs): TraditionalResult {
  const pos = i.num_positions;
  const totalResumes = pos * i.candidates_per_job;
  const totalShortlisted = pos * i.shortlisted_per_job;

  const totalJDHours = pos * i.jd_time * (1 + i.jd_revisions * 0.3);
  const jdCost = totalJDHours * hrRate(i.jd_salary);

  const numPlatforms = platformCount(i.platforms);
  const annualPlatformCost = numPlatforms * i.platform_cost * 12;
  const totalPostings = pos * (1 + i.reposts);
  const postingHours = (totalPostings * i.posting_time) / 60;
  const postingCost = postingHours * hrRate(i.jd_salary);

  const screenHours = (totalResumes * i.resume_time) / 60;
  const secHours = (totalResumes * (i.second_review_pct / 100) * i.second_review_time) / 60;
  const totalScreenHours = screenHours + secHours;
  const screenCost = totalScreenHours * hrRate(i.screening_salary);

  const callHours = (totalShortlisted * (i.call_duration + i.scheduling_time)) / 60;
  const callCost = callHours * hrRate(i.caller_salary);

  let interviewHours = 0;
  let candidatesInRound = totalShortlisted * (i.interview_conversion / 100);
  for (let r = 0; r < i.interview_rounds; r++) {
    interviewHours += (candidatesInRound * i.interview_duration * i.num_interviewers) / 60;
    candidatesInRound *= 0.5;
  }
  const interviewCost = interviewHours * hrRate(i.interviewer_salary);

  const coordHours = pos * i.coord_hours;
  const coordCost = coordHours * hrRate(i.coord_salary);

  const totalCost = jdCost + annualPlatformCost + postingCost + screenCost + callCost + interviewCost + coordCost;
  const totalHours = totalJDHours + postingHours + totalScreenHours + callHours + interviewHours + coordHours;

  return {
    jdCost, totalJDHours, annualPlatformCost, postingHours, postingCost,
    totalScreenHours, screenCost, callHours, callCost,
    interviewHours, interviewCost, coordHours, coordCost, totalCost, totalHours,
  };
}

export function calcSkillbrew(i: CalcInputs, trad: TraditionalResult): SkillbrewResult {
  const pos = i.num_positions;
  const totalResumes = pos * i.candidates_per_job;
  const totalShortlisted = pos * i.shortlisted_per_job;

  const sbJDHours = pos * (i.sb_jd_time / 60);
  const sbJDCost = sbJDHours * hrRate(i.jd_salary);
  const sbPlatformCost = 0;
  const sbPostingHours = sbJDHours * 0.1;

  const sbScreenHours =
    (totalResumes * i.sb_screen_sec) / 3600 +
    (totalShortlisted * i.sb_hr_review) / 60;
  const sbScreenCost = sbScreenHours * hrRate(i.screening_salary);

  const assessPct = i.sb_assess_pct / 100;
  const sbCallHours = trad.callHours * (1 - assessPct * 0.4);
  const sbCallCost = sbCallHours * hrRate(i.caller_salary);

  const modeReduction =
    i.interview_mode === 'full_ai' ? 0.85
    : i.interview_mode === 'hybrid' ? 0.55 : 0;
  const sbInterviewHours = trad.interviewHours * (1 - modeReduction);
  const sbInterviewCost = sbInterviewHours * hrRate(i.interviewer_salary);

  const sbCoordHours = trad.coordHours * (1 - i.sb_coord_reduction / 100);
  const sbCoordCost = sbCoordHours * hrRate(i.coord_salary);

  const totalHours = sbJDHours + sbPostingHours + sbScreenHours + sbCallHours + sbInterviewHours + sbCoordHours;

  return {
    sbJDHours, sbJDCost, sbPlatformCost, sbPostingHours,
    sbScreenHours, sbScreenCost, sbCallHours, sbCallCost,
    sbInterviewHours, sbInterviewCost, sbCoordHours, sbCoordCost,
    totalCost: 0, // computed in calcResults after credits
    totalHours,
  };
}

const CREDIT_RATE = 10;

export function calcCredits(i: CalcInputs): CreditsResult {
  const assessCreationCredits = i.cr_assess_proct_created * 100 + i.cr_assess_unproct_created * 50;
  const assessCompletionCredits = i.cr_assess_proct_cands * 10 + i.cr_assess_unproct_cands * 5;
  const assessTotalCredits = assessCreationCredits + assessCompletionCredits;
  const assessCreditCost = assessTotalCredits * CREDIT_RATE;

  const intCreationCredits = i.cr_int_proct_created * 100 + i.cr_int_unproct_created * 50;
  const intCompletionCredits = i.cr_int_proct_cands * 100 + i.cr_int_unproct_cands * 50;
  const intTotalCredits = intCreationCredits + intCompletionCredits;
  const intCreditCost = intTotalCredits * CREDIT_RATE;

  const totalCredits = assessTotalCredits + intTotalCredits;
  const totalCreditCost = totalCredits * CREDIT_RATE;

  return {
    assessCreationCredits, assessCompletionCredits, assessTotalCredits, assessCreditCost,
    intCreationCredits, intCompletionCredits, intTotalCredits, intCreditCost,
    totalCredits, totalCreditCost,
  };
}

export function calcResults(
  i: CalcInputs,
  trad: TraditionalResult,
  sb: SkillbrewResult,
  credits: CreditsResult,
): { final: FinalResult; totalSBCost: number } {
  const totalCandidates = Math.max(1, i.num_positions * i.candidates_per_job);
  const totalShortlisted = i.num_positions * i.shortlisted_per_job;
  const totalHires = Math.max(1, Math.round(totalShortlisted * (i.offer_acceptance / 100) * 0.5));

  const totalSBCost =
    i.sb_cost + sb.sbJDCost + sb.sbScreenCost + sb.sbCallCost +
    sb.sbInterviewCost + sb.sbCoordCost + credits.totalCreditCost;

  const costSaved = Math.max(0, trad.totalCost - totalSBCost);
  const hoursSaved = Math.max(0, trad.totalHours - sb.totalHours);
  const daysSaved = Math.round(hoursSaved / 8);
  const efficiencyPct = Math.round((hoursSaved / Math.max(1, trad.totalHours)) * 100);
  const roiMultiple = costSaved / Math.max(1, i.sb_cost + credits.totalCreditCost);

  return {
    totalSBCost,
    final: {
      costSaved, hoursSaved, daysSaved,
      efficiencyPct: Math.max(0, efficiencyPct),
      roiMultiple: Math.max(0, roiMultiple),
      costPerHireTrad: trad.totalCost / totalHires,
      costPerHireSB: totalSBCost / totalHires,
      costPerHireSavings: Math.max(0, costSaved / totalHires),
      creditCostPerCandidate: credits.totalCreditCost / totalCandidates,
      creditCostPerHire: credits.totalCreditCost / totalHires,
      totalHires,
      totalCandidates,
    },
  };
}

import React, { useEffect, useMemo, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import logo from '../Skillbrew Logo.svg';
import {
  COMPANY_SIZE_OPTIONS,
  type CompanySize,
  type RoiHiringInputs,
} from '../calculations/roiHiring';
import {
  DEFAULT_ROI_INPUTS_ANNUAL,
  calculateRoiHiringAnnual,
  validateRoiInputsAnnual,
} from '../calculations/roiHiringAnnual';
import {
  DEFAULT_ROI_INPUTS_MONTHLY,
  calculateRoiHiringMonthly,
  validateRoiInputsMonthly,
} from '../calculations/roiHiringMonthly';
import {
  DEFAULT_ROI_INPUTS_MANUAL,
  DEFAULT_MANUAL_PLANNER_INPUTS,
  calculateManualPlanner,
  calculateRoiHiringManual,
  type ManualPlannerInputs,
  type ProctoringMode,
  validateManualPlannerInputs,
  validateRoiInputsManual,
} from '../calculations/roiHiringManual';
import { downloadRoiPdf } from '../utils/roiPdf';
import { Clock, Download, IndianRupee, Target, Zap } from 'lucide-react';

const springConfig = { bounce: 0, damping: 24, stiffness: 70 };

const formatInr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const formatInrCompact = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)} k`;
  return formatInr(val);
};

/** Count-up for impact cards in the With Skillbrew column only. */
const CountInrCompact: React.FC<{ value: number }> = ({ value }) => {
  const spring = useSpring(0, springConfig);
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  const display = useTransform(spring, (v) => formatInrCompact(v));
  return <motion.span>{display}</motion.span>;
};

const CountInt: React.FC<{ value: number }> = ({ value }) => {
  const spring = useSpring(0, springConfig);
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString('en-IN'));
  return <motion.span>{display}</motion.span>;
};

const CountPercent: React.FC<{ value: number }> = ({ value }) => {
  const spring = useSpring(0, springConfig);
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  const display = useTransform(spring, (v) => `${Math.round(v)}%`);
  return <motion.span>{display}</motion.span>;
};

type RoiMode = 'annual' | 'monthly' | 'manual';

const MODE_LABEL: Record<RoiMode, string> = {
  annual: 'Annually',
  monthly: 'Monthly',
  manual: 'Manual',
};

export const RoiCalculator: React.FC = () => {
  const [activeMode, setActiveMode] = useState<RoiMode>('annual');
  const [modeInputs, setModeInputs] = useState<Record<RoiMode, RoiHiringInputs>>({
    annual: { ...DEFAULT_ROI_INPUTS_ANNUAL },
    monthly: { ...DEFAULT_ROI_INPUTS_MONTHLY },
    manual: { ...DEFAULT_ROI_INPUTS_MANUAL },
  });
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [manualPlannerInputs, setManualPlannerInputs] =
    useState<ManualPlannerInputs>(DEFAULT_MANUAL_PLANNER_INPUTS);

  const inputs = modeInputs[activeMode];

  const validateActiveInputs = useMemo(() => {
    if (activeMode === 'monthly') return validateRoiInputsMonthly;
    if (activeMode === 'manual') return validateRoiInputsManual;
    return validateRoiInputsAnnual;
  }, [activeMode]);

  const calculateActiveResults = useMemo(() => {
    if (activeMode === 'monthly') return calculateRoiHiringMonthly;
    if (activeMode === 'manual') return calculateRoiHiringManual;
    return calculateRoiHiringAnnual;
  }, [activeMode]);

  const valid = useMemo(() => validateActiveInputs(inputs), [inputs, validateActiveInputs]);
  const results = useMemo(() => calculateActiveResults(inputs), [inputs, calculateActiveResults]);
  const manualPlannerValid = useMemo(
    () => validateManualPlannerInputs(manualPlannerInputs),
    [manualPlannerInputs]
  );
  const manualPlannerResults = useMemo(
    () => calculateManualPlanner(manualPlannerInputs),
    [manualPlannerInputs]
  );

  const setNum =
    (key: keyof RoiHiringInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (v === '') {
        setModeInputs((prev) => ({
          ...prev,
          [activeMode]: { ...prev[activeMode], [key]: 0 as never },
        }));
        return;
      }
      const n = Number(v);
      if (!Number.isFinite(n)) return;
      setModeInputs((prev) => ({
        ...prev,
        [activeMode]: { ...prev[activeMode], [key]: n as never },
      }));
    };

  const setCompany = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModeInputs((prev) => ({
      ...prev,
      [activeMode]: { ...prev[activeMode], companyName: e.target.value },
    }));
  };

  const setCompanySize = (size: CompanySize) => {
    setModeInputs((prev) => ({
      ...prev,
      [activeMode]: { ...prev[activeMode], companySize: size },
    }));
  };

  const setManualNum =
    (key: keyof Pick<ManualPlannerInputs, 'creditsOwned' | 'creditValue' | 'assessmentsWanted' | 'interviewsWanted'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (v === '') {
        setManualPlannerInputs((prev) => ({ ...prev, [key]: 0 }));
        return;
      }
      const n = Number(v);
      if (!Number.isFinite(n)) return;
      setManualPlannerInputs((prev) => ({ ...prev, [key]: n }));
    };

  const setManualMode = (key: 'assessmentMode' | 'interviewMode', value: ProctoringMode) => {
    setManualPlannerInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleGetReport = () => {
    if (activeMode === 'manual') {
      if (!manualPlannerValid) {
        setFormError(
          'Enter valid manual values. At least one of "assessments wanted" or "interviews wanted" is required.'
        );
        return;
      }
      setFormError(null);
      setReportUnlocked(true);
      return;
    }
    if (!validateActiveInputs(inputs)) {
      setFormError('Please fill every field with a valid number (tech + non-tech positions cannot both be zero).');
      return;
    }
    setFormError(null);
    setReportUnlocked(true);
  };

  const handleDownloadPdf = () => {
    if (activeMode === 'manual') return;
    void downloadRoiPdf(inputs, results, { modeLabel: MODE_LABEL[activeMode] }).catch((err) => {
      console.error('PDF export failed', err);
    });
  };

  const isMonthly = activeMode === 'monthly';
  const isManual = activeMode === 'manual';
  const periodLabel = isMonthly ? 'monthly' : activeMode === 'manual' ? 'manual' : 'annual';
  const positionsLabel = isMonthly ? 'Monthly' : activeMode === 'manual' ? 'Manual' : 'Annual';
  const jobBoardLabel = isMonthly ? 'monthly' : activeMode === 'manual' ? 'manual' : 'annual';

  return (
    <div className="container">
      <div className="calc-wrapper">
        <header className="calc-header">
          <div className="title-row">
            <img src={logo} alt="Skillbrew Logo" className="header-logo" />
            <h1 className="calc-title">BrewGain</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            See how much time and money you save with SkillBrew
          </p>
          <div className="roi-mode-tabs" role="tablist" aria-label="ROI mode">
            {(Object.keys(MODE_LABEL) as RoiMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={activeMode === mode}
                className={`roi-mode-tab ${activeMode === mode ? 'roi-mode-tab--active' : ''}`}
                onClick={() => {
                  setActiveMode(mode);
                  setReportUnlocked(false);
                  setFormError(null);
                }}
              >
                {MODE_LABEL[mode]}
              </button>
            ))}
          </div>
        </header>

        <div className="roi-two-col">
          {isManual ? (
            <>
              <section className="roi-col roi-col-current">
                <h2 className="roi-col-heading">Manual Input</h2>

                <div className="roi-field-grid">
                  <div className="roi-field">
                    <label htmlFor="manualCreditsOwned">How many credits do you have?</label>
                    <input
                      id="manualCreditsOwned"
                      className="lc-input"
                      type="number"
                      min={0}
                      step={1}
                      value={manualPlannerInputs.creditsOwned || ''}
                      onChange={setManualNum('creditsOwned')}
                    />
                  </div>
                  <div className="roi-field">
                    <label htmlFor="manualCreditValue">Credit value (Rs per credit)</label>
                    <input
                      id="manualCreditValue"
                      className="lc-input"
                      type="number"
                      min={0}
                      step={0.01}
                      value={manualPlannerInputs.creditValue || ''}
                      onChange={setManualNum('creditValue')}
                    />
                  </div>
                </div>

                <div className="roi-field-grid">
                  <div className="roi-field">
                    <label htmlFor="manualAssessmentsWanted">How many assessments do you want?</label>
                    <input
                      id="manualAssessmentsWanted"
                      className="lc-input"
                      type="number"
                      min={0}
                      step={1}
                      value={manualPlannerInputs.assessmentsWanted || ''}
                      onChange={setManualNum('assessmentsWanted')}
                    />
                  </div>
                  <div className="roi-field">
                    <label htmlFor="manualInterviewsWanted">How many interviews do you want?</label>
                    <input
                      id="manualInterviewsWanted"
                      className="lc-input"
                      type="number"
                      min={0}
                      step={1}
                      value={manualPlannerInputs.interviewsWanted || ''}
                      onChange={setManualNum('interviewsWanted')}
                    />
                  </div>
                </div>

                <div className="roi-field-grid">
                  <div className="roi-field">
                    <span className="roi-field-label-text">Assessment mode</span>
                    <div className="roi-size-pills" role="group" aria-label="Assessment proctoring mode">
                      <button
                        type="button"
                        className={`roi-size-pill ${manualPlannerInputs.assessmentMode === 'proctored' ? 'roi-size-pill--active' : ''}`}
                        onClick={() => setManualMode('assessmentMode', 'proctored')}
                        aria-pressed={manualPlannerInputs.assessmentMode === 'proctored'}
                      >
                        Proctored
                      </button>
                      <button
                        type="button"
                        className={`roi-size-pill ${manualPlannerInputs.assessmentMode === 'unproctored' ? 'roi-size-pill--active' : ''}`}
                        onClick={() => setManualMode('assessmentMode', 'unproctored')}
                        aria-pressed={manualPlannerInputs.assessmentMode === 'unproctored'}
                      >
                        Unproctored
                      </button>
                    </div>
                  </div>
                  <div className="roi-field">
                    <span className="roi-field-label-text">Interview mode</span>
                    <div className="roi-size-pills" role="group" aria-label="Interview proctoring mode">
                      <button
                        type="button"
                        className={`roi-size-pill ${manualPlannerInputs.interviewMode === 'proctored' ? 'roi-size-pill--active' : ''}`}
                        onClick={() => setManualMode('interviewMode', 'proctored')}
                        aria-pressed={manualPlannerInputs.interviewMode === 'proctored'}
                      >
                        Proctored
                      </button>
                      <button
                        type="button"
                        className={`roi-size-pill ${manualPlannerInputs.interviewMode === 'unproctored' ? 'roi-size-pill--active' : ''}`}
                        onClick={() => setManualMode('interviewMode', 'unproctored')}
                        aria-pressed={manualPlannerInputs.interviewMode === 'unproctored'}
                      >
                        Unproctored
                      </button>
                    </div>
                  </div>
                </div>

                {formError && <p className="roi-form-error">{formError}</p>}
                <button type="button" className="lc-button roi-report-btn" onClick={handleGetReport}>
                  Get your report
                </button>
              </section>

              <section
                className={`roi-col roi-col-skillbrew ${!reportUnlocked ? 'roi-col-skillbrew--locked' : ''}`}
                aria-hidden={!reportUnlocked}
              >
                {!reportUnlocked && (
                  <div className="roi-skillbrew-lock-overlay">
                    <p className="roi-skillbrew-lock-title">Manual details</p>
                    <p className="roi-skillbrew-lock-text">
                      Fill manual fields, then click <strong>Get your report</strong> to unlock this
                      column.
                    </p>
                  </div>
                )}

                <div className={!reportUnlocked ? 'roi-skillbrew-inner--blur' : ''}>
                  <h2 className="roi-col-heading">Manual Capacity Details</h2>
                  <div className="roi-current-summary">
                    <div className="roi-current-summary-row">
                      <span>Total credit value</span>
                      <strong>{formatInr(manualPlannerResults.totalBudgetValueInr)}</strong>
                    </div>
                    <div className="roi-current-summary-row">
                      <span>Assessment credits per candidate</span>
                      <strong>{manualPlannerResults.assessmentCreditsPerCandidate} C</strong>
                    </div>
                    <div className="roi-current-summary-row">
                      <span>Interview credits per candidate</span>
                      <strong>{manualPlannerResults.interviewCreditsPerCandidate} C</strong>
                    </div>
                    <div className="roi-current-summary-row">
                      <span>Max candidates for assessments</span>
                      <strong>{manualPlannerResults.maxAssessmentsFromCredits.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="roi-current-summary-row">
                      <span>Max candidates for interviews</span>
                      <strong>{manualPlannerResults.maxInterviewsFromCredits.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="roi-current-summary-row">
                      <span>Credits needed for wanted assessments</span>
                      <strong>{manualPlannerResults.assessmentCreditsNeeded.toLocaleString('en-IN')} C</strong>
                    </div>
                    <div className="roi-current-summary-row">
                      <span>Credits needed for wanted interviews</span>
                      <strong>{manualPlannerResults.interviewCreditsNeeded.toLocaleString('en-IN')} C</strong>
                    </div>
                    <div className="roi-current-summary-total">
                      <span>Credits balance after planned usage</span>
                      <strong
                        className={
                          manualPlannerResults.creditsBalance < 0
                            ? 'roi-balance-negative'
                            : 'roi-balance-positive'
                        }
                      >
                        {manualPlannerResults.creditsBalance.toLocaleString('en-IN')} C
                      </strong>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="roi-col roi-col-current">
                <h2 className="roi-col-heading">Current</h2>

            <div className="roi-field">
              <label htmlFor="company">Company name</label>
              <input
                id="company"
                className="lc-input"
                type="text"
                value={inputs.companyName}
                onChange={setCompany}
                autoComplete="organization"
              />
            </div>

            <div className="roi-field">
              <span className="roi-field-label-text" id="company-size-label">
                Company size (employees)
              </span>
              <div
                className="roi-size-pills"
                role="group"
                aria-labelledby="company-size-label"
              >
                {COMPANY_SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`roi-size-pill ${inputs.companySize === opt.value ? 'roi-size-pill--active' : ''}`}
                    onClick={() => setCompanySize(opt.value)}
                    aria-pressed={inputs.companySize === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="roi-field-grid">
              <div className="roi-field">
                <label htmlFor="techPos">{positionsLabel} tech positions</label>
                <input
                  id="techPos"
                  className="lc-input"
                  type="number"
                  min={0}
                  step={1}
                  value={inputs.techAnnualPositions || ''}
                  onChange={setNum('techAnnualPositions')}
                />
              </div>
              <div className="roi-field">
                <label htmlFor="nonTechPos">{positionsLabel} non-tech positions</label>
                <input
                  id="nonTechPos"
                  className="lc-input"
                  type="number"
                  min={0}
                  step={1}
                  value={inputs.nonTechAnnualPositions || ''}
                  onChange={setNum('nonTechAnnualPositions')}
                />
              </div>
            </div>

            <p className="roi-table-caption">Resume funnel (average per job opening)</p>
            <div className="roi-table-wrap">
              <table className="roi-table">
                <thead>
                  <tr>
                    <th />
                    <th>Tech</th>
                    <th>Non-tech</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Resumes received</td>
                    <td>
                      <input
                        className="lc-input roi-table-input"
                        type="number"
                        min={0}
                        step={1}
                        value={inputs.techResumesReceived || ''}
                        onChange={setNum('techResumesReceived')}
                      />
                    </td>
                    <td>
                      <input
                        className="lc-input roi-table-input"
                        type="number"
                        min={0}
                        step={1}
                        value={inputs.nonTechResumesReceived || ''}
                        onChange={setNum('nonTechResumesReceived')}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Shortlisted resumes</td>
                    <td>
                      <input
                        className="lc-input roi-table-input"
                        type="number"
                        min={0}
                        step={1}
                        value={inputs.techShortlisted || ''}
                        onChange={setNum('techShortlisted')}
                      />
                    </td>
                    <td>
                      <input
                        className="lc-input roi-table-input"
                        type="number"
                        min={0}
                        step={1}
                        value={inputs.nonTechShortlisted || ''}
                        onChange={setNum('nonTechShortlisted')}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="roi-section-label">Hours (planning and execution)</p>
            <div className="roi-field">
              <label htmlFor="hrHrResume">
                HR manual shortlisting, avg. hours per resume
              </label>
              <span className="roi-hint">
                Typical India TA first-pass screen: about 0.15 to 0.35 hr (about 10 to 20 min) per CV.
              </span>
              <input
                id="hrHrResume"
                className="lc-input"
                type="number"
                min={0}
                step={0.01}
                value={inputs.hrHoursPerResumeManualShortlist || ''}
                onChange={setNum('hrHoursPerResumeManualShortlist')}
              />
            </div>
            <div className="roi-field">
              <label htmlFor="schedHr">
                Interview scheduling, back and forth hours per shortlisted resume
              </label>
              <input
                id="schedHr"
                className="lc-input"
                type="number"
                min={0}
                step={0.1}
                value={inputs.interviewSchedulingHoursPerShortlisted || ''}
                onChange={setNum('interviewSchedulingHoursPerShortlisted')}
              />
            </div>
            <div className="roi-field">
              <label htmlFor="expertHr">Expert interview hours per shortlisted resume</label>
              <input
                id="expertHr"
                className="lc-input"
                type="number"
                min={0}
                step={0.1}
                value={inputs.expertInterviewHoursPerShortlisted || ''}
                onChange={setNum('expertInterviewHoursPerShortlisted')}
              />
            </div>
            <div className="roi-field">
              <label htmlFor="fbHr">
                Feedback and back-and-forth with manager, hours per shortlisted resume
              </label>
              <input
                id="fbHr"
                className="lc-input"
                type="number"
                min={0}
                step={0.1}
                value={inputs.feedbackManagerHoursPerShortlisted || ''}
                onChange={setNum('feedbackManagerHoursPerShortlisted')}
              />
            </div>

            <p className="roi-section-label">Money</p>
            <div className="roi-field">
              <label htmlFor="jobBoard">Job board / sourcing portal cost ({jobBoardLabel})</label>
              <input
                id="jobBoard"
                className="lc-input"
                type="number"
                min={0}
                step={1000}
                value={inputs.jobBoardAnnualCost || ''}
                onChange={setNum('jobBoardAnnualCost')}
              />
            </div>
            <div className="roi-field-grid">
              <div className="roi-field">
                <label htmlFor="hrAnnual">HR role, {periodLabel} loaded cost (Rs)</label>
                <input
                  id="hrAnnual"
                  className="lc-input"
                  type="number"
                  min={0}
                  step={10000}
                  value={inputs.hrRoleAnnualCost || ''}
                  onChange={setNum('hrRoleAnnualCost')}
                />
              </div>
              <div className="roi-field">
                <label htmlFor="mgrAnnual">
                  Experienced manager / engineer, {periodLabel} loaded cost (Rs)
                </label>
                <input
                  id="mgrAnnual"
                  className="lc-input"
                  type="number"
                  min={0}
                  step={10000}
                  value={inputs.managerRoleAnnualCost || ''}
                  onChange={setNum('managerRoleAnnualCost')}
                />
              </div>
            </div>
            <div className="roi-field-grid">
              <div className="roi-field">
                <label htmlFor="creditValue">Skillbrew credit value (Rs per credit)</label>
                <input
                  id="creditValue"
                  className="lc-input"
                  type="number"
                  min={0}
                  step={0.01}
                  value={inputs.skillbrewCreditValue || ''}
                  onChange={setNum('skillbrewCreditValue')}
                />
              </div>
              <div className="roi-field">
                <label htmlFor="discountPercent">Skillbrew discount (%)</label>
                <input
                  id="discountPercent"
                  className="lc-input"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={inputs.skillbrewDiscountPercent || ''}
                  onChange={setNum('skillbrewDiscountPercent')}
                />
              </div>
            </div>

            <div className="roi-current-summary">
              <div className="roi-current-summary-row">
                <span>Resume shortlisting cost</span>
                <strong>{formatInr(results.current.resumeShortlistingCost)}</strong>
              </div>
              <div className="roi-current-summary-row">
                <span>Interview scheduling (HR time)</span>
                <strong>{formatInr(results.current.interviewSchedulingCost)}</strong>
              </div>
              <div className="roi-current-summary-row">
                <span>Expert interview + manager feedback</span>
                <strong>{formatInr(results.current.interviewAndFeedbackCost)}</strong>
              </div>
              <div className="roi-current-summary-row">
                <span>Job boards / sourcing</span>
                <strong>{formatInr(results.current.additionalCost)}</strong>
              </div>
              <div className="roi-current-summary-total">
                <span>Total current {periodLabel} cost</span>
                <strong>{formatInrCompact(results.current.total)}</strong>
              </div>
            </div>

            {formError && <p className="roi-form-error">{formError}</p>}
            <button type="button" className="lc-button roi-report-btn" onClick={handleGetReport}>
              Get your report
            </button>
              </section>

              <section
                className={`roi-col roi-col-skillbrew ${!reportUnlocked ? 'roi-col-skillbrew--locked' : ''}`}
                aria-hidden={!reportUnlocked}
              >
            {!reportUnlocked && (
              <div className="roi-skillbrew-lock-overlay">
                <p className="roi-skillbrew-lock-title">Skillbrew</p>
                <p className="roi-skillbrew-lock-text">
                  Fill every field in Current, then click <strong>Get your report</strong> to unlock
                  this column.
                </p>
              </div>
            )}

            <div className={!reportUnlocked ? 'roi-skillbrew-inner--blur' : ''}>
              <h2 className="roi-col-heading">With Skillbrew</h2>

              <ul className="roi-sb-facts">
                <li>
                  <strong>1 Credit = {formatInr(results.skillbrew.inrPerCredit)}</strong>
                </li>
                <li>Assessment or Interview creation = 100 C</li>
              </ul>

              <div className="roi-sb-lines">
                <div className="roi-sb-line">
                  <span>Resume shortlist</span>
                  <span>
                    ({inputs.techResumesReceived} × 1 C × {inputs.techAnnualPositions} tech) + (
                    {inputs.nonTechResumesReceived} × 1 C × {inputs.nonTechAnnualPositions} non-tech)
                  </span>
                  <strong>{formatInr(results.skillbrew.resumeShortlistInr)}</strong>
                </div>
                <div className="roi-sb-line">
                  <span>Proctored assessment</span>
                  <span>
                    (100 C + shortlisted × 10 C) × positions, tech and non-tech
                  </span>
                  <strong>{formatInr(results.skillbrew.proctoredAssessmentInr)}</strong>
                </div>
                <div className="roi-sb-line">
                  <span>Proctored interview</span>
                  <span>
                    (100 C + shortlisted × 150 C) × positions, tech and non-tech
                  </span>
                  <strong>{formatInr(results.skillbrew.proctoredInterviewInr)}</strong>
                </div>
              </div>

              <div className="roi-sb-totalbox">
                <div className="roi-sb-total-row">
                  <span>Total (before discount)</span>
                  <strong>{formatInrCompact(results.skillbrew.subtotalBeforeDiscountInr)}</strong>
                </div>
                <div className="roi-sb-total-row roi-sb-highlight">
                  <span>
                    Final amount ({Math.round(results.skillbrew.discountRate * 100)}% off)
                  </span>
                  <strong>{formatInrCompact(results.skillbrew.finalAmountInr)}</strong>
                </div>
              </div>

              <ul className="roi-sb-benefits">
                <li>No job posting cost: post as many jobs as you want, unlimited.</li>
                <li>
                  No back-and-forth hours wasted on feedback: use Hiring Cell for structured
                  alignment.
                </li>
                <li>
                  Communications through email and WhatsApp automated, plus email templates to save
                  time writing.
                </li>
              </ul>

              <div className="roi-impact-grid">
                <div className="roi-impact-card">
                  <IndianRupee className="roi-impact-icon" aria-hidden />
                  <div className="roi-impact-label">Revenue increased by</div>
                  <div className="roi-impact-value">
                    <CountInrCompact value={results.impact.revenueIncreasedInr} />
                  </div>
                  <div className="roi-impact-sub">vs Skillbrew final ({periodLabel})</div>
                </div>
                <div className="roi-impact-card">
                  <Clock className="roi-impact-icon" aria-hidden />
                  <div className="roi-impact-label">Hours saved</div>
                  <div className="roi-impact-value">
                    <CountInt value={results.impact.hoursSaved} />
                  </div>
                  <div className="roi-impact-sub">estimated vs. manual workflow</div>
                </div>
                <div className="roi-impact-card">
                  <Zap className="roi-impact-icon" aria-hidden />
                  <div className="roi-impact-label">More automation</div>
                  <div className="roi-impact-value">
                    <CountPercent value={results.impact.moreAutomationPercent} />
                  </div>
                  <div className="roi-impact-sub">workflow uplift index</div>
                </div>
                <div className="roi-impact-card">
                  <Target className="roi-impact-icon" aria-hidden />
                  <div className="roi-impact-label">More good hires</div>
                  <div className="roi-impact-value">
                    <CountPercent value={results.impact.moreGoodHiresPercent} />
                  </div>
                  <div className="roi-impact-sub">quality uplift index</div>
                </div>
              </div>

              <button
                type="button"
                className="lc-button roi-pdf-btn"
                onClick={handleDownloadPdf}
                disabled={!reportUnlocked || !valid}
              >
                <Download size={18} aria-hidden />
                Download PDF report
              </button>
            </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

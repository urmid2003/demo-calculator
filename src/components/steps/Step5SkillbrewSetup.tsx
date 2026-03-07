import { useMemo } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import FormGroup, { NumInput, SelectInput } from '../ui/FormGroup';
import { CalcChip, CalcResultRow } from '../ui/CalcChip';
import Subsection, { FormGrid } from '../ui/Subsection';
import BtnRow from '../ui/BtnRow';
import { calcTraditional, calcSkillbrew, hrRate } from '../../lib/calculations';
import { fmt, fmtH } from '../../lib/formatters';

const INTERVIEW_MODE_OPTIONS = [
  { value: 'full_ai', label: 'Fully AI Interview' },
  { value: 'hybrid', label: 'Hybrid (AI + Manual)' },
  { value: 'full_manual', label: 'Fully Manual' },
];

interface Props { onBack: () => void; onNext: () => void }

export default function Step5SkillbrewSetup({ onBack, onNext }: Props) {
  const { inputs, setField } = useCalculator();

  const preview = useMemo(() => {
    const trad = calcTraditional(inputs);
    const sb = calcSkillbrew(inputs, trad);
    const hoursSaved = Math.max(0, trad.totalHours - sb.totalHours);
    const costSaved = hoursSaved * hrRate(inputs.screening_salary);
    return { hoursSaved, costSaved };
  }, [inputs]);

  return (
    <div style={{
  background: 'rgba(255,255,255,0.52)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.78)',
  borderRadius: 20, padding: 36, marginBottom: 20,
  animation: 'fadeUp 0.3s ease',
  boxShadow: '0 8px 40px rgba(180,100,60,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
}}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)' }}>⚡</div>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#a0522d', marginBottom: 4 }}>
            Skillbrew Configuration{' '}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(0,212,170,0.12)', color: 'var(--accent)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100 }}>✦ AUTOMATION</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Set Skillbrew efficiency parameters to compute your savings</p>
        </div>
      </div>

      <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#c4b5fd', marginBottom: 20, display: 'flex', gap: 10 }}>
        ⚡ Skillbrew automates job posting, resume parsing, AI assessments, and AI-led interviews — slashing manual work at every stage.
      </div>

      <Subsection title="Sourcing & JD Automation">
        <FormGrid>
          <FormGroup label="Time to Create Job on Skillbrew (minutes)">
            <NumInput value={inputs.sb_jd_time} min={5} onChange={v => setField('sb_jd_time', v)} />
          </FormGroup>
          <FormGroup label="Skillbrew Annual Subscription (₹)">
            <NumInput value={inputs.sb_cost} min={0} onChange={v => setField('sb_cost', v)} />
          </FormGroup>
          <FormGroup label="% Candidates from Existing DB">
            <NumInput value={inputs.sb_db_pct} min={0} max={100} onChange={v => setField('sb_db_pct', v)} />
          </FormGroup>
        </FormGrid>
      </Subsection>

      <Subsection title="AI Resume Filtering">
        <FormGrid>
          <FormGroup label="Automated Screening Time per Resume (sec)">
            <NumInput value={inputs.sb_screen_sec} min={1} onChange={v => setField('sb_screen_sec', v)} />
          </FormGroup>
          <FormGroup label="HR Review Time per Shortlisted (minutes)">
            <NumInput value={inputs.sb_hr_review} min={0.5} step={0.5} onChange={v => setField('sb_hr_review', v)} />
          </FormGroup>
        </FormGrid>
      </Subsection>

      <Subsection title="AI Assessments">
        <FormGrid>
          <FormGroup label="Manual Assessment Creation Time (hours)">
            <NumInput value={inputs.manual_assess_time} min={0.5} step={0.5} onChange={v => setField('manual_assess_time', v)} />
          </FormGroup>
          <FormGroup label="AI Assessment Creation Time (minutes)">
            <NumInput value={inputs.sb_assess_time} min={1} onChange={v => setField('sb_assess_time', v)} />
          </FormGroup>
          <FormGroup label="% Candidates Taking Assessments">
            <NumInput value={inputs.sb_assess_pct} min={0} max={100} onChange={v => setField('sb_assess_pct', v)} />
          </FormGroup>
          <FormGroup label="Manual Evaluation Time per Response (min)">
            <NumInput value={inputs.manual_eval_time} min={1} onChange={v => setField('manual_eval_time', v)} />
          </FormGroup>
        </FormGrid>
      </Subsection>

      <Subsection title="AI Interviews">
        <FormGrid>
          <FormGroup label="Interview Mode">
            <SelectInput
              value={inputs.interview_mode}
              options={INTERVIEW_MODE_OPTIONS}
              onChange={v => setField('interview_mode', v as 'full_ai' | 'hybrid' | 'full_manual')}
            />
          </FormGroup>
          <FormGroup label="AI Interview Time per Candidate (minutes)">
            <NumInput value={inputs.sb_interview_time} min={5} onChange={v => setField('sb_interview_time', v)} />
          </FormGroup>
          <FormGroup label="HR Coordination Time Reduction (%)">
            <NumInput value={inputs.sb_coord_reduction} min={0} max={100} onChange={v => setField('sb_coord_reduction', v)} />
          </FormGroup>
        </FormGrid>
      </Subsection>

      <CalcResultRow>
        <CalcChip label="Projected Hours Saved" value={fmtH(preview.hoursSaved)} />
        <CalcChip label="Projected Cost Saved" value={fmt(preview.costSaved)} />
      </CalcResultRow>

      <BtnRow onBack={onBack} onNext={onNext} nextLabel="Credit Pricing" />
    </div>
  );
}

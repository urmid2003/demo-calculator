import { useMemo } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import FormGroup, { NumInput } from '../ui/FormGroup';
import { CalcChip, CalcResultRow } from '../ui/CalcChip';
import Subsection, { FormGrid } from '../ui/Subsection';
import BtnRow from '../ui/BtnRow';
import { calcTraditional } from '../../lib/calculations';
import { fmt, fmtH } from '../../lib/formatters';

interface Props { onBack: () => void; onNext: () => void }

export default function Step3Screening({ onBack, onNext }: Props) {
  const { inputs, setField } = useCalculator();
  const t = useMemo(() => calcTraditional(inputs), [inputs]);

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
        <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)' }}>🔍</div>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#a0522d', marginBottom: 4 }}>Resume Screening</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manual resume review and shortlisting time</p>
        </div>
      </div>

      <Subsection title="Resume Review">
        <FormGrid>
          <FormGroup label="Avg. Time per Resume (minutes)">
            <NumInput value={inputs.resume_time} min={1} onChange={v => setField('resume_time', v)} />
          </FormGroup>
          <FormGroup label="HR Screener Salary (₹/month)">
            <NumInput value={inputs.screening_salary} min={1} onChange={v => setField('screening_salary', v)} />
          </FormGroup>
          <FormGroup label="Second-Level Review Time (minutes)">
            <NumInput value={inputs.second_review_time} min={0} onChange={v => setField('second_review_time', v)} />
          </FormGroup>
          <FormGroup label="% Resumes Needing Second Review">
            <NumInput value={inputs.second_review_pct} min={0} max={100} onChange={v => setField('second_review_pct', v)} />
          </FormGroup>
        </FormGrid>
      </Subsection>

      <CalcResultRow>
        <CalcChip label="Screening Hours/Year" value={fmtH(t.totalScreenHours)} />
        <CalcChip label="Screening Cost/Year" value={fmt(t.screenCost)} />
      </CalcResultRow>

      <BtnRow onBack={onBack} onNext={onNext} nextLabel="Calls & Interviews" />
    </div>
  );
}

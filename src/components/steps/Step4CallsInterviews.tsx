import { useMemo } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import FormGroup, { NumInput } from '../ui/FormGroup';
import { CalcChip, CalcResultRow } from '../ui/CalcChip';
import Subsection, { FormGrid } from '../ui/Subsection';
import BtnRow from '../ui/BtnRow';
import { calcTraditional } from '../../lib/calculations';
import { fmt, fmtH } from '../../lib/formatters';

interface Props { onBack: () => void; onNext: () => void }

export default function Step4CallsInterviews({ onBack, onNext }: Props) {
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
        <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>📞</div>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#a0522d', marginBottom: 4 }}>Candidate Calls & Interviews</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Coordination, calling, and interview rounds</p>
        </div>
      </div>

      <Subsection title="Candidate Calls & Scheduling">
        <FormGrid>
          <FormGroup label="Avg. Call Duration (minutes)">
            <NumInput value={inputs.call_duration} min={1} onChange={v => setField('call_duration', v)} />
          </FormGroup>
          <FormGroup label="Scheduling Time per Candidate (minutes)">
            <NumInput value={inputs.scheduling_time} min={1} onChange={v => setField('scheduling_time', v)} />
          </FormGroup>
          <FormGroup label="HR Caller Salary (₹/month)">
            <NumInput value={inputs.caller_salary} min={1} onChange={v => setField('caller_salary', v)} />
          </FormGroup>
        </FormGrid>
      </Subsection>

      <Subsection title="Interview Rounds">
        <FormGrid>
          <FormGroup label="Number of Interview Rounds">
            <NumInput value={inputs.interview_rounds} min={1} max={6} onChange={v => setField('interview_rounds', v)} />
          </FormGroup>
          <FormGroup label="Interview Duration per Candidate (minutes)">
            <NumInput value={inputs.interview_duration} min={15} onChange={v => setField('interview_duration', v)} />
          </FormGroup>
          <FormGroup label="Avg. Interviewers per Round">
            <NumInput value={inputs.num_interviewers} min={1} onChange={v => setField('num_interviewers', v)} />
          </FormGroup>
          <FormGroup label="Interviewer Salary (₹/month)">
            <NumInput value={inputs.interviewer_salary} min={1} onChange={v => setField('interviewer_salary', v)} />
          </FormGroup>
          <FormGroup label="Shortlist → Interview Conversion (%)">
            <NumInput value={inputs.interview_conversion} min={1} max={100} onChange={v => setField('interview_conversion', v)} />
          </FormGroup>
        </FormGrid>
      </Subsection>

      <Subsection title="Dept. Coordination">
        <FormGrid>
          <FormGroup label="Coordination Hours per Role (HR + Dept.)">
            <NumInput value={inputs.coord_hours} min={0} step={0.5} onChange={v => setField('coord_hours', v)} />
          </FormGroup>
          <FormGroup label="HR Coordinator Salary (₹/month)">
            <NumInput value={inputs.coord_salary} min={1} onChange={v => setField('coord_salary', v)} />
          </FormGroup>
        </FormGrid>
      </Subsection>

      <CalcResultRow>
        <CalcChip label="Calling Cost" value={fmt(t.callCost)} />
        <CalcChip label="Interview Hours" value={fmtH(t.interviewHours)} />
        <CalcChip label="Interview Cost" value={fmt(t.interviewCost)} />
        <CalcChip label="Coord. Cost" value={fmt(t.coordCost)} />
      </CalcResultRow>

      <BtnRow onBack={onBack} onNext={onNext} nextLabel="Skillbrew Setup" />
    </div>
  );
}

import { useMemo } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import FormGroup, { NumInput } from '../ui/FormGroup';
import { CalcChip, CalcResultRow } from '../ui/CalcChip';
import BtnRow from '../ui/BtnRow';
import { FormGrid } from '../ui/Subsection';
import { calcRequirements } from '../../lib/calculations';
import { fmtNum } from '../../lib/formatters';

const sectionCard: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 20,
  padding: 36,
  marginBottom: 20,
  animation: 'fadeUp 0.3s ease',
};

const sectionHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 32,
  paddingBottom: 24,
  borderBottom: '1px solid var(--border)',
};

interface Props { onNext: () => void }

export default function Step1Requirements({ onNext }: Props) {
  const { inputs, setField } = useCalculator();

  const result = useMemo(() => calcRequirements(inputs), [inputs]);

  return (
    <div style={sectionCard}>
      <div style={sectionHeader}>
        <div
          style={{
            width: 48, height: 48, borderRadius: 12, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
            background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)',
          }}
        >
          🎯
        </div>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#a0522d', marginBottom: 4 }}>
            Hiring Requirements
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Annual hiring scale for your organisation</p>
        </div>
      </div>

      <FormGrid>
        <FormGroup label="Open Positions (Annual)">
          <NumInput value={inputs.num_positions} min={1} onChange={v => setField('num_positions', v)} />
        </FormGroup>
        <FormGroup label="Departments Hiring">
          <NumInput value={inputs.num_departments} min={1} onChange={v => setField('num_departments', v)} />
        </FormGroup>
        <FormGroup label="Avg. Candidates Received per Job">
          <NumInput value={inputs.candidates_per_job} min={1} onChange={v => setField('candidates_per_job', v)} />
        </FormGroup>
        <FormGroup label="Avg. Candidates Shortlisted per Job">
          <NumInput value={inputs.shortlisted_per_job} min={1} onChange={v => setField('shortlisted_per_job', v)} />
        </FormGroup>
        <FormGroup label="HR Team Size (Recruiting)">
          <NumInput value={inputs.hr_team_size} min={1} onChange={v => setField('hr_team_size', v)} />
        </FormGroup>
        <FormGroup label="Offer Acceptance Rate (%)">
          <NumInput value={inputs.offer_acceptance} min={1} max={100} onChange={v => setField('offer_acceptance', v)} />
        </FormGroup>
      </FormGrid>

      <CalcResultRow>
        <CalcChip label="Total Candidates" value={fmtNum(result.totalCandidates)} />
        <CalcChip label="Total Shortlisted" value={fmtNum(result.totalShortlisted)} />
        <CalcChip label="Expected Hires" value={fmtNum(result.expectedHires)} />
      </CalcResultRow>

      <BtnRow onNext={onNext} nextLabel="Job Sourcing" />
    </div>
  );
}

import { useMemo } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import FormGroup, { NumInput } from '../ui/FormGroup';
import { CalcChip, CalcResultRow } from '../ui/CalcChip';
import Subsection, { FormGrid } from '../ui/Subsection';
import BtnRow from '../ui/BtnRow';
import { calcTraditional } from '../../lib/calculations';
import { fmt, fmtH } from '../../lib/formatters';

const PLATFORMS = [
  { key: 'linkedin', label: '🔷 LinkedIn' },
  { key: 'naukri', label: '🟠 Naukri' },
  { key: 'indeed', label: '🔵 Indeed' },
  { key: 'shine', label: '✨ Shine' },
  { key: 'monster', label: '👾 Monster' },
  { key: 'iimjobs', label: '🎓 IIMJobs' },
];

interface Props { onBack: () => void; onNext: () => void }

export default function Step2JobSourcing({ onBack, onNext }: Props) {
  const { inputs, setField, togglePlatform } = useCalculator();

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
        <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)' }}>📋</div>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#a0522d', marginBottom: 4 }}>Traditional Job Sourcing</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Job descriptions, platforms, and posting costs</p>
        </div>
      </div>

      <Subsection title="Job Description Creation">
        <FormGrid>
          <FormGroup label="Time to Write 1 JD (hours)">
            <NumInput value={inputs.jd_time} min={0.5} step={0.5} onChange={v => setField('jd_time', v)} />
          </FormGroup>
          <FormGroup label="JD Creator Salary (₹/month)">
            <NumInput value={inputs.jd_salary} min={1} onChange={v => setField('jd_salary', v)} />
          </FormGroup>
          <FormGroup label="JD Revisions per Posting">
            <NumInput value={inputs.jd_revisions} min={0} onChange={v => setField('jd_revisions', v)} />
          </FormGroup>
        </FormGrid>
      </Subsection>

      <Subsection title="Job Board Platforms">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {PLATFORMS.map(p => {
            const checked = inputs.platforms[p.key];
            return (
              <label
                key={p.key}
                onClick={() => togglePlatform(p.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                  background: checked ? 'rgba(0,212,170,0.08)' : 'var(--surface)',
                  border: `1px solid ${checked ? 'rgba(0,212,170,0.3)' : 'var(--border)'}`,
                  borderRadius: 8, cursor: 'pointer', fontSize: 13,
                  color: checked ? 'var(--accent)' : 'var(--text)',
                  transition: 'all 0.2s',
                }}
              >
                {p.label}
              </label>
            );
          })}
        </div>
        <FormGrid>
          <FormGroup label="Avg. Monthly Subscription / Platform (₹)">
            <NumInput value={inputs.platform_cost} min={0} onChange={v => setField('platform_cost', v)} />
          </FormGroup>
          <FormGroup label="Time to Post & Manage 1 Job (minutes)">
            <NumInput value={inputs.posting_time} min={1} onChange={v => setField('posting_time', v)} />
          </FormGroup>
          <FormGroup label="Re-posts per Job (per year)">
            <NumInput value={inputs.reposts} min={0} onChange={v => setField('reposts', v)} />
          </FormGroup>
        </FormGrid>
      </Subsection>

      <CalcResultRow>
        <CalcChip label="Annual JD Cost" value={fmt(t.jdCost)} />
        <CalcChip label="Annual JD Time" value={fmtH(t.totalJDHours)} />
        <CalcChip label="Annual Platform Cost" value={fmt(t.annualPlatformCost)} />
        <CalcChip label="Posting Mgmt Time" value={fmtH(t.postingHours)} />
      </CalcResultRow>

      <BtnRow onBack={onBack} onNext={onNext} nextLabel="Screening" />
    </div>
  );
}

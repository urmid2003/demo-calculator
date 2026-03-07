import { useMemo } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import FormGroup, { NumInput } from '../ui/FormGroup';
import { CalcChip, CalcResultRow } from '../ui/CalcChip';
import Subsection, { FormGrid } from '../ui/Subsection';
import BtnRow from '../ui/BtnRow';
import { calcCredits, calcRequirements } from '../../lib/calculations';
import { fmt, fmtNum } from '../../lib/formatters';

interface Props { onBack: () => void; onCalculate: () => void }

export default function Step6CreditPricing({ onBack, onCalculate }: Props) {
  const { inputs, setField } = useCalculator();
  const cr = useMemo(() => calcCredits(inputs), [inputs]);
  const req = useMemo(() => calcRequirements(inputs), [inputs]);

  const totalCandidates = Math.max(1, inputs.num_positions * inputs.candidates_per_job);
  const totalHires = Math.max(1, req.expectedHires);

  const creditCardStyle = (bg: string, border: string): React.CSSProperties => ({
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: 16,
  });

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: 'var(--text-muted)',
    marginBottom: 10,
    fontWeight: 600,
  };

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
        <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)' }}>🪙</div>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#a0522d', marginBottom: 4 }}>
            Skillbrew Credit Cost Calculation{' '}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(0,212,170,0.12)', color: 'var(--accent)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100 }}>✦ CREDITS</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>1 Credit = ₹10 · Enter usage to compute exact platform cost</p>
        </div>
      </div>

      <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#c4b5fd', marginBottom: 20 }}>
        🪙 Credits are consumed per assessment/interview <em>created</em> and per <em>candidate completion</em>. Proctored versions use more credits due to AI monitoring overhead.
      </div>

      {/* Rate reference */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div style={creditCardStyle('rgba(0,212,170,0.06)', 'rgba(0,212,170,0.15)')}>
          <div style={labelStyle}>📝 Assessment Credits</div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
            Creation — Proctored: <strong style={{ color: 'var(--accent)' }}>100 cr</strong><br />
            Creation — Unproctored: <strong style={{ color: 'var(--accent)' }}>50 cr</strong><br />
            Completion — Proctored: <strong style={{ color: 'var(--accent)' }}>10 cr</strong><br />
            Completion — Unproctored: <strong style={{ color: 'var(--accent)' }}>5 cr</strong>
          </div>
        </div>
        <div style={creditCardStyle('rgba(124,58,237,0.06)', 'rgba(124,58,237,0.15)')}>
          <div style={labelStyle}>🎙️ Interview Credits</div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
            Creation — Proctored: <strong style={{ color: '#a78bfa' }}>100 cr</strong><br />
            Creation — Unproctored: <strong style={{ color: '#a78bfa' }}>50 cr</strong><br />
            Completion — Proctored: <strong style={{ color: '#a78bfa' }}>100 cr</strong><br />
            Completion — Unproctored: <strong style={{ color: '#a78bfa' }}>50 cr</strong>
          </div>
        </div>
        <div style={creditCardStyle('rgba(245,158,11,0.06)', 'rgba(245,158,11,0.15)')}>
          <div style={labelStyle}>💱 Conversion Rate</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--gold)' }}>
            ₹10<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}> / credit</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>All credits convert at fixed rate</div>
        </div>
      </div>

      {/* Assessment Usage */}
      <Subsection title="Assessment Usage">
        <FormGrid>
          <FormGroup label="Proctored Assessments Created">
            <NumInput value={inputs.cr_assess_proct_created} min={0} onChange={v => setField('cr_assess_proct_created', v)} />
          </FormGroup>
          <FormGroup label="Unproctored Assessments Created">
            <NumInput value={inputs.cr_assess_unproct_created} min={0} onChange={v => setField('cr_assess_unproct_created', v)} />
          </FormGroup>
          <FormGroup label="Candidates Completing Proctored Assessments">
            <NumInput value={inputs.cr_assess_proct_cands} min={0} onChange={v => setField('cr_assess_proct_cands', v)} />
          </FormGroup>
          <FormGroup label="Candidates Completing Unproctored Assessments">
            <NumInput value={inputs.cr_assess_unproct_cands} min={0} onChange={v => setField('cr_assess_unproct_cands', v)} />
          </FormGroup>
        </FormGrid>
        <CalcResultRow>
          <CalcChip label="Assessment Creation Credits" value={fmtNum(cr.assessCreationCredits)} />
          <CalcChip label="Assessment Completion Credits" value={fmtNum(cr.assessCompletionCredits)} />
          <CalcChip label="Total Assessment Credits" value={fmtNum(cr.assessTotalCredits)} />
          <CalcChip label="Assessment Cost (₹)" value={fmt(cr.assessCreditCost)} />
        </CalcResultRow>
      </Subsection>

      {/* Interview Usage */}
      <Subsection title="Interview Usage">
        <FormGrid>
          <FormGroup label="Proctored Interviews Created">
            <NumInput value={inputs.cr_int_proct_created} min={0} onChange={v => setField('cr_int_proct_created', v)} />
          </FormGroup>
          <FormGroup label="Unproctored Interviews Created">
            <NumInput value={inputs.cr_int_unproct_created} min={0} onChange={v => setField('cr_int_unproct_created', v)} />
          </FormGroup>
          <FormGroup label="Candidates Completing Proctored Interviews">
            <NumInput value={inputs.cr_int_proct_cands} min={0} onChange={v => setField('cr_int_proct_cands', v)} />
          </FormGroup>
          <FormGroup label="Candidates Completing Unproctored Interviews">
            <NumInput value={inputs.cr_int_unproct_cands} min={0} onChange={v => setField('cr_int_unproct_cands', v)} />
          </FormGroup>
        </FormGrid>
        <CalcResultRow>
          <CalcChip label="Interview Creation Credits" value={fmtNum(cr.intCreationCredits)} />
          <CalcChip label="Interview Completion Credits" value={fmtNum(cr.intCompletionCredits)} />
          <CalcChip label="Total Interview Credits" value={fmtNum(cr.intTotalCredits)} />
          <CalcChip label="Interview Cost (₹)" value={fmt(cr.intCreditCost)} />
        </CalcResultRow>
      </Subsection>

      {/* Grand Summary */}
      <div style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.08), rgba(124,58,237,0.08))', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#a0522d', fontSize: '1rem', marginBottom: 16 }}>📊 Credit Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { value: fmtNum(cr.totalCredits), label: 'Total Credits Used', color: 'var(--accent)' },
            { value: fmt(cr.totalCreditCost), label: 'Total Credit Cost (₹)', color: 'var(--gold)' },
            { value: fmt(cr.totalCreditCost / totalCandidates), label: 'Credit Cost per Candidate', color: '#a78bfa' },
            { value: fmt(cr.totalCreditCost / totalHires), label: 'Credit Cost per Hire', color: 'var(--green)' },
          ].map(({ value, label, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <BtnRow onBack={onBack} isLast onCalculate={onCalculate} />
    </div>
  );
}

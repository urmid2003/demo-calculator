import React, { useMemo } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import {
  calcTraditional,
  calcSkillbrew,
  calcCredits,
  calcResults,
} from '../../lib/calculations';
import { fmt, fmtH } from '../../lib/formatters';
import { CompareCard, SavingsBar } from '../ui/CompareCard';

interface Props {
  onRecalculate: () => void;
}

function HeroStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 24,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, transparent 60%, rgba(0,212,170,0.05))',
        }}
      />
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '2.2rem', fontWeight: 800, lineHeight: 1, marginBottom: 8, color }}>
        {value}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</div>
    </div>
  );
}

function CphCard({ value, label, color }: { value: string; label: string; color: string }) {
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
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: 4, color }}>{value}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{label}</div>
    </div>
  );
}

export default function ResultsSection({ onRecalculate }: Props) {
  const { inputs } = useCalculator();

  const { trad, sb, credits, final, totalSBCost } = useMemo(() => {
    const trad = calcTraditional(inputs);
    const sb = calcSkillbrew(inputs, trad);
    const credits = calcCredits(inputs);
    const { final, totalSBCost } = calcResults(inputs, trad, sb, credits);
    return { trad, sb, credits, final, totalSBCost };
  }, [inputs]);

  // Savings bars max value
  const categories = {
    sourcing: { trad: trad.jdCost + trad.postingCost + trad.annualPlatformCost, brew: sb.sbJDCost + sb.sbPlatformCost },
    screening: { trad: trad.screenCost, brew: sb.sbScreenCost },
    interviews: { trad: trad.interviewCost, brew: sb.sbInterviewCost + credits.intCreditCost },
    coord: { trad: trad.coordCost, brew: sb.sbCoordCost },
  };
  const maxVal = Math.max(...Object.values(categories).flatMap(c => [c.trad, c.brew]), 1);

  const pct = (trad: number, brew: number) =>
    trad > 0 ? Math.round(((trad - brew) / trad) * 100) : 0;

  return (
    <div style={{ animation: 'fadeUp 0.4s ease' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,212,170,0.08) 0%, rgba(124,58,237,0.08) 100%)',
        border: '1px solid rgba(0,212,170,0.2)',
        borderRadius: 24,
        padding: 40,
        marginBottom: 24,
        textAlign: 'center',
      }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#a0522d', marginBottom: 8 }}>
          Your Annual Hiring ROI Report
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
          Traditional process vs. Skillbrew-powered hiring — computed for your organisation
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <HeroStat value={fmt(final.costSaved)} label="Total Cost Saved / Year" color="var(--green)" />
          <HeroStat value={fmtH(final.hoursSaved)} label="Total Hours Saved / Year" color="var(--accent)" />
          <HeroStat value={`${final.daysSaved} days`} label="Working Days Saved" color="var(--gold)" />
          <HeroStat value={`${final.efficiencyPct}%`} label="Efficiency Improvement" color="#a78bfa" />
        </div>
      </div>

      {/* Comparison cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        <CompareCard variant="traditional" icon="🔴" title="Traditional Hiring" subtitle="Without Skillbrew">
          {[
            ['Job Sourcing Cost', fmt(trad.jdCost + trad.postingCost)],
            ['Platform Subscriptions', fmt(trad.annualPlatformCost)],
            ['Resume Screening Cost', fmt(trad.screenCost)],
            ['Calling & Scheduling Cost', fmt(trad.callCost)],
            ['Interview Cost', fmt(trad.interviewCost)],
            ['Dept. Coordination Cost', fmt(trad.coordCost)],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ color: '#f87171', fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 8, borderTop: '1px solid rgba(239,68,68,0.2)', fontSize: 14 }}>
            <span style={{ fontWeight: 600, color: '#a0522d' }}>Total Annual Cost</span>
            <span style={{ color: '#f87171', fontWeight: 600, fontFamily: "'Syne', sans-serif", fontSize: '1.1rem' }}>{fmt(trad.totalCost)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 14 }}>
            <span style={{ fontWeight: 600, color: '#a0522d' }}>Total Annual Hours</span>
            <span style={{ color: '#f87171', fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>{fmtH(trad.totalHours)}</span>
          </div>
        </CompareCard>

        <CompareCard variant="skillbrew" icon="🟢" title="Skillbrew Hiring" subtitle="Automation-powered">
          {[
            ['Skillbrew Subscription', fmt(inputs.sb_cost)],
            ['JD Creation (reduced)', fmt(sb.sbJDCost)],
            ['Screening (automated)', fmt(sb.sbScreenCost)],
            ['Calling & Scheduling', fmt(sb.sbCallCost)],
            ['Interview Cost (AI/Hybrid)', fmt(sb.sbInterviewCost)],
            ['Coordination (reduced)', fmt(sb.sbCoordCost)],
            ['🪙 Assessment Credits Cost', fmt(credits.assessCreditCost)],
            ['🪙 Interview Credits Cost', fmt(credits.intCreditCost)],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 8, borderTop: '1px solid rgba(0,212,170,0.2)', fontSize: 14 }}>
            <span style={{ fontWeight: 600, color: '#a0522d' }}>Total Annual Cost</span>
            <span style={{ color: 'var(--accent)', fontWeight: 600, fontFamily: "'Syne', sans-serif", fontSize: '1.1rem' }}>{fmt(totalSBCost)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 14 }}>
            <span style={{ fontWeight: 600, color: '#a0522d' }}>Total Annual Hours</span>
            <span style={{ color: 'var(--accent)', fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>{fmtH(sb.totalHours)}</span>
          </div>
        </CompareCard>
      </div>

      {/* Savings Bars */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#a0522d', marginBottom: 24 }}>
          Time & Cost Breakdown — Traditional vs Skillbrew
        </h3>
        <SavingsBar label="Job Sourcing" tradWidth={(categories.sourcing.trad / maxVal) * 100} brewWidth={(categories.sourcing.brew / maxVal) * 100} pctSaved={pct(categories.sourcing.trad, categories.sourcing.brew)} />
        <SavingsBar label="Resume Screening" tradWidth={(categories.screening.trad / maxVal) * 100} brewWidth={(categories.screening.brew / maxVal) * 100} pctSaved={pct(categories.screening.trad, categories.screening.brew)} />
        <SavingsBar label="Interviews" tradWidth={(categories.interviews.trad / maxVal) * 100} brewWidth={(categories.interviews.brew / maxVal) * 100} pctSaved={pct(categories.interviews.trad, categories.interviews.brew)} />
        <SavingsBar label="Coordination" tradWidth={(categories.coord.trad / maxVal) * 100} brewWidth={(categories.coord.brew / maxVal) * 100} pctSaved={pct(categories.coord.trad, categories.coord.brew)} />
        <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(90deg,#ef4444,#f87171)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Traditional</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(90deg,var(--accent),#00a3ff)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Skillbrew</span>
          </div>
        </div>
      </div>

      {/* Credit Breakdown */}
      <div style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.04), rgba(124,58,237,0.04))', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 20, padding: 32, marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#a0522d', marginBottom: 24 }}>🪙 Skillbrew Credit Cost Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
          <CphCard value={credits.totalCredits.toLocaleString('en-IN')} label="Total Credits Consumed" color="var(--accent)" />
          <CphCard value={fmt(credits.totalCreditCost)} label="Total Credit Cost (₹)" color="var(--gold)" />
          <CphCard value={fmt(final.creditCostPerCandidate)} label="Credit Cost per Candidate" color="#a78bfa" />
          <CphCard value={fmt(final.creditCostPerHire)} label="Credit Cost per Hire" color="var(--green)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { title: '📝 Assessment Credits', accentColor: 'var(--accent)', data: [['Creation credits', credits.assessCreationCredits.toLocaleString('en-IN')], ['Completion credits', credits.assessCompletionCredits.toLocaleString('en-IN')]], subtotal: fmt(credits.assessCreditCost) },
            { title: '🎙️ Interview Credits', accentColor: '#a78bfa', data: [['Creation credits', credits.intCreationCredits.toLocaleString('en-IN')], ['Completion credits', credits.intCompletionCredits.toLocaleString('en-IN')]], subtotal: fmt(credits.intCreditCost) },
          ].map(({ title, accentColor, data, subtotal }) => (
            <div key={title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{title}</div>
              {data.map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{ color: accentColor, fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', marginTop: 4, borderTop: `1px solid ${accentColor}30`, fontSize: 13 }}>
                <span style={{ color: '#a0522d', fontWeight: 600 }}>Subtotal</span>
                <span style={{ color: accentColor, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{subtotal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-hire metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <CphCard value={fmt(final.costPerHireTrad)} label="Cost per Hire (Traditional)" color="#f87171" />
        <CphCard value={fmt(final.costPerHireSB)} label="Cost per Hire (Skillbrew)" color="var(--accent)" />
        <CphCard value={fmt(final.costPerHireSavings)} label="Savings per Hire" color="var(--green)" />
        <CphCard value={`${final.roiMultiple.toFixed(1)}x`} label="ROI on Skillbrew Subscription" color="var(--gold)" />
      </div>

      {/* Time breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        <CompareCard variant="traditional" icon="⏱️" title="Time Breakdown (Traditional)" subtitle="">
          {[
            ['JD Creation Hours', fmtH(trad.totalJDHours)],
            ['Posting Management Hours', fmtH(trad.postingHours)],
            ['Screening Hours', fmtH(trad.totalScreenHours)],
            ['Calling Hours', fmtH(trad.callHours)],
            ['Interview Hours', fmtH(trad.interviewHours)],
            ['Coordination Hours', fmtH(trad.coordHours)],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ color: '#f87171', fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 8, borderTop: '1px solid rgba(239,68,68,0.2)', fontSize: 14 }}>
            <span style={{ fontWeight: 600, color: '#a0522d' }}>Total Hours / Year</span>
            <span style={{ color: '#f87171', fontWeight: 600, fontFamily: "'Syne', sans-serif", fontSize: '1.1rem' }}>{fmtH(trad.totalHours)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 14 }}>
            <span style={{ fontWeight: 600, color: '#a0522d' }}>Working Days</span>
            <span style={{ color: '#f87171', fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>{Math.round(trad.totalHours / 8)} days</span>
          </div>
        </CompareCard>

        <CompareCard variant="skillbrew" icon="⚡" title="Time Breakdown (Skillbrew)" subtitle="">
          {[
            ['JD Creation Hours', fmtH(sb.sbJDHours)],
            ['Posting Mgmt (automated)', fmtH(sb.sbPostingHours)],
            ['Screening Hours', fmtH(sb.sbScreenHours)],
            ['Calling Hours', fmtH(sb.sbCallHours)],
            ['AI Interview Hours', fmtH(sb.sbInterviewHours)],
            ['Coordination Hours', fmtH(sb.sbCoordHours)],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{l}</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 8, borderTop: '1px solid rgba(0,212,170,0.2)', fontSize: 14 }}>
            <span style={{ fontWeight: 600, color: '#a0522d' }}>Total Hours / Year</span>
            <span style={{ color: 'var(--accent)', fontWeight: 600, fontFamily: "'Syne', sans-serif", fontSize: '1.1rem' }}>{fmtH(sb.totalHours)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 14 }}>
            <span style={{ fontWeight: 600, color: '#a0522d' }}>Working Days</span>
            <span style={{ color: 'var(--accent)', fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>{Math.round(sb.totalHours / 8)} days</span>
          </div>
        </CompareCard>
      </div>

      {/* CTA */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,212,170,0.1), rgba(124,58,237,0.1))',
        border: '1px solid rgba(0,212,170,0.2)',
        borderRadius: 20,
        padding: 40,
        textAlign: 'center',
      }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#a0522d', marginBottom: 8 }}>
          Ready to transform your hiring?
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Join companies saving thousands of hours and crores in recruitment costs with Skillbrew.
        </p>
        <button
          style={{
            background: 'var(--accent)',
            color: 'var(--bg)',
            padding: '14px 40px',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            border: 'none',
            fontFamily: "'DM Sans', sans-serif",
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#00eebe';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(0,212,170,0.35)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
            (e.currentTarget as HTMLButtonElement).style.transform = '';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
          }}
        >
          🚀 Book a Skillbrew Demo
        </button>
        <div style={{ marginTop: 16 }}>
          <button
            onClick={onRecalculate}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              padding: '10px 24px',
              borderRadius: 10,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            }}
          >
            ← Recalculate
          </button>
        </div>
      </div>
    </div>
  );
}

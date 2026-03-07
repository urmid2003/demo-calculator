import React from 'react';

interface BtnRowProps {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  isLast?: boolean;
  onCalculate?: () => void;
}

const btnBase: React.CSSProperties = {
  padding: '12px 28px',
  borderRadius: 10,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.95rem',
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  transition: 'all 0.2s',
};

export default function BtnRow({ onBack, onNext, nextLabel, isLast, onCalculate }: BtnRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        paddingTop: 24,
        borderTop: '1px solid var(--border)',
        marginTop: 24,
      }}
    >
      {onBack ? (
        <button
          onClick={onBack}
          style={{
            ...btnBase,
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
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
          ← Back
        </button>
      ) : (
        <div />
      )}

      {isLast && onCalculate ? (
        <button
          onClick={onCalculate}
          style={{
            ...btnBase,
            background: 'linear-gradient(135deg, var(--accent) 0%, #00a3ff 100%)',
            color: 'var(--bg)',
            fontWeight: 600,
            padding: '14px 36px',
            fontSize: '1rem',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(0,212,170,0.35)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = '';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
          }}
        >
          ⚡ Generate ROI Report
        </button>
      ) : onNext ? (
        <button
          onClick={onNext}
          style={{
            ...btnBase,
            background: 'var(--accent)',
            color: 'var(--bg)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#00eebe';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,212,170,0.3)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
            (e.currentTarget as HTMLButtonElement).style.transform = '';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
          }}
        >
          {nextLabel || 'Next'} →
        </button>
      ) : null}
    </div>
  );
}

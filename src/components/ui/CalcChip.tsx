import React from 'react';

export function CalcChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px',
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.8)',
        borderRadius: 8, fontSize: 13,
        boxShadow: '0 2px 8px rgba(180,100,60,0.06)',
      }}
    >
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span
        style={{
          color: 'var(--accent)',
          fontWeight: 600,
          fontFamily: "'Syne', sans-serif",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function CalcResultRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex', flexWrap: 'wrap', gap: 12, padding: 16,
        background: 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.7)',
        borderRadius: 12, marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}

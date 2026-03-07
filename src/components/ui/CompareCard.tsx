import React from 'react';

// ─── CompareRow ──────────────────────────────────────────────────────────────
interface CompareRowProps {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
  accent?: boolean;
  separator?: boolean;
}

export function CompareRow({ label, value, bold, large, accent, separator }: CompareRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: separator ? '12px 0' : '10px 0',
        borderBottom: separator
          ? undefined
          : '1px solid rgba(255,255,255,0.04)',
        marginTop: separator ? 8 : 0,
        borderTop: separator ? '1px solid rgba(255,255,255,0.08)' : undefined,
        fontSize: 14,
      }}
    >
      <span style={{ color: bold ? '#fff' : 'var(--text-muted)', fontWeight: bold ? 600 : 400 }}>
        {label}
      </span>
      <span
        style={{
          fontWeight: 600,
          fontFamily: "'Syne', sans-serif",
          fontSize: large ? '1.1rem' : 14,
          color: accent ? 'inherit' : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── CompareCard ─────────────────────────────────────────────────────────────
interface CompareCardProps {
  variant: 'traditional' | 'skillbrew';
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function CompareCard({ variant, icon, title, subtitle, children }: CompareCardProps) {
  const isTrad = variant === 'traditional';
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: isTrad
            ? 'rgba(239,68,68,0.05)'
            : 'rgba(0,212,170,0.05)',
        }}
      >
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div>
          <h3
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '1rem',
              fontWeight: 700,
              color: isTrad ? '#f87171' : 'var(--accent)',
            }}
          >
            {title}
          </h3>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</div>
        </div>
      </div>
      <div
        style={{
          padding: '20px 24px',
          // override child row colors
          ['--row-value-color' as string]: isTrad ? '#f87171' : 'var(--accent)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── SavingsBar ──────────────────────────────────────────────────────────────
interface SavingsBarProps {
  label: string;
  tradWidth: number;
  brewWidth: number;
  pctSaved: number;
}

export function SavingsBar({ label, tradWidth, brewWidth, pctSaved }: SavingsBarProps) {
  const [animated, setAnimated] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const track: React.CSSProperties = {
    height: 8,
    background: 'var(--surface2)',
    borderRadius: 100,
    overflow: 'hidden',
    position: 'relative',
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
          fontSize: 13,
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
          {Math.max(0, pctSaved)}% saved
        </span>
      </div>
      <div style={track}>
        <div
          style={{
            height: '100%',
            borderRadius: 100,
            background: 'linear-gradient(90deg, #ef4444, #f87171)',
            width: animated ? `${tradWidth}%` : '0%',
            transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
      <div style={{ ...track, marginTop: 4 }}>
        <div
          style={{
            height: '100%',
            borderRadius: 100,
            background: 'linear-gradient(90deg, var(--accent), #00a3ff)',
            width: animated ? `${brewWidth}%` : '0%',
            transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}

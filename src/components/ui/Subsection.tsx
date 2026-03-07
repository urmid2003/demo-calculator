import React from 'react';

interface SubsectionProps {
  title: string;
  children: React.ReactNode;
}

const FORM_GRID: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: 20,
  marginBottom: 24,
};

export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div style={FORM_GRID}>{children}</div>;
}

export default function Subsection({ title, children }: SubsectionProps) {
  return (
    <div
      // the outer wrapper div in Subsection default export — replace the style prop:
      style={{
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.75)',
        borderRadius: 14,
        padding: 24,
        marginBottom: 16,
        boxShadow: '0 4px 24px rgba(180,100,60,0.06)',
      }}
    >
      <h3
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '1rem',
          fontWeight: 600,
          color: '#a0522d',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            width: 3,
            height: 16,
            background: 'var(--accent)',
            borderRadius: 2,
            display: 'inline-block',
          }}
        />
        {title}
      </h3>
      {children}
    </div>
  );
}

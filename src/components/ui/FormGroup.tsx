import React from 'react';

interface FormGroupProps {
  label: string;
  children: React.ReactNode;
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

export const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  border: '1px solid rgba(180,100,60,0.18)',
  borderRadius: 10,
  padding: '12px 16px',
  color: 'var(--text)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.95rem',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function FormGroup({ label, children }: FormGroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// Shared numeric input component
interface NumInputProps {
  id?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}

export function NumInput({ id, value, min, max, step = 1, onChange }: NumInputProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <input
      id={id}
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        borderColor: focused ? 'var(--accent)' : 'var(--border)',
        boxShadow: focused ? '0 0 0 3px rgba(192,112,90,0.15)' : 'none',
      }}
    />
  );
}

// Select component
interface SelectInputProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

export function SelectInput({ value, options, onChange }: SelectInputProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        borderColor: focused ? 'var(--accent)' : 'var(--border)',
        boxShadow: focused ? '0 0 0 3px rgba(192,112,90,0.15)' : 'none',
        cursor: 'pointer',
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: 'var(--surface)' }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

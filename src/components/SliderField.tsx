import React from 'react';

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatValue?: (val: number) => string;
  formatMark?: (val: number) => string;
}

export const SliderField: React.FC<SliderFieldProps> = ({
  label, value, min, max, step = 1, onChange, formatValue, formatMark
}) => {
  const diff = max - min;
  const markValues = [min, min + diff * 0.25, min + diff * 0.5, min + diff * 0.75, max];

  return (
    <div className="slider-group">
      <div className="slider-label">
        <span>{label}</span>
        <span className="slider-value">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <div style={{ position: 'relative' }}>
        <input 
          type="range" 
          min={min} max={max} step={step}
          value={value} 
          onChange={onChange}
          style={{ width: '100%', display: 'block' }}
        />
        <div className="slider-marks">
          {markValues.map((v, i) => (
            <div 
              key={i} 
              className={`slider-mark ${i === 0 ? 'first' : i === 4 ? 'last' : ''}`}
              style={{ left: `${i * 25}%` }}
            >
              {formatMark ? formatMark(v) : Math.round(v)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

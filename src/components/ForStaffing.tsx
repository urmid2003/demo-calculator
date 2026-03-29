import React, { useState, useEffect } from 'react';
import { calculateStaffingROI, StaffingInputs } from '../calculations/staffing';
import { SliderField } from './SliderField';
import { FeatureAnimatedCard } from './FeatureAnimatedCard';
import { Info, IndianRupee, Timer, TrendingUp, Users } from 'lucide-react';
import { motion, useSpring, useTransform } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Formatter to handle lacs/lakhs format
const formatLacs = (val: number, prefix = '') => {
  if (val >= 10000000) {
    const crores = val / 10000000;
    return `${prefix}${parseFloat(crores.toFixed(2))}Cr`;
  }
  if (val >= 100000) {
    const lacs = val / 100000;
    // Replace trailing .0 if present -> 5.3 L
    return `${prefix}${lacs.toFixed(1).replace(/\.0$/, '')}L`;
  }
  if (val >= 1000) {
    return `${prefix}${Math.round(val / 1000)}k`;
  }
  return `${prefix}${Math.round(val)}`;
};

// Animated Number Component
const AnimatedNumber: React.FC<{ value: number; prefix?: string; suffix?: string; isCurrency?: boolean }> = ({ value, prefix = '', suffix = '', isCurrency = false }) => {
  const spring = useSpring(0, { bounce: 0, damping: 20, stiffness: 60 });
  const display = useTransform(spring, (current) => {
    if (isCurrency && current >= 1000) {
      return formatLacs(current, prefix) + suffix;
    }
    return `${prefix}${Math.round(current).toLocaleString('en-IN')}${suffix}`;
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};

// Custom Tooltip for Recharts
interface TooltipPayload {
  fill: string;
  value: number;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: { fill: string; value: number }[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '14px' }}>
        <p style={{ margin: 0, fontWeight: 600, marginBottom: '5px' }}>{label}</p>
        <p style={{ margin: 0, color: '#3c71b6', fontWeight: 600 }}>Skillbrew: <strong>{formatLacs(payload[0].value, '₹')}</strong></p>
        <p style={{ margin: 0, color: '#da6220', fontWeight: 600 }}>Current: <strong>{formatLacs(payload[1].value, '₹')}</strong></p>
      </div>
    );
  }
  return null;
};

// Formatter to force legend colors to be readable rather than washing out
const renderLegendText = (value: string, entry: any) => {
  const color = value === 'Skillbrew' ? '#3c71b6' : '#da6220';
  return <span style={{ color, fontWeight: 600 }}>{value}</span>;
};

export const ForStaffing: React.FC = () => {
  const savedRecruiters = localStorage.getItem('skillbrew_staffing_recruiters');
  const [inputs, setInputs] = useState<StaffingInputs>({
    jobsPosted: 120,
    recruitersOnTeam: savedRecruiters ? Number(savedRecruiters) : 3,
    successfulClosures: 60,
    candidatesPerRole: 50,
  });

  const results = calculateStaffingROI(inputs);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof StaffingInputs) => {
    setInputs(prev => ({ ...prev, [key]: Number(e.target.value) }));
  };

  // Prepare data array for Recharts (Annualized natively via inputs)
  const chartData = [
    {
      name: 'Revenue',
      Skillbrew: results.skillbrew.revenue,
      Current: results.current.revenue,
    },
    {
      name: 'Job Posting Cost',
      Skillbrew: results.skillbrew.jobPostingCost,
      Current: results.current.jobPostingCost,
    },
    {
      name: 'Screening Cost',
      Skillbrew: results.skillbrew.screeningCost,
      Current: results.current.screeningCost,
    },
  ];

  return (
    <div className="grid-layout">
      {/* Left Column: Sliders */}
      <aside className="sidebar">
        <SliderField
          label="Jobs posted (Annual)"
          value={inputs.jobsPosted}
          min={0} max={1000} step={10}
          onChange={(e) => handleSliderChange(e, 'jobsPosted')}
          formatMark={formatLacs}
        />
        <SliderField
          label="Successful closures (Annual)"
          value={inputs.successfulClosures}
          min={0} max={500} step={10}
          onChange={(e) => handleSliderChange(e, 'successfulClosures')}
          formatMark={formatLacs}
        />
        <SliderField
          label="Candidates per role (screening before shortlisting)"
          value={inputs.candidatesPerRole}
          min={0} max={1000} step={10}
          onChange={(e) => handleSliderChange(e, 'candidatesPerRole')}
          formatMark={formatLacs}
        />
        <FeatureAnimatedCard />
      </aside>

      {/* Right Column: Chart & Tickets */}
      <div className="main-content">
        
        {/* Top: Chart Component */}
        <div className="chart-card">
          <div className="chart-header-row" style={{ marginBottom: '1rem' }}>
            <h3 className="chart-title">
              Cost & Revenue Comparison
              <div className="info-icon">
                <Info size={18} />
                <div className="info-tooltip glassy-blue" style={{ width: '280px', textAlign: 'center', fontWeight: '500', fontSize: '0.85rem', lineHeight: '1.4', padding: '12px' }}>
                  Market data assumes current averages based on standard ATS usage, manual screening taking 40% of time, and portal fees. <strong style={{ color: 'var(--primary-blue)' }}>Skillbrew math reflects our optimized intelligence suite.</strong>
                </div>
              </div>
            </h3>
          </div>

          <div style={{ width: '100%', height: 300 }}>
             <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600, fill: 'var(--text-primary)' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis 
                   tickFormatter={(val) => formatLacs(val, '₹')} 
                   tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                   axisLine={false}
                   tickLine={false}
                   dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Legend 
                  wrapperStyle={{ paddingTop: '15px' }} 
                  iconType="circle" 
                  formatter={renderLegendText}
                />
                <Bar 
                  dataKey="Skillbrew" 
                  fill="#d5f0ff" 
                  stroke="#3c71b6" 
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#d5f0ff" stroke="#3c71b6" />
                  ))}
                </Bar>
                <Bar 
                  dataKey="Current" 
                  fill="#f89a53" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                >
                   {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#f89a53" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom: Tickets Grid */}
        <div className="tickets-grid">
          <div className="ticket-card">
            <div className="ticket-icon-wrapper">
              <IndianRupee size={24} />
            </div>
            <div className="ticket-content">
              <div className="ticket-title">Increased Annual Revenue</div>
              <div className="ticket-value green">
                <AnimatedNumber value={results.tickets.increasedRevenue} prefix="₹" isCurrency={true} />
              </div>
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-icon-wrapper">
              <Timer size={24} />
            </div>
            <div className="ticket-content">
              <div className="ticket-title">Annual Filtering Hours Saved</div>
              <div className="ticket-value blue">
                <AnimatedNumber value={results.tickets.filteringHoursSaved} />
              </div>
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-icon-wrapper">
              <TrendingUp size={24} />
            </div>
            <div className="ticket-content">
              <div className="ticket-title">More Successful Closures</div>
              <div className="ticket-value green">
                <AnimatedNumber value={results.tickets.moreSuccessfulClosuresPercentage} suffix="%" />
              </div>
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-icon-wrapper">
              <Users size={24} />
            </div>
            <div className="ticket-content">
              <div className="ticket-title">Annual Hours Saved on Shortlist</div>
              <div className="ticket-value blue">
                <AnimatedNumber value={results.tickets.hoursSavedOnShortlisting} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

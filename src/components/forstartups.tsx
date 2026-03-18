import React, { useState, useEffect } from 'react';
import { calculateStartupROI, StartupInputs } from '../calculations/startup';
import { IndianRupee, Clock, TrendingDown, ShieldCheck, Wallet, Info } from 'lucide-react';
import { motion, useSpring, useTransform } from 'framer-motion';

// Formatter to handle lacs/lakhs format
const formatLacs = (val: number, prefix = '') => {
  if (val >= 100000) {
    const lacs = val / 100000;
    return `${prefix}${lacs.toFixed(1).replace(/\.0$/, '')}L`;
  }
  if (val >= 1000) {
    return `${prefix}${Math.round(val / 1000)}k`;
  }
  return `${prefix}${Math.round(val)}`;
};

const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

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

export const ForStartups: React.FC = () => {
  const [inputs, setInputs] = useState<StartupInputs>({
    hiresPlanned: 6,
    founderHoursPerHire: 30,
    founderHourlyValue: 1000,
    jobPostingBudget: 40000,
    toolSubscriptions: 25000,
  });

  const results = calculateStartupROI(inputs);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof StartupInputs) => {
    setInputs(prev => ({ ...prev, [key]: Number(e.target.value) }));
  };

  return (
    <div className="grid-layout">
      {/* Left Column: Sliders */}
      <aside className="sidebar">
        <div className="slider-group">
          <div className="slider-label">
            <span>Hires planned this year</span>
            <span className="slider-value">{inputs.hiresPlanned}</span>
          </div>
          <input
            type="range"
            min="1" max="30"
            value={inputs.hiresPlanned}
            onChange={(e) => handleSliderChange(e, 'hiresPlanned')}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Founder hours per hire</span>
            <span className="slider-value">{inputs.founderHoursPerHire} hrs</span>
          </div>
          <input
            type="range"
            min="5" max="60"
            value={inputs.founderHoursPerHire}
            onChange={(e) => handleSliderChange(e, 'founderHoursPerHire')}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Founder hourly value (₹)</span>
            <span className="slider-value">{formatCurrency(inputs.founderHourlyValue)}</span>
          </div>
          <input
            type="range"
            min="200" max="5000" step="100"
            value={inputs.founderHourlyValue}
            onChange={(e) => handleSliderChange(e, 'founderHourlyValue')}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Job posting budget (annual)</span>
            <span className="slider-value">{formatCurrency(inputs.jobPostingBudget)}</span>
          </div>
          <input
            type="range"
            min="0" max="200000" step="5000"
            value={inputs.jobPostingBudget}
            onChange={(e) => handleSliderChange(e, 'jobPostingBudget')}
          />
        </div>

        <div className="slider-group" style={{ marginBottom: 0 }}>
          <div className="slider-label">
            <span>Tool subscriptions (annual)</span>
            <span className="slider-value">{formatCurrency(inputs.toolSubscriptions)}</span>
          </div>
          <input
            type="range"
            min="0" max="200000" step="5000"
            value={inputs.toolSubscriptions}
            onChange={(e) => handleSliderChange(e, 'toolSubscriptions')}
          />
        </div>
      </aside>

      {/* Right Column: Savings Hero + Tickets */}
      <div className="main-content">

        {/* Hero Savings Card */}
        <div className="savings-hero-card">
          <div className="savings-hero-inner">
            <div className="savings-hero-left">
              <div className="savings-hero-label">
                <Clock size={20} />
                Founder Time + Money Saved
              </div>
              <div className="savings-hero-amount">
                <AnimatedNumber value={results.totalSavings} prefix="₹" isCurrency={true} />
              </div>
              <div className="savings-hero-sub">
                <strong><AnimatedNumber value={results.founderHoursReclaimed} /></strong> founder hours reclaimed this year
              </div>
            </div>
            <div className="savings-hero-right">
              <div className="savings-percent-ring">
                <svg viewBox="0 0 120 120" className="percent-svg">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                  <motion.circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 50}
                    initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - results.savingsPercent / 100) }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                  />
                </svg>
                <div className="percent-text">
                  <AnimatedNumber value={results.savingsPercent} suffix="%" />
                </div>
              </div>
              <div className="savings-percent-label">Cost Reduced</div>
            </div>
          </div>
        </div>

        {/* Bottom: Tickets Grid */}
        <div className="tickets-grid">
          <div className="ticket-card">
            <div className="ticket-icon-wrapper">
              <Clock size={24} />
            </div>
            <div className="ticket-content">
              <div className="ticket-title">Founder Hours Saved</div>
              <div className="ticket-value blue">
                <AnimatedNumber value={results.tickets.founderHoursSaved} suffix=" hrs" />
              </div>
              <div className="ticket-subtitle">back to building your product</div>
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-icon-wrapper">
              <TrendingDown size={24} />
            </div>
            <div className="ticket-content">
              <div className="ticket-title">Cost Per Hire Reduced</div>
              <div className="ticket-value green">
                <AnimatedNumber value={results.tickets.costPerHireReduction} suffix="%" />
              </div>
              <div className="ticket-subtitle">lower than current spend</div>
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <ShieldCheck size={24} />
            </div>
            <div className="ticket-content">
              <div className="ticket-title">Fewer Bad Hires</div>
              <div className="ticket-value green">
                <AnimatedNumber value={results.tickets.badHireReduction} suffix="%" />
              </div>
              <div className="ticket-subtitle">AI-matched, assessed candidates</div>
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Wallet size={24} />
            </div>
            <div className="ticket-content">
              <div className="ticket-title">Tool Costs Eliminated</div>
              <div className="ticket-value" style={{ color: '#d97706' }}>
                <AnimatedNumber value={results.tickets.toolCostEliminated} prefix="₹" isCurrency={true} />
              </div>
              <div className="ticket-subtitle">portals + tools replaced</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

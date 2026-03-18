import React, { useState, useEffect } from 'react';
import { calculateCorporateROI, CorporateInputs } from '../calculations/corporate';
import { Info, IndianRupee, Timer, TrendingUp, Users, Zap, Target } from 'lucide-react';
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

// Format currency for slider labels — e.g. ₹71,800
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

export const ForCorporates: React.FC = () => {
  const [inputs, setInputs] = useState<CorporateInputs>({
    positionsToFill: 12,
    hrTeamSize: 3,
    costPerHire: 71800,
    filteringToolCost: 90000,
    screeningToolCost: 0,
    jobPostingPremiumCost: 144000,
  });

  const results = calculateCorporateROI(inputs);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof CorporateInputs) => {
    setInputs(prev => ({ ...prev, [key]: Number(e.target.value) }));
  };

  return (
    <div className="grid-layout">
      {/* Left Column: Sliders */}
      <aside className="sidebar">
        <div className="slider-group">
          <div className="slider-label">
            <span>Positions to fill (per year)</span>
            <span className="slider-value">{inputs.positionsToFill}</span>
          </div>
          <input
            type="range"
            min="1" max="200"
            value={inputs.positionsToFill}
            onChange={(e) => handleSliderChange(e, 'positionsToFill')}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>HR team size</span>
            <span className="slider-value">{inputs.hrTeamSize}</span>
          </div>
          <input
            type="range"
            min="1" max="30"
            value={inputs.hrTeamSize}
            onChange={(e) => handleSliderChange(e, 'hrTeamSize')}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Cost per hire (₹)</span>
            <span className="slider-value">{formatCurrency(inputs.costPerHire)}</span>
          </div>
          <input
            type="range"
            min="20000" max="200000" step="1000"
            value={inputs.costPerHire}
            onChange={(e) => handleSliderChange(e, 'costPerHire')}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Filtering tool cost (annual)</span>
            <span className="slider-value">{formatCurrency(inputs.filteringToolCost)}</span>
          </div>
          <input
            type="range"
            min="0" max="500000" step="5000"
            value={inputs.filteringToolCost}
            onChange={(e) => handleSliderChange(e, 'filteringToolCost')}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Screening tool cost (annual)</span>
            <span className="slider-value">{formatCurrency(inputs.screeningToolCost)}</span>
          </div>
          <input
            type="range"
            min="0" max="500000" step="5000"
            value={inputs.screeningToolCost}
            onChange={(e) => handleSliderChange(e, 'screeningToolCost')}
          />
        </div>

        <div className="slider-group" style={{ marginBottom: 0 }}>
          <div className="slider-label">
            <span>LinkedIn/Naukri premium (annual)</span>
            <span className="slider-value">{formatCurrency(inputs.jobPostingPremiumCost)}</span>
          </div>
          <input
            type="range"
            min="0" max="500000" step="5000"
            value={inputs.jobPostingPremiumCost}
            onChange={(e) => handleSliderChange(e, 'jobPostingPremiumCost')}
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
                <IndianRupee size={20} />
                Total Annual Savings
              </div>
              <div className="savings-hero-amount">
                <AnimatedNumber value={results.totalAnnualSavings} prefix="₹" isCurrency={true} />
              </div>
              <div className="savings-hero-sub">
                vs current spend of <strong>{formatLacs(results.totalAnnualCostCurrent, '₹')}</strong>/year
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
              <Timer size={24} />
            </div>
            <div className="ticket-content">
              <div className="ticket-title">Screening Hours Saved</div>
              <div className="ticket-value blue">
                <AnimatedNumber value={results.tickets.screeningHoursSaved} suffix=" hrs" />
              </div>
              <div className="ticket-subtitle">per year</div>
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-icon-wrapper">
              <Users size={24} />
            </div>
            <div className="ticket-content">
              <div className="ticket-title">Filtering Hours Saved</div>
              <div className="ticket-value blue">
                <AnimatedNumber value={results.tickets.filteringHoursSaved} suffix=" hrs" />
              </div>
              <div className="ticket-subtitle">per year</div>
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Zap size={24} />
            </div>
            <div className="ticket-content">
              <div className="ticket-title">More Automation</div>
              <div className="ticket-value green">
                <AnimatedNumber value={results.tickets.moreAutomationPercent} suffix="%" />
              </div>
              <div className="ticket-subtitle">outreach automated</div>
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Target size={24} />
            </div>
            <div className="ticket-content">
              <div className="ticket-title">More Good Hires</div>
              <div className="ticket-value green">
                <AnimatedNumber value={results.tickets.moreGoodHiresPercent} suffix="%" />
              </div>
              <div className="ticket-subtitle">better hire quality</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

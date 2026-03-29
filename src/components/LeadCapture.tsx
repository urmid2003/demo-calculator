import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface LeadCaptureData {
  recruiters?: number;
  hires?: number;
  internalCosts?: number;
  externalCosts?: number;
  costPerHire?: number;
}

interface LeadCaptureProps {
  onComplete: (data?: LeadCaptureData) => void;
  activeTab: 'staffing' | 'corporates' | 'startups';
}

export const LeadCapture: React.FC<LeadCaptureProps> = ({ onComplete, activeTab }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');

  const isStaffing = activeTab === 'staffing';

  // Unified fields
  const [hires, setHires] = useState(isStaffing ? 120 : (activeTab === 'corporates' ? 200 : 40));
  const [internalCosts, setInternalCosts] = useState(isStaffing ? 1200000 : (activeTab === 'corporates' ? 5000000 : 800000));
  const [externalCosts, setExternalCosts] = useState(isStaffing ? 500000 : (activeTab === 'corporates' ? 2000000 : 300000));
  const [recruiters, setRecruiters] = useState(isStaffing ? 3 : 2);

  const costPerHire = Math.round((internalCosts + externalCosts) / Math.max(1, hires));

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      if (isStaffing) {
        onComplete({ recruiters });
      } else {
        onComplete({ hires, internalCosts, externalCosts, costPerHire });
      }
    }
  };

  return (
    <div className="lead-capture-overlay">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="step1"
            className="lead-capture-modal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="lc-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Calculate Your Cost Per Hire
              <div className="info-icon" style={{ display: 'inline-flex' }}>
                <Info size={18} />
                <div className="info-tooltip glassy-blue" style={{ width: '260px', textAlign: 'center', fontWeight: '500', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>This is how your Cost Per Hire is calculated:</p>
                  <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(255,255,255,0.5)', borderRadius: '8px' }}>
                    <span style={{ fontWeight: '700', color: 'var(--primary-blue)' }}>Total Recruitment Costs</span><br/>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8, color: 'var(--text-secondary)' }}>(Internal + External)</span><br/>
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(5,85,200,0.2)', margin: '6px 0' }} />
                    <span style={{ fontWeight: '700', color: 'var(--primary-blue)' }}>{isStaffing ? 'Number of Placements' : 'Total Number of Hires'}</span>
                  </div>
                </div>
              </div>
            </h2>
            <p className="lc-subtitle">Get a quick estimate before diving into the full ROI analysis.</p>
            
            <form onSubmit={handleCalculate} className="lc-form lc-form-grid">
              <div className="lc-input-group" style={{ gridColumn: '1 / -1' }}>
                <label>{isStaffing ? "Number of Placements / Hires (Annual)" : "Total Number of Hires (Annual)"}</label>
                <input 
                  type="number" 
                  value={hires} 
                  onChange={(e) => setHires(Number(e.target.value))} 
                  min="1"
                  className="lc-input"
                />
              </div>

              {isStaffing && (
                <div className="lc-input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Recruiters on team (active hiring)</label>
                  <input 
                    type="number" 
                    value={recruiters} 
                    onChange={(e) => setRecruiters(Number(e.target.value))} 
                    min="1"
                    className="lc-input"
                  />
                </div>
              )}

              <div className="lc-input-group">
                <label>
                  {isStaffing 
                    ? "Total Internal Costs (₹) (salaries, ATS, job boards)" 
                    : "Total Internal Costs (₹) (HR salaries, ATS, training, overhead)"}
                </label>
                <input 
                  type="number" 
                  value={internalCosts} 
                  onChange={(e) => setInternalCosts(Number(e.target.value))} 
                  min="0"
                  className="lc-input"
                />
              </div>

              <div className="lc-input-group">
                <label>
                  {isStaffing 
                    ? "Total External Costs (₹) (job boards, marketing)" 
                    : "Total External Costs (₹) (job portals, agencies, bgv, ads)"}
                </label>
                <input 
                  type="number" 
                  value={externalCosts} 
                  onChange={(e) => setExternalCosts(Number(e.target.value))} 
                  min="0"
                  className="lc-input"
                />
              </div>
              
              <div className="lc-result">
                <span>Estimated Cost/Hire:</span>
                <strong>₹{costPerHire.toLocaleString('en-IN')}</strong>
              </div>

              <button type="submit" className="lc-button">Let's Calculate</button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="step2"
            className="lead-capture-modal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="lc-title">Unlock Full ROI Analysis</h2>
            <p className="lc-subtitle">Just one step away from seeing your ROI! Add your work email address below and we will also send you a detailed report.</p>
            
            <form onSubmit={handleEmailSubmit} className="lc-form" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="lc-input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Work Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@company.com"
                  required
                  className="lc-input"
                />
              </div>
              <button type="submit" className="lc-button">See ROI</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

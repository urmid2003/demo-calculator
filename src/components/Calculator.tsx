import React, { useState, useEffect } from 'react';
import { ForStaffing } from './ForStaffing';
import { ForCorporates } from './forcorporates';
import { ForStartups } from './forstartups';
import { LeadCapture } from './LeadCapture';
import logo from '../Skillbrew Logo.svg';

type Tab = 'staffing' | 'corporates' | 'startups';

export const Calculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('staffing');
  const [completedTabs, setCompletedTabs] = useState<Record<Tab, boolean>>({
    staffing: false,
    corporates: false,
    startups: false
  });

  useEffect(() => {
    const savedTabs = localStorage.getItem('skillbrew_completed_tabs');
    if (savedTabs) {
      try {
        setCompletedTabs(JSON.parse(savedTabs));
      } catch (e) {
        console.error('Failed to parse completed tabs', e);
      }
    } else {
      // Legacy fallback
      const oldSaved = localStorage.getItem('skillbrew_lead_captured');
      if (oldSaved === 'true') {
        const migrated = { staffing: true, corporates: true, startups: true };
        setCompletedTabs(migrated);
        localStorage.setItem('skillbrew_completed_tabs', JSON.stringify(migrated));
      }
    }
  }, []);

  const handleLeadCaptureComplete = (data?: any) => {
    if (data) {
      if (data.recruiters) localStorage.setItem('skillbrew_staffing_recruiters', data.recruiters.toString());
      if (data.hires) localStorage.setItem(`skillbrew_${activeTab}_hires`, data.hires.toString());
      if (data.costPerHire) localStorage.setItem(`skillbrew_${activeTab}_cph`, data.costPerHire.toString());
      if (data.externalCosts) localStorage.setItem(`skillbrew_${activeTab}_external_costs`, data.externalCosts.toString());
    }
    setCompletedTabs(prev => {
      const updated = { ...prev, [activeTab]: true };
      localStorage.setItem('skillbrew_completed_tabs', JSON.stringify(updated));
      return updated;
    });
  };

  const isCurrentTabCompleted = completedTabs[activeTab];

  return (
    <div className="container">
      <div className="calc-wrapper">
        <header className="calc-header">
          <div className="title-row">
            <img src={logo} alt="Skillbrew Logo" className="header-logo" />
            <h1 className="calc-title">ROI Calculator</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>See how much time and money you save with Skillbrew</p>
        </header>

        <nav className="tabs-container">
          <div 
            className={`tab ${activeTab === 'staffing' ? 'active' : ''}`}
            onClick={() => setActiveTab('staffing')}
          >
            For staffing agency
          </div>
          <div 
            className={`tab ${activeTab === 'corporates' ? 'active' : ''}`}
            onClick={() => setActiveTab('corporates')}
          >
            For corporates
          </div>
          <div 
            className={`tab ${activeTab === 'startups' ? 'active' : ''}`}
            onClick={() => setActiveTab('startups')}
          >
            For startups
          </div>
        </nav>

        <main style={{ position: 'relative' }}>
          <div className={!isCurrentTabCompleted ? 'blurred-content' : ''}>
            {activeTab === 'staffing' && <ForStaffing />}
            {activeTab === 'corporates' && <ForCorporates />}
            {activeTab === 'startups' && <ForStartups />}
          </div>
          
          {!isCurrentTabCompleted && (
            <LeadCapture key={activeTab} activeTab={activeTab} onComplete={handleLeadCaptureComplete} />
          )}
        </main>
      </div>
    </div>
  );
};

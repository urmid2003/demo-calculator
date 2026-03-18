import React, { useState } from 'react';
import { ForStaffing } from './ForStaffing';
import { ForCorporates } from './forcorporates';
import { ForStartups } from './forstartups';
import logo from '../Skillbrew Logo.svg';

type Tab = 'staffing' | 'corporates' | 'startups';

export const Calculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('staffing');

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

        <main>
          {activeTab === 'staffing' && <ForStaffing />}
          {activeTab === 'corporates' && <ForCorporates />}
          {activeTab === 'startups' && <ForStartups />}
        </main>
      </div>
    </div>
  );
};

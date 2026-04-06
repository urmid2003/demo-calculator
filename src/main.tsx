import React from 'react';
import ReactDOM from 'react-dom/client';
import { RoiCalculator } from './components/RoiCalculator';
import './main.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RoiCalculator />
  </React.StrictMode>
);

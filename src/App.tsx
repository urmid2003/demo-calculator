import { useMemo, useState } from 'react';
import { CalculatorProvider } from './context/CalculatorContext';
import BackgroundOrbs from './components/layout/BackgroundOrbs';
import Header from './components/layout/Header';
import ProgressNav from './components/layout/ProgressNav';
import { clampStepId, renderStep, type StepId } from './app/stepFlow';

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepId>(0);
  const [hasCalculated, setHasCalculated] = useState(false);

  const goToStep = (n: number) => {
    const next = clampStepId(n);
    if (next === 6 && !hasCalculated) return;
    setCurrentStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCalculate = () => {
    setHasCalculated(true);
    setCurrentStep(6);
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  const handleRecalculate = () => {
    setHasCalculated(false);
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const wrapperStyle: React.CSSProperties = useMemo(
    () => ({
      position: 'relative',
      zIndex: 1,
      maxWidth: 1280,
      margin: '0 auto',
      padding: '0 24px 80px',
    }),
    [],
  );

  return (
    <CalculatorProvider>
      <BackgroundOrbs />
      <div style={wrapperStyle}>
        <Header />
        <ProgressNav currentStep={currentStep} onNavigate={step => goToStep(step)} canViewResults={hasCalculated} />

        <div id={currentStep === 6 ? 'results-section' : undefined}>
          {renderStep({
            step: currentStep,
            goTo: (step: StepId) => goToStep(step),
            calculate: handleCalculate,
            recalculate: handleRecalculate,
          })}
        </div>
      </div>
    </CalculatorProvider>
  );
}

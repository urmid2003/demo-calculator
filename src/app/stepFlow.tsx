import type { ReactNode } from 'react';

import Step1Requirements from '../components/steps/Step1Requirements';
import Step2JobSourcing from '../components/steps/Step2JobSourcing';
import Step3Screening from '../components/steps/Step3Screening';
import Step4CallsInterviews from '../components/steps/Step4CallsInterviews';
import Step5SkillbrewSetup from '../components/steps/Step5SkillbrewSetup';
import Step6CreditPricing from '../components/steps/Step6CreditPricing';
import ResultsSection from '../components/steps/ResultsSection';

export const STEP_LABELS = [
  'Requirements',
  'Job Sourcing',
  'Screening',
  'Calls & Interviews',
  'Skillbrew Setup',
  'Credit Pricing',
  'Results',
] as const;

export type StepId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function clampStepId(n: number): StepId {
  if (n <= 0) return 0;
  if (n >= 6) return 6;
  return n as StepId;
}

export interface StepRenderContext {
  step: StepId;
  goTo: (step: StepId) => void;
  calculate: () => void;
  recalculate: () => void;
}

export function renderStep(ctx: StepRenderContext): ReactNode {
  switch (ctx.step) {
    case 0:
      return <Step1Requirements onNext={() => ctx.goTo(1)} />;
    case 1:
      return (
        <Step2JobSourcing
          onBack={() => ctx.goTo(0)}
          onNext={() => ctx.goTo(2)}
        />
      );
    case 2:
      return (
        <Step3Screening
          onBack={() => ctx.goTo(1)}
          onNext={() => ctx.goTo(3)}
        />
      );
    case 3:
      return (
        <Step4CallsInterviews
          onBack={() => ctx.goTo(2)}
          onNext={() => ctx.goTo(4)}
        />
      );
    case 4:
      return (
        <Step5SkillbrewSetup
          onBack={() => ctx.goTo(3)}
          onNext={() => ctx.goTo(5)}
        />
      );
    case 5:
      return <Step6CreditPricing onBack={() => ctx.goTo(4)} onCalculate={ctx.calculate} />;
    case 6:
      return <ResultsSection onRecalculate={ctx.recalculate} />;
    default: {
      const _exhaustive: never = ctx.step;
      return _exhaustive;
    }
  }
}


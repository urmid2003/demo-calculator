import { STEP_LABELS, type StepId } from '../../app/stepFlow';

interface ProgressNavProps {
  currentStep: StepId;
  onNavigate: (step: StepId) => void;
  canViewResults: boolean;
}

export default function ProgressNav({ currentStep, onNavigate, canViewResults }: ProgressNavProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 0,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 8,
        marginBottom: 32,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {STEP_LABELS.map((label, i) => {
        const step = i as StepId;
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        const isResults = step === 6;
        const isDisabled = isResults && !canViewResults;

        return (
          <div
            key={i}
            onClick={() => {
              if (!isDisabled) onNavigate(step);
            }}
            style={{
              flex: 1,
              minWidth: 120,
              padding: '10px 16px',
              borderRadius: 10,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              opacity: isDisabled ? 0.5 : 1,
              color: isActive || isDone ? 'var(--accent)' : 'var(--text-muted)',
              background: isActive ? 'rgba(0,212,170,0.12)' : 'transparent',
              border: isActive ? '1px solid rgba(0,212,170,0.2)' : '1px solid transparent',
            }}
            role="button"
            aria-current={isActive ? 'step' : undefined}
            aria-disabled={isDisabled || undefined}
            tabIndex={isDisabled ? -1 : 0}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: isActive
                  ? 'var(--accent)'
                  : isDone
                  ? 'rgba(0,212,170,0.2)'
                  : 'var(--border)',
                fontSize: 10,
                marginRight: 6,
                color: isActive ? 'var(--bg)' : isActive || isDone ? 'var(--accent)' : undefined,
                transition: 'all 0.2s',
              }}
            >
              {i + 1}
            </span>
            {label}
          </div>
        );
      })}
    </div>
  );
}

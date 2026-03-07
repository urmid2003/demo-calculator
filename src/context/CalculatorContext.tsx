import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
} from 'react';
import type { CalcInputs } from '../lib/calculations';

// ─── default values ──────────────────────────────────────────────────────────
export const DEFAULT_INPUTS: CalcInputs = {
  num_positions: 50,
  num_departments: 5,
  candidates_per_job: 120,
  shortlisted_per_job: 15,
  hr_team_size: 3,
  offer_acceptance: 75,
  jd_time: 3,
  jd_salary: 60000,
  jd_revisions: 2,
  platforms: { linkedin: true, naukri: true, indeed: false, shine: false, monster: false, iimjobs: false },
  platform_cost: 15000,
  posting_time: 45,
  reposts: 3,
  resume_time: 4,
  screening_salary: 45000,
  second_review_time: 6,
  second_review_pct: 20,
  call_duration: 15,
  scheduling_time: 10,
  caller_salary: 45000,
  interview_rounds: 3,
  interview_duration: 45,
  num_interviewers: 2,
  interviewer_salary: 100000,
  interview_conversion: 80,
  coord_hours: 2,
  coord_salary: 50000,
  sb_jd_time: 20,
  sb_cost: 180000,
  sb_db_pct: 25,
  sb_screen_sec: 3,
  sb_hr_review: 2,
  manual_assess_time: 4,
  sb_assess_time: 10,
  sb_assess_pct: 60,
  manual_eval_time: 15,
  interview_mode: 'hybrid',
  sb_interview_time: 20,
  sb_coord_reduction: 70,
  cr_assess_proct_created: 30,
  cr_assess_unproct_created: 20,
  cr_assess_proct_cands: 300,
  cr_assess_unproct_cands: 450,
  cr_int_proct_created: 25,
  cr_int_unproct_created: 25,
  cr_int_proct_cands: 200,
  cr_int_unproct_cands: 150,
};

// ─── actions ─────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_FIELD'; field: keyof CalcInputs; value: number | string }
  | { type: 'TOGGLE_PLATFORM'; platform: string }
  | { type: 'RESET' };

function reducer(state: CalcInputs, action: Action): CalcInputs {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'TOGGLE_PLATFORM':
      return {
        ...state,
        platforms: {
          ...state.platforms,
          [action.platform]: !state.platforms[action.platform],
        },
      };
    case 'RESET':
      return DEFAULT_INPUTS;
    default:
      return state;
  }
}

// ─── context ─────────────────────────────────────────────────────────────────
interface ContextValue {
  inputs: CalcInputs;
  dispatch: React.Dispatch<Action>;
  setField: (field: keyof CalcInputs, value: number | string) => void;
  togglePlatform: (platform: string) => void;
  reset: () => void;
}

const CalculatorContext = createContext<ContextValue | null>(null);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [inputs, dispatch] = useReducer(reducer, DEFAULT_INPUTS);

  const setField = (field: keyof CalcInputs, value: number | string) =>
    dispatch({ type: 'SET_FIELD', field, value });

  const togglePlatform = (platform: string) =>
    dispatch({ type: 'TOGGLE_PLATFORM', platform });

  const reset = () => dispatch({ type: 'RESET' });

  return (
    <CalculatorContext.Provider value={{ inputs, dispatch, setField, togglePlatform, reset }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator(): ContextValue {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error('useCalculator must be used within CalculatorProvider');
  return ctx;
}

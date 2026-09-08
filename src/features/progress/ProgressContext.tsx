/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { loadProgress, saveProgress } from '../../lib/storage';
import type { LessonId, ProgressState, StarCount } from '../../types';
import { progressReducer } from './progressReducer';

interface ProgressContextValue {
  state: ProgressState;
  recordResult: (lessonId: LessonId, stars: StarCount) => void;
  resetAll: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, undefined, loadProgress);

  useEffect(() => {
    saveProgress(state);
  }, [state]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      recordResult: (lessonId, stars) => {
        dispatch({ type: 'RECORD_RESULT', lessonId, stars });
      },
      resetAll: () => {
        dispatch({ type: 'RESET_ALL' });
      },
    }),
    [state],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) {
    throw new Error('useProgress must be used inside ProgressProvider');
  }
  return value;
}

import type { Attempt, Exercise } from '../../types';

export interface SessionState {
  exercises: Exercise[];
  index: number;
  attemptsForCurrent: number;
  results: Attempt[];
  phase: 'answering' | 'correct' | 'wrong';
}

export type SessionAction =
  | { type: 'ANSWER'; correct: boolean }
  | { type: 'CLEAR_FEEDBACK' }
  | { type: 'ADVANCE' };

export function createSession(exercises: Exercise[]): SessionState {
  return {
    exercises,
    index: 0,
    attemptsForCurrent: 0,
    results: [],
    phase: 'answering',
  };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'ANSWER': {
      if (state.phase !== 'answering') {
        return state;
      }
      const attempts = state.attemptsForCurrent + 1;
      const current = state.exercises[state.index];
      if (!current) {
        return state;
      }
      if (action.correct) {
        return {
          ...state,
          attemptsForCurrent: attempts,
          phase: 'correct',
          results: [...state.results, { id: current.id, attempts }],
        };
      }
      return {
        ...state,
        attemptsForCurrent: attempts,
        phase: 'wrong',
      };
    }
    case 'CLEAR_FEEDBACK':
      if (state.phase !== 'wrong') {
        return state;
      }
      return { ...state, phase: 'answering' };
    case 'ADVANCE':
      return {
        ...state,
        index: state.index + 1,
        attemptsForCurrent: 0,
        phase: 'answering',
      };
    default: {
      const _never: never = action;
      return _never;
    }
  }
}

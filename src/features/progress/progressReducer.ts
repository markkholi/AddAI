import type { LessonId, ProgressState, StarCount } from '../../types';
import { defaultProgress } from '../../lib/storage';

export type ProgressAction =
  | { type: 'RECORD_RESULT'; lessonId: LessonId; stars: StarCount }
  | { type: 'RESET_ALL' };

export function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'RECORD_RESULT': {
      const previous = state.lessons[action.lessonId];
      return {
        ...state,
        lessons: {
          ...state.lessons,
          [action.lessonId]: {
            bestStars: action.stars > previous.bestStars ? action.stars : previous.bestStars,
            timesCompleted: previous.timesCompleted + 1,
            lastPlayedAt: Date.now(),
          },
        },
      };
    }
    case 'RESET_ALL':
      return defaultProgress();
    default: {
      const _never: never = action;
      return _never;
    }
  }
}

import type { LessonId, LessonProgress, ProgressState } from '../types';

export const PROGRESS_KEY = 'addai.progress.v1';

const LESSON_IDS: LessonId[] = [
  'add-with-pictures',
  'make-a-ten',
  'number-sentences',
];

function emptyLesson(): LessonProgress {
  return { bestStars: 0, timesCompleted: 0, lastPlayedAt: 0 };
}

export function defaultProgress(): ProgressState {
  return {
    version: 1,
    lessons: {
      'add-with-pictures': emptyLesson(),
      'make-a-ten': emptyLesson(),
      'number-sentences': emptyLesson(),
    },
  };
}

function isStarCount(value: unknown): value is LessonProgress['bestStars'] {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

function isLessonProgress(value: unknown): value is LessonProgress {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    isStarCount(record.bestStars) &&
    typeof record.timesCompleted === 'number' &&
    typeof record.lastPlayedAt === 'number'
  );
}

function isProgressState(value: unknown): value is ProgressState {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (record.version !== 1 || !record.lessons || typeof record.lessons !== 'object') {
    return false;
  }
  const lessons = record.lessons as Record<string, unknown>;
  return LESSON_IDS.every((id) => isLessonProgress(lessons[id]));
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      return defaultProgress();
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isProgressState(parsed)) {
      return defaultProgress();
    }
    return parsed;
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota — progress just won't persist.
  }
}

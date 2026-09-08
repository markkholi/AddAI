export type LessonId = 'add-with-pictures' | 'make-a-ten' | 'number-sentences';

export type ObjectIcon = 'frog' | 'apple' | 'star' | 'fish';

export type StarCount = 0 | 1 | 2 | 3;

export type TeachIllustration =
  | 'frogs-groups'
  | 'frogs-count'
  | 'frogs-sentence'
  | 'frame-empty'
  | 'frame-partial'
  | 'frame-full'
  | 'sentence-full'
  | 'sentence-blank'
  | 'sentence-drag';

export interface TeachStep {
  heading: string;
  body: string;
  illustration: TeachIllustration;
}

export interface Lesson {
  id: LessonId;
  title: string;
  subtitle: string;
  icon: string;
  steps: TeachStep[];
}

export interface ExerciseBase {
  id: string;
  prompt: string;
  hint: string;
}

export interface CountObjectsExercise extends ExerciseBase {
  kind: 'count-objects';
  groups: [number, number];
  icon: ObjectIcon;
  choices: number[];
  answer: number;
}

export interface TenFrameBuildExercise extends ExerciseBase {
  kind: 'ten-frame-build';
  addends: [number, number];
  answer: number;
}

export interface NumberSentenceDropExercise extends ExerciseBase {
  kind: 'number-sentence-drop';
  template: [number | null, number | null, number | null];
  tiles: number[];
}

export type Exercise =
  | CountObjectsExercise
  | TenFrameBuildExercise
  | NumberSentenceDropExercise;

export interface Attempt {
  id: string;
  attempts: number;
}

export interface LessonProgress {
  bestStars: StarCount;
  timesCompleted: number;
  lastPlayedAt: number;
}

export interface ProgressState {
  version: 1;
  lessons: Record<LessonId, LessonProgress>;
}

export interface ExerciseProps<E extends Exercise> {
  exercise: E;
  onAnswer: (correct: boolean) => void;
  locked: boolean;
}

export interface ResultsLocationState {
  results: Attempt[];
  sessionId: string;
}

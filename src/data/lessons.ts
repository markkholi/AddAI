import type { Lesson, LessonId } from '../types';

export const LESSONS: Lesson[] = [
  {
    id: 'add-with-pictures',
    title: 'Add with Pictures',
    subtitle: 'Count the critters!',
    icon: '🐸',
    steps: [
      {
        heading: 'Two groups of frogs!',
        body: 'Adding means putting groups together.',
        illustration: 'frogs-groups',
      },
      {
        heading: 'Count them all.',
        body: 'Point at each frog and count: 1, 2, 3, 4, 5.',
        illustration: 'frogs-count',
      },
      {
        heading: "That's 3 + 2 = 5!",
        body: 'Five frogs altogether. You added!',
        illustration: 'frogs-sentence',
      },
    ],
  },
  {
    id: 'make-a-ten',
    title: 'Make a Ten',
    subtitle: 'Fill the frame!',
    icon: '🔟',
    steps: [
      {
        heading: 'This is a ten-frame.',
        body: 'Ten boxes. Two rows of five.',
        illustration: 'frame-empty',
      },
      {
        heading: 'Fill it up.',
        body: '7 dots. How many boxes are empty?',
        illustration: 'frame-partial',
      },
      {
        heading: '7 + 3 = 10!',
        body: 'A full frame is always ten.',
        illustration: 'frame-full',
      },
    ],
  },
  {
    id: 'number-sentences',
    title: 'Number Sentences',
    subtitle: 'Build the math!',
    icon: '➕',
    steps: [
      {
        heading: 'Math has sentences too.',
        body: "Plus means add. Equals means 'is the same as'.",
        illustration: 'sentence-full',
      },
      {
        heading: 'Sometimes a part is hiding.',
        body: 'What number is hiding here?',
        illustration: 'sentence-blank',
      },
      {
        heading: 'Drag a tile to fill it in.',
        body: 'Try one? Tap or drag — both work!',
        illustration: 'sentence-drag',
      },
    ],
  },
];

export const LESSON_ORDER: LessonId[] = LESSONS.map((lesson) => lesson.id);

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function isLessonId(id: string): id is LessonId {
  return LESSON_ORDER.includes(id as LessonId);
}

export function nextLessonId(id: LessonId): LessonId | undefined {
  const index = LESSON_ORDER.indexOf(id);
  if (index < 0 || index >= LESSON_ORDER.length - 1) {
    return undefined;
  }
  return LESSON_ORDER[index + 1];
}

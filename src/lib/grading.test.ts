import { describe, expect, it } from 'vitest';
import type {
  CountObjectsExercise,
  NumberSentenceDropExercise,
  TenFrameBuildExercise,
} from '../types';
import { checkAnswer, messageForStars, starsFor } from './grading';

const countExercise: CountObjectsExercise = {
  id: 'l1-q1',
  kind: 'count-objects',
  prompt: 'How many frogs altogether?',
  hint: 'Count them.',
  groups: [3, 2],
  icon: 'frog',
  choices: [4, 5, 6],
  answer: 5,
};

const tenFrameExercise: TenFrameBuildExercise = {
  id: 'l2-q1',
  kind: 'ten-frame-build',
  prompt: 'Add 3 more!',
  hint: 'Fill the empty boxes.',
  addends: [7, 3],
  answer: 10,
};

const missingSum: NumberSentenceDropExercise = {
  id: 'l3-q1',
  kind: 'number-sentence-drop',
  prompt: 'Fill the blank.',
  hint: 'Count on.',
  template: [5, 4, null],
  tiles: [8, 9, 10],
};

const missingAddend: NumberSentenceDropExercise = {
  id: 'l3-q2',
  kind: 'number-sentence-drop',
  prompt: 'Fill the blank.',
  hint: 'How many more?',
  template: [7, null, 10],
  tiles: [2, 3, 4],
};

const missingFirst: NumberSentenceDropExercise = {
  id: 'l3-q4',
  kind: 'number-sentence-drop',
  prompt: 'Fill the blank.',
  hint: 'Count back.',
  template: [null, 5, 13],
  tiles: [7, 8, 9],
};

function resultsWithFirstTry(count: number) {
  return Array.from({ length: 5 }, (_, index) => ({
    id: `q${index}`,
    attempts: index < count ? 1 : 2,
  }));
}

describe('starsFor', () => {
  it('gives 3 stars for 5 first-try answers', () => {
    expect(starsFor(resultsWithFirstTry(5))).toBe(3);
  });

  it('gives 2 stars for 4 first-try answers', () => {
    expect(starsFor(resultsWithFirstTry(4))).toBe(2);
  });

  it('gives 1 star for 3 first-try answers', () => {
    expect(starsFor(resultsWithFirstTry(3))).toBe(1);
  });

  it('gives 1 star for 1 first-try answer', () => {
    expect(starsFor(resultsWithFirstTry(1))).toBe(1);
  });
});

describe('messageForStars', () => {
  it('uses the 3-star message', () => {
    expect(messageForStars(3)).toBe("Perfect! You're an adding superstar!");
  });

  it('uses the 2-star message', () => {
    expect(messageForStars(2)).toBe('So close to perfect — awesome job!');
  });

  it('uses the stronger 1-star message for 2–3 first tries', () => {
    expect(messageForStars(1, 3)).toBe("Nice work! You're getting stronger.");
  });

  it('uses the finish message for 0–1 first tries', () => {
    expect(messageForStars(1, 1)).toBe('You finished! Every try makes you better.');
  });
});

describe('checkAnswer', () => {
  it('checks count-objects totals', () => {
    expect(checkAnswer(countExercise, 5)).toBe(true);
    expect(checkAnswer(countExercise, 4)).toBe(false);
  });

  it('checks ten-frame filled counts', () => {
    expect(checkAnswer(tenFrameExercise, 10)).toBe(true);
    expect(checkAnswer(tenFrameExercise, 9)).toBe(false);
  });

  it('checks a missing sum', () => {
    expect(checkAnswer(missingSum, 9)).toBe(true);
    expect(checkAnswer(missingSum, 8)).toBe(false);
  });

  it('checks a missing second addend', () => {
    expect(checkAnswer(missingAddend, 3)).toBe(true);
    expect(checkAnswer(missingAddend, 2)).toBe(false);
  });

  it('checks a missing first addend', () => {
    expect(checkAnswer(missingFirst, 8)).toBe(true);
    expect(checkAnswer(missingFirst, 7)).toBe(false);
  });
});

import type { Attempt, Exercise, StarCount } from '../types';

export function expectedValue(exercise: Exercise): number {
  switch (exercise.kind) {
    case 'count-objects':
    case 'ten-frame-build':
      return exercise.answer;
    case 'number-sentence-drop': {
      const [a, b, sum] = exercise.template;
      if (a === null && b !== null && sum !== null) {
        return sum - b;
      }
      if (b === null && a !== null && sum !== null) {
        return sum - a;
      }
      if (sum === null && a !== null && b !== null) {
        return a + b;
      }
      return 0;
    }
    default: {
      const _never: never = exercise;
      return _never;
    }
  }
}

export function checkAnswer(exercise: Exercise, submitted: number): boolean {
  return submitted === expectedValue(exercise);
}

export function starsFor(results: Attempt[]): StarCount {
  const firstTry = results.filter((result) => result.attempts === 1).length;
  if (firstTry >= 5) {
    return 3;
  }
  if (firstTry >= 4) {
    return 2;
  }
  return 1;
}

export function firstTryCount(results: Attempt[]): number {
  return results.filter((result) => result.attempts === 1).length;
}

export function messageForStars(stars: StarCount, firstTryCorrect = 2): string {
  if (stars >= 3) {
    return "Perfect! You're an adding superstar!";
  }
  if (stars === 2) {
    return 'So close to perfect — awesome job!';
  }
  if (firstTryCorrect <= 1) {
    return 'You finished! Every try makes you better.';
  }
  return "Nice work! You're getting stronger.";
}

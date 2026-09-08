import { describe, expect, it } from 'vitest';
import { pickN, shuffle } from './shuffle';

describe('shuffle', () => {
  it('does not mutate the input array', () => {
    const input = [1, 2, 3, 4, 5];
    const snapshot = [...input];
    shuffle(input);
    expect(input).toEqual(snapshot);
  });

  it('returns a new array with the same items', () => {
    const input = ['a', 'b', 'c', 'd'];
    const result = shuffle(input);
    expect(result).not.toBe(input);
    expect([...result].sort()).toEqual([...input].sort());
  });
});

describe('pickN', () => {
  it('returns n items without mutating the source', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const snapshot = [...input];
    const picked = pickN(input, 5);
    expect(picked).toHaveLength(5);
    expect(input).toEqual(snapshot);
    picked.forEach((item) => {
      expect(input).toContain(item);
    });
  });
});

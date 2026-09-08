import { describe, expect, it } from 'vitest';
import { canPlaceOnCell, isFrame1Filled } from './tenFrameDnD';

describe('isFrame1Filled', () => {
  it('is false when a 7+5 frame still has empty boxes', () => {
    expect(isFrame1Filled(7, [])).toBe(false);
    expect(isFrame1Filled(7, [7, 8])).toBe(false);
  });

  it('is true once the first ten boxes are filled', () => {
    expect(isFrame1Filled(7, [7, 8, 9])).toBe(true);
    expect(isFrame1Filled(8, [8, 9])).toBe(true);
  });
});

describe('canPlaceOnCell', () => {
  it('blocks frame 2 until frame 1 is full', () => {
    expect(canPlaceOnCell(10, 7, [])).toBe(false);
    expect(canPlaceOnCell(12, 8, [8])).toBe(false);
  });

  it('allows frame 2 after frame 1 is full', () => {
    expect(canPlaceOnCell(10, 7, [7, 8, 9])).toBe(true);
    expect(canPlaceOnCell(11, 8, [8, 9])).toBe(true);
  });

  it('still allows empty boxes in frame 1', () => {
    expect(canPlaceOnCell(7, 7, [])).toBe(true);
    expect(canPlaceOnCell(9, 8, [8])).toBe(true);
  });
});

import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core';
import type { CellState } from '../../../../components/TenFrame/TenFrame';

export const preferPointerCell: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) {
    return pointerHits;
  }
  const intersections = rectIntersection(args);
  if (intersections.length > 0) {
    return intersections;
  }
  return closestCenter(args);
};

export function isFrame1Filled(prefilled: number, placed: number[]): boolean {
  return prefilled + placed.filter((cell) => cell < 10).length >= 10;
}

export function canPlaceOnCell(cell: number, prefilled: number, placed: number[]): boolean {
  if (placed.includes(cell) || cell < prefilled) {
    return false;
  }
  if (cell >= 10 && !isFrame1Filled(prefilled, placed)) {
    return false;
  }
  return true;
}

export function cellsFor(frame: 0 | 1, prefilled: number, placed: number[]): CellState[] {
  return Array.from({ length: 10 }, (_, index) => {
    const cell = frame * 10 + index;
    if (cell < prefilled) {
      return 'prefilled';
    }
    if (placed.includes(cell)) {
      return 'placed';
    }
    return 'empty';
  });
}

export function parseCellId(id: string, exerciseId: string): number | null {
  const match = new RegExp(`^${exerciseId}-(\\d+)-cell-(\\d+)$`).exec(id);
  if (!match) {
    return null;
  }
  const frame = Number(match[1]);
  const cell = Number(match[2]);
  return frame * 10 + cell;
}

export const tenFrameAnnouncements = {
  onDragStart() {
    return 'Dot picked up';
  },
  onDragOver({ over }: { over: { id: string | number } | null }) {
    return over ? 'over a box' : 'off the frame';
  },
  onDragEnd({ over }: { over: { id: string | number } | null }) {
    return over ? 'dropped in a box' : 'returned to the tray';
  },
  onDragCancel() {
    return 'Move cancelled';
  },
};

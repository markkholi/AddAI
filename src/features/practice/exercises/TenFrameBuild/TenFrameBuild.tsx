import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BigButton } from '../../../../components/BigButton/BigButton';
import { TenFrame, type CellState } from '../../../../components/TenFrame/TenFrame';
import { checkAnswer } from '../../../../lib/grading';
import type { ExerciseProps, TenFrameBuildExercise } from '../../../../types';
import { TrayDot } from './TrayDot';
import styles from './TenFrameBuild.module.css';

export function TenFrameBuild({
  exercise,
  onAnswer,
  locked,
}: ExerciseProps<TenFrameBuildExercise>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );
  const [prefilled] = exercise.addends;
  const traySize = exercise.addends[1];
  const [placed, setPlaced] = useState<number[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [solved, setSolved] = useState(false);
  const submitted = useRef(false);
  const trayIds = useMemo(
    () => Array.from({ length: traySize }, (_, index) => `tray-${exercise.id}-${index}`),
    [exercise.id, traySize],
  );
  const usedDots = placed.length;
  const showSecond = exercise.answer > 10;
  const filledCount = prefilled + placed.length;

  useEffect(() => {
    if (locked || submitted.current) {
      return;
    }
    if (checkAnswer(exercise, filledCount)) {
      submitted.current = true;
      setSolved(true);
      onAnswer(true);
    }
  }, [exercise, filledCount, locked, onAnswer]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => setDragging(true)}
      onDragCancel={() => setDragging(false)}
      onDragEnd={handleDragEnd}
      accessibility={{ announcements: dragAnnouncements }}
    >
      <div className={styles.wrap}>
        <div className={styles.frames}>
          <TenFrame
            frameId={`${exercise.id}-0`}
            cells={cellsFor(0, prefilled, placed)}
            highlight={solved ? 'success' : 'none'}
            interactive={!locked}
            onEmptyCellClick={(index) => placeAt(index)}
            onPlacedCellClick={(index) => removeAt(index)}
          />
          {showSecond ? (
            <TenFrame
              frameId={`${exercise.id}-1`}
              cells={cellsFor(1, prefilled, placed)}
              highlight={solved ? 'success' : 'none'}
              interactive={!locked}
              onEmptyCellClick={(index) => placeAt(10 + index)}
              onPlacedCellClick={(index) => removeAt(10 + index)}
            />
          ) : null}
        </div>
        <div className={styles.tray} role="group" aria-label="Dots to add">
          {trayIds.map((id, index) => (
            <TrayDot
              key={id}
              id={id}
              selected={selected === id}
              hidden={index < usedDots}
              disabled={locked}
              onSelect={() => {
                if (!locked) {
                  setSelected((current) => (current === id ? null : id));
                }
              }}
            />
          ))}
        </div>
        <BigButton variant="secondary" disabled={locked} onClick={handleDone}>
          I'm done
        </BigButton>
      </div>
      <DragOverlay>{dragging ? <div className={`${styles.dot} ${styles.overlay}`} /> : null}</DragOverlay>
    </DndContext>
  );

  function placeAt(cell: number, fromDrag = false) {
    if (locked || placed.includes(cell) || cell < prefilled) {
      return;
    }
    if (placed.length >= traySize) {
      return;
    }
    if (!fromDrag && selected === null) {
      return;
    }
    setPlaced((current) => [...current, cell]);
    setSelected(null);
  }

  function removeAt(cell: number) {
    if (locked || cell < prefilled) {
      return;
    }
    setPlaced((current) => current.filter((value) => value !== cell));
    setSelected(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false);
    const overId = event.over?.id;
    if (typeof overId !== 'string' || locked) {
      return;
    }
    const parsed = parseCellId(overId, exercise.id);
    if (parsed === null) {
      return;
    }
    placeAt(parsed, true);
  }

  function handleDone() {
    if (submitted.current) {
      return;
    }
    const correct = checkAnswer(exercise, filledCount);
    if (correct) {
      submitted.current = true;
      setSolved(true);
      onAnswer(true);
      return;
    }
    onAnswer(false);
    setPlaced([]);
    setSelected(null);
  }
}

function cellsFor(frame: 0 | 1, prefilled: number, placed: number[]): CellState[] {
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

function parseCellId(id: string, exerciseId: string): number | null {
  const match = new RegExp(`^${exerciseId}-(\\d+)-cell-(\\d+)$`).exec(id);
  if (!match) {
    return null;
  }
  const frame = Number(match[1]);
  const cell = Number(match[2]);
  return frame * 10 + cell;
}

const dragAnnouncements = {
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

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { BigButton } from '../../../../components/BigButton/BigButton';
import { checkAnswer } from '../../../../lib/grading';
import type { ExerciseProps, NumberSentenceDropExercise } from '../../../../types';
import { NumberTile } from './NumberTile';
import { SentenceSlot } from './SentenceSlot';
import styles from './NumberSentenceDrop.module.css';

export function NumberSentenceDrop({
  exercise,
  onAnswer,
  locked,
}: ExerciseProps<NumberSentenceDropExercise>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );
  const [placed, setPlaced] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [activeValue, setActiveValue] = useState<number | null>(null);
  const [warn, setWarn] = useState(false);
  const tiles = useMemo(() => exercise.tiles.map((value, index) => ({ id: `tile-${index}`, value })), [exercise.tiles]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveValue(null)}
      accessibility={{ announcements: dragAnnouncements }}
    >
      <div className={styles.wrap}>
        <div className={styles.sentence} aria-label="Number sentence">
          {renderPart(0)}
          <span className={styles.op} aria-hidden="true">
            +
          </span>
          {renderPart(1)}
          <span className={styles.op} aria-hidden="true">
            =
          </span>
          {renderPart(2)}
        </div>
        <div className={styles.tray} role="group" aria-label="Number tiles">
          {tiles.map((tile) => (
            <NumberTile
              key={tile.id}
              id={tile.id}
              value={tile.value}
              selected={selected === tile.value}
              hidden={placed === tile.value || activeValue === tile.value}
              disabled={locked || placed === tile.value}
              onSelect={() => {
                if (locked) {
                  return;
                }
                setSelected((current) => (current === tile.value ? null : tile.value));
              }}
            />
          ))}
        </div>
        <BigButton disabled={locked || placed === null} onClick={check}>
          Check it!
        </BigButton>
      </div>
      <DragOverlay>
        {activeValue !== null ? <div className={`${styles.tile} ${styles.overlay}`}>{activeValue}</div> : null}
      </DragOverlay>
    </DndContext>
  );

  function renderPart(index: 0 | 1 | 2) {
    const value = exercise.template[index];
    if (value === null) {
      return (
        <SentenceSlot
          value={placed}
          warn={warn}
          disabled={locked}
          onActivate={handleSlotTap}
        />
      );
    }
    return (
      <span className={styles.fixed} aria-label={String(value)}>
        {value}
      </span>
    );
  }

  function handleSlotTap() {
    if (locked) {
      return;
    }
    if (placed !== null) {
      setPlaced(null);
      setSelected(null);
      setWarn(false);
      return;
    }
    if (selected !== null) {
      setPlaced(selected);
      setSelected(null);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const value = event.active.data.current?.value;
    if (typeof value === 'number') {
      setActiveValue(value);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const value = event.active.data.current?.value;
    setActiveValue(null);
    if (event.over?.id !== 'sentence-slot' || typeof value !== 'number' || locked) {
      return;
    }
    setPlaced(value);
    setSelected(null);
    setWarn(false);
  }

  function check() {
    if (placed === null) {
      return;
    }
    const correct = checkAnswer(exercise, placed);
    if (!correct) {
      setWarn(true);
      setPlaced(null);
      setSelected(null);
    }
    onAnswer(correct);
  }
}

const dragAnnouncements = {
  onDragStart({ active }: { active: { data: { current?: { label?: string } } } }) {
    return `Tile ${active.data.current?.label ?? ''} picked up`;
  },
  onDragOver({ over }: { over: { id: string | number } | null }) {
    return over ? 'over the answer box' : 'off the answer box';
  },
  onDragEnd({ over }: { over: { id: string | number } | null }) {
    return over ? 'dropped in the answer box' : 'returned to the tray';
  },
  onDragCancel() {
    return 'Move cancelled';
  },
};

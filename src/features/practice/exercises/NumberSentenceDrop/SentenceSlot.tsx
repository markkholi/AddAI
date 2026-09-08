import { useDroppable } from '@dnd-kit/core';
import styles from './NumberSentenceDrop.module.css';

interface SentenceSlotProps {
  value: number | null;
  warn: boolean;
  disabled: boolean;
  onActivate: () => void;
}

export function SentenceSlot({ value, warn, disabled, onActivate }: SentenceSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'sentence-slot',
    data: { type: 'slot' },
    disabled,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`${styles.slot} ${value !== null ? styles.filled : ''} ${isOver ? styles.over : ''} ${warn ? styles.warn : ''}`}
      onClick={onActivate}
      disabled={disabled}
      aria-label={value === null ? 'Answer box, empty' : `Answer box, ${value}. Tap to put it back`}
    >
      {value ?? ''}
    </button>
  );
}

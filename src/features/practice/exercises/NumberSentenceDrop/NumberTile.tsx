import { useDraggable } from '@dnd-kit/core';
import styles from './NumberSentenceDrop.module.css';

interface NumberTileProps {
  id: string;
  value: number;
  selected: boolean;
  hidden: boolean;
  disabled: boolean;
  onSelect: () => void;
}

export function NumberTile({ id, value, selected, hidden, disabled, onSelect }: NumberTileProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type: 'tile', value, label: String(value) },
    disabled,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`${styles.tile} ${selected ? styles.selected : ''} ${isDragging || hidden ? styles.hidden : ''}`}
      onClick={onSelect}
      disabled={disabled}
      {...listeners}
      {...attributes}
      aria-label={`Tile ${value}`}
      aria-pressed={selected}
    >
      {value}
    </button>
  );
}

import { useDraggable } from '@dnd-kit/core';
import styles from './TenFrameBuild.module.css';

interface TrayDotProps {
  id: string;
  selected: boolean;
  hidden: boolean;
  disabled: boolean;
  onSelect: () => void;
}

export function TrayDot({ id, selected, hidden, disabled, onSelect }: TrayDotProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type: 'dot', id, label: 'dot' },
    disabled,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`${styles.dot} ${selected ? styles.selected : ''} ${isDragging || hidden ? styles.hidden : ''}`}
      onClick={onSelect}
      disabled={disabled}
      {...listeners}
      {...attributes}
      aria-label="Loose dot"
      aria-pressed={selected}
    />
  );
}

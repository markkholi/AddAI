import { useDroppable } from '@dnd-kit/core';
import styles from './TenFrame.module.css';

export type CellState = 'prefilled' | 'placed' | 'empty';

interface TenFrameProps {
  cells: CellState[];
  frameId: string;
  glowEmpty?: boolean;
  highlight?: 'success' | 'none';
  interactive?: boolean;
  acceptEmpty?: boolean;
  dimmed?: boolean;
  label?: string;
  onEmptyCellClick?: (index: number) => void;
  onPlacedCellClick?: (index: number) => void;
}

export function TenFrame({
  cells,
  frameId,
  glowEmpty = false,
  highlight = 'none',
  interactive = false,
  acceptEmpty = true,
  dimmed = false,
  label = 'Ten frame',
  onEmptyCellClick,
  onPlacedCellClick,
}: TenFrameProps) {
  return (
    <div
      className={`${styles.frame} ${highlight === 'success' ? styles.success : ''} ${dimmed ? styles.dimmed : ''}`}
      role="group"
      aria-label={label}
    >
      {cells.map((state, index) => {
        const glow = glowEmpty && state === 'empty';
        const className = cellClass(state, glow, false);
        if (!interactive) {
          return <span key={`${frameId}-${index}`} className={className} />;
        }
        if (state === 'empty' && !acceptEmpty) {
          return <span key={`${frameId}-${index}`} className={className} />;
        }
        if (state === 'empty') {
          return (
            <DroppableCell
              key={`${frameId}-${index}`}
              frameId={frameId}
              index={index}
              className={cellClass(state, glow, false)}
              onClick={() => onEmptyCellClick?.(index)}
            />
          );
        }
        if (state === 'placed') {
          return (
            <button
              key={`${frameId}-${index}`}
              type="button"
              className={className}
              onClick={() => onPlacedCellClick?.(index)}
              aria-label={`Dot in box ${index + 1}, tap to put it back`}
            />
          );
        }
        return <span key={`${frameId}-${index}`} className={className} />;
      })}
    </div>
  );
}

function cellClass(state: CellState, glow: boolean, isOver: boolean): string {
  return [
    styles.cell,
    state !== 'empty' ? styles.filled : '',
    state === 'placed' ? styles.placed : '',
    glow ? styles.glow : '',
    isOver ? styles.over : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function DroppableCell({
  frameId,
  index,
  className,
  onClick,
}: {
  frameId: string;
  index: number;
  className: string;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${frameId}-cell-${index}`,
    data: { type: 'cell', frameId, index },
  });
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`${className} ${isOver ? styles.over : ''}`}
      onClick={onClick}
      aria-label={`Empty box ${index + 1}`}
    />
  );
}

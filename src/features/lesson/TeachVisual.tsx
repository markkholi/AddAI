import { CountableObject } from '../../components/CountableObject/CountableObject';
import { TenFrame } from '../../components/TenFrame/TenFrame';
import type { CellState } from '../../components/TenFrame/TenFrame';
import type { TeachIllustration } from '../../types';
import styles from './TeachVisual.module.css';

export function TeachVisual({ kind }: { kind: TeachIllustration }) {
  if (kind === 'frogs-groups') {
    return (
      <div className={styles.row} aria-hidden="true">
        <Cluster count={3} />
        <span className={styles.plus}>+</span>
        <Cluster count={2} />
      </div>
    );
  }
  if (kind === 'frogs-count') {
    return (
      <div className={styles.row} aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <CountableObject key={n} icon="frog" number={n} />
        ))}
      </div>
    );
  }
  if (kind === 'frogs-sentence') {
    return (
      <div className={styles.stack} aria-hidden="true">
        <div className={styles.row}>
          <Cluster count={3} />
          <Cluster count={2} />
        </div>
        <div className={styles.tiles}>
          <span>3</span>
          <span>+</span>
          <span>2</span>
          <span>=</span>
          <span>5</span>
        </div>
      </div>
    );
  }
  if (kind === 'frame-empty') {
    return <TenFrame frameId="teach-empty" cells={filled(0)} />;
  }
  if (kind === 'frame-partial') {
    return <TenFrame frameId="teach-partial" cells={filled(7)} glowEmpty />;
  }
  if (kind === 'frame-full') {
    return (
      <div className={styles.stack} aria-hidden="true">
        <TenFrame frameId="teach-full" cells={filled(10)} highlight="success" />
        <div className={styles.tiles}>
          <span>7</span>
          <span>+</span>
          <span>3</span>
          <span>=</span>
          <span>10</span>
        </div>
      </div>
    );
  }
  if (kind === 'sentence-full') {
    return (
      <div className={styles.tiles} aria-hidden="true">
        <LabeledTile value="4" label="four" />
        <span>+</span>
        <LabeledTile value="3" label="plus" />
        <span>=</span>
        <LabeledTile value="7" label="equals seven" />
      </div>
    );
  }
  if (kind === 'sentence-blank') {
    return (
      <div className={styles.tiles} aria-hidden="true">
        <span>4</span>
        <span>+</span>
        <span className={styles.blank}>?</span>
        <span>=</span>
        <span>7</span>
      </div>
    );
  }
  return (
    <div className={styles.stack} aria-hidden="true">
      <div className={styles.tiles}>
        <span>4</span>
        <span>+</span>
        <span className={styles.blank} />
        <span>=</span>
        <span>7</span>
      </div>
      <div className={styles.dragHint}>
        <span className={styles.hand} aria-hidden="true">
          ✋
        </span>
        <span className={styles.miniTile}>3</span>
      </div>
    </div>
  );
}

function Cluster({ count }: { count: number }) {
  return (
    <div className={styles.cluster}>
      {Array.from({ length: count }, (_, index) => (
        <CountableObject key={index} icon="frog" />
      ))}
    </div>
  );
}

function filled(count: number): CellState[] {
  return Array.from({ length: 10 }, (_, index) => (index < count ? 'prefilled' : 'empty'));
}

function LabeledTile({ value, label }: { value: string; label: string }) {
  return (
    <span className={styles.labeled}>
      {value}
      <small>{label}</small>
    </span>
  );
}

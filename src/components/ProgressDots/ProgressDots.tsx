import styles from './ProgressDots.module.css';

export type DotState = 'pending' | 'first-try' | 'retried';

interface ProgressDotsProps {
  states: DotState[];
}

export function ProgressDots({ states }: ProgressDotsProps) {
  return (
    <ol className={styles.list} aria-label="Question progress">
      {states.map((state, index) => (
        <li key={index} className={`${styles.dot} ${styles[toClass(state)]}`}>
          <span className={styles.sr}>{label(state, index)}</span>
        </li>
      ))}
    </ol>
  );
}

function toClass(state: DotState): string {
  if (state === 'first-try') {
    return 'firstTry';
  }
  return state;
}

function label(state: DotState, index: number): string {
  const n = index + 1;
  if (state === 'first-try') {
    return `Question ${n}, correct first try`;
  }
  if (state === 'retried') {
    return `Question ${n}, correct after trying again`;
  }
  return `Question ${n}, not yet answered`;
}

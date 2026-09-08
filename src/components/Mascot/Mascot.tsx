import styles from './Mascot.module.css';

export type MascotMood = 'idle' | 'think' | 'cheer' | 'oops';

interface MascotProps {
  mood?: MascotMood;
  name?: string;
}

export function Mascot({ mood = 'idle', name = 'Addy' }: MascotProps) {
  return (
    <div className={`${styles.wrap} ${styles[mood]}`} role="img" aria-label={`${name} looks ${moodLabel(mood)}`}>
      <svg viewBox="0 0 120 120" aria-hidden="true" className={styles.svg}>
        <ellipse cx="60" cy="108" rx="28" ry="6" fill="rgba(31,41,51,0.12)" />
        <circle cx="60" cy="68" r="34" fill="#3bb273" />
        <circle cx="38" cy="38" r="16" fill="#3bb273" />
        <circle cx="82" cy="38" r="16" fill="#3bb273" />
        <circle className={styles.eye} cx="38" cy="38" r="6" fill="#1f2933" />
        <circle className={styles.eyeShine} cx="36" cy="36" r="2" fill="#fff" />
        <circle className={styles.eye} cx="82" cy="38" r="6" fill="#1f2933" />
        <circle className={styles.eyeShine} cx="80" cy="36" r="2" fill="#fff" />
        <ellipse className={styles.blush} cx="32" cy="72" rx="7" ry="4" fill="#ffb0c4" />
        <ellipse className={styles.blush} cx="88" cy="72" rx="7" ry="4" fill="#ffb0c4" />
        <path className={styles.mouth} d="M46 78c6 10 22 10 28 0" fill="none" stroke="#1f2933" strokeWidth="3.5" strokeLinecap="round" />
        <path className={styles.browLeft} d="M28 26h16" fill="none" stroke="#1f2933" strokeWidth="3" strokeLinecap="round" />
        <path className={styles.browRight} d="M76 26h16" fill="none" stroke="#1f2933" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function moodLabel(mood: MascotMood): string {
  if (mood === 'cheer') {
    return 'excited';
  }
  if (mood === 'oops') {
    return 'surprised';
  }
  if (mood === 'think') {
    return 'thoughtful';
  }
  return 'happy';
}

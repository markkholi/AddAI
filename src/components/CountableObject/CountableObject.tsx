import type { ObjectIcon } from '../../types';
import styles from './CountableObject.module.css';

interface CountableObjectProps {
  icon: ObjectIcon;
  counted?: boolean;
  number?: number;
  size?: number;
  onToggle?: () => void;
  disabled?: boolean;
}

export function CountableObject({
  icon,
  counted = false,
  number,
  size = 56,
  onToggle,
  disabled = false,
}: CountableObjectProps) {
  const content = (
    <>
      {number !== undefined ? <span className={styles.number}>{number}</span> : null}
      <Icon icon={icon} />
      {counted ? (
        <span className={styles.badge} aria-hidden="true">
          ✓
        </span>
      ) : null}
    </>
  );

  if (onToggle) {
    return (
      <button
        type="button"
        className={`${styles.item} ${counted ? styles.counted : ''}`}
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={counted}
        aria-label={`${icon}${counted ? ', counted' : ''}`}
        style={{ width: size, height: size }}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={styles.item} style={{ width: size, height: size }} aria-hidden="true">
      {content}
    </span>
  );
}

function Icon({ icon }: { icon: ObjectIcon }) {
  if (icon === 'frog') {
    return (
      <svg viewBox="0 0 64 64" className={styles.svg} aria-hidden="true">
        <circle cx="32" cy="38" r="18" fill="#3bb273" />
        <circle cx="22" cy="24" r="8" fill="#3bb273" />
        <circle cx="42" cy="24" r="8" fill="#3bb273" />
        <circle cx="22" cy="24" r="3.2" fill="#1f2933" />
        <circle cx="42" cy="24" r="3.2" fill="#1f2933" />
        <path d="M24 42c3 5 13 5 16 0" fill="none" stroke="#1f2933" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'apple') {
    return (
      <svg viewBox="0 0 64 64" className={styles.svg} aria-hidden="true">
        <path d="M32 18c2 6 8 8 8 8" fill="none" stroke="#3bb273" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 28c-4 14 4 26 12 26s16-12 12-26c-4-4-16-4-24 0z" fill="#e24b4a" />
        <ellipse cx="26" cy="34" rx="3" ry="5" fill="#fff" opacity="0.35" />
      </svg>
    );
  }
  if (icon === 'star') {
    return (
      <svg viewBox="0 0 64 64" className={styles.svg} aria-hidden="true">
        <path
          d="M32 10l6.2 12.6 13.8 2-10 9.6 2.4 13.8L32 41.2 19.6 48l2.4-13.8-10-9.6 13.8-2z"
          fill="#ffb020"
          stroke="#e09a00"
          strokeWidth="2"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className={styles.svg} aria-hidden="true">
      <ellipse cx="34" cy="34" rx="18" ry="10" fill="#2f6fed" />
      <path d="M16 34c6-8 10-8 16 0" fill="#2f6fed" />
      <path d="M48 28c6 0 10 4 8 8" fill="none" stroke="#2f6fed" strokeWidth="4" strokeLinecap="round" />
      <circle cx="42" cy="32" r="2" fill="#fff" />
    </svg>
  );
}

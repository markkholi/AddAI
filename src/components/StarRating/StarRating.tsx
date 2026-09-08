import type { StarCount } from '../../types';
import styles from './StarRating.module.css';

interface StarRatingProps {
  value: StarCount;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function StarRating({ value, size = 'md', animate = false }: StarRatingProps) {
  return (
    <div
      className={`${styles.row} ${styles[size]} ${animate ? styles.animate : ''}`}
      role="img"
      aria-label={`${value} out of 3 stars`}
    >
      {[1, 2, 3].map((star) => (
        <span
          key={star}
          className={`${styles.star} ${star <= value ? styles.filled : styles.empty}`}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
}

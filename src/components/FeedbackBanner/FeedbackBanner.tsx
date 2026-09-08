import styles from './FeedbackBanner.module.css';

export type FeedbackVariant = 'success' | 'warn' | 'idle';

interface FeedbackBannerProps {
  variant: FeedbackVariant;
  message: string;
}

export function FeedbackBanner({ variant, message }: FeedbackBannerProps) {
  return (
    <div className={`${styles.banner} ${styles[variant]}`} aria-live="polite" aria-atomic="true">
      {message ? (
        <p>
          <span aria-hidden="true" className={styles.icon}>
            {variant === 'success' ? '✓' : variant === 'warn' ? '★' : ''}
          </span>
          {message}
        </p>
      ) : null}
    </div>
  );
}

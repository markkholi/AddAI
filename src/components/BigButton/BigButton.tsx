import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './BigButton.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function BigButton({
  variant = 'primary',
  children,
  className,
  type = 'button',
  ...props
}: BigButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

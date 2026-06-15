import type { JSX, ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'muted';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-panel border-border text-text-secondary',
  accent: 'bg-accent-muted border-accent/25 text-accent',
  success: 'bg-success-muted/30 border-success/25 text-success',
  warning: 'bg-warning-muted/30 border-warning/25 text-warning',
  danger: 'bg-danger-muted/30 border-danger/25 text-danger',
  muted: 'bg-border-subtle border-border text-text-muted',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps): JSX.Element {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
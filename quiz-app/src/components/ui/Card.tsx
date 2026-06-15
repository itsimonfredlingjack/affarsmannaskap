import type { JSX, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className = '', padding = 'md', elevated = false }: CardProps): JSX.Element {
  return (
    <div
      className={[
        'rounded-[var(--radius-card)] bg-panel border border-border',
        elevated ? 'shadow-elevated' : 'shadow-card',
        paddingMap[padding],
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
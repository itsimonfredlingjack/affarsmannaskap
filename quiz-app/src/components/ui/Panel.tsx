import type { JSX, ReactNode } from 'react';

type PanelTone = 'default' | 'accent' | 'success' | 'warning' | 'danger';

interface PanelProps {
  children: ReactNode;
  title?: string;
  tone?: PanelTone;
  className?: string;
  accentBar?: boolean;
}

const toneClasses: Record<PanelTone, string> = {
  default: 'bg-panel border-border text-text-primary',
  accent: 'bg-accent-subtle border-accent/20 text-text-primary',
  success: 'bg-success-muted/20 border-success/25 text-text-primary',
  warning: 'bg-warning-muted/20 border-warning/25 text-text-primary',
  danger: 'bg-danger-muted/20 border-danger/25 text-text-primary',
};

const titleToneClasses: Record<PanelTone, string> = {
  default: 'text-text-muted',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export function Panel({
  children,
  title,
  tone = 'default',
  className = '',
  accentBar = false,
}: PanelProps): JSX.Element {
  return (
    <div
      className={[
        'relative p-4 sm:p-5 rounded-xl border',
        toneClasses[tone],
        accentBar ? 'pl-5 sm:pl-6' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {accentBar && (
        <div
          className={[
            'absolute left-0 top-4 bottom-4 w-1 rounded-full',
            tone === 'success' ? 'bg-success' : tone === 'warning' ? 'bg-warning' : tone === 'danger' ? 'bg-danger' : 'bg-accent',
          ].join(' ')}
        />
      )}
      {title && (
        <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${titleToneClasses[tone]}`}>
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
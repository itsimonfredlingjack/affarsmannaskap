import type { JSX } from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  progressPercent: number;
}

export function ProgressBar({ current, total, progressPercent }: ProgressBarProps): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted">
          Session · Fråga {current} av {total}
        </span>
        <span className="text-xs font-semibold text-accent">
          {progressPercent}%
        </span>
      </div>
      <div className="h-1 w-full bg-border-subtle rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
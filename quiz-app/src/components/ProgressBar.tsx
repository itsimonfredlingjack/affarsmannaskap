import type { JSX } from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  progressPercent: number;
}

export function ProgressBar({ current, total, progressPercent }: ProgressBarProps): JSX.Element {
  return (
    <div className="max-w-2xl mx-auto w-full px-4 mb-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-500 dark:text-zinc-500">
          Fråga {current} av {total}
        </span>
        <span className="text-xs font-semibold text-blue-500">
          {progressPercent}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

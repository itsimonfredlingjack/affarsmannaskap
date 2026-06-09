import type { JSX } from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  progressPercent: number;
}

export function ProgressBar({ current, total, progressPercent }: ProgressBarProps): JSX.Element {
  return (
    <div className="w-full flex flex-col space-y-1.5 mb-6 font-mono text-[11px] tracking-tight">
      <div className="flex items-center justify-between text-slate-500 dark:text-zinc-500 uppercase">
        <span className="flex items-center">
          SESSION :: <span className="text-blue-600 dark:text-blue-400 font-bold ml-1">{progressPercent}%</span>
        </span>
        <span className="font-bold text-slate-700 dark:text-zinc-300">
          [{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}]
        </span>
      </div>
      
      {/* Progress Track */}
      <div className="w-full h-2 bg-slate-200 dark:bg-zinc-900 border border-slate-350 dark:border-zinc-800 rounded-none overflow-hidden">
        {/* Active solid bar */}
        <div 
          className="h-full bg-blue-500 dark:bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

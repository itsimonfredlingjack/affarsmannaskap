import { useState, type JSX } from 'react';

interface HeroLandingProps {
  dueCount: number;
  totalCount: number;
  onStartSession: (size: number | 'all') => void;
}

export function HeroLanding({ dueCount, totalCount, onStartSession }: HeroLandingProps): JSX.Element {
  const [sessionSize, setSessionSize] = useState<number | 'all'>(10);

  return (
    <div className="max-w-sm mx-auto w-full my-auto px-4 py-12 flex flex-col justify-center">

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Dags att studera 📚
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-500 leading-relaxed">
          Träna korta essäsvar med modeller, ekonomi och affärsbeslut.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{totalCount}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">Totala frågor</p>
        </div>
        <div className={`p-4 rounded-xl border text-center ${
          dueCount > 0
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
            : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
        }`}>
          <p className={`text-2xl font-bold ${dueCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {dueCount}
          </p>
          <p className={`text-xs mt-0.5 ${dueCount > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
            {dueCount > 0 ? 'Att repetera idag' : 'Allt repeterat! ✓'}
          </p>
        </div>
      </div>

      {/* Session size picker */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-3 text-center">
          Hur många frågor?
        </p>

        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {([5, 10, 'all'] as const).map((size) => {
            const isSelected = sessionSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSessionSize(size)}
                className={`py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-400 dark:hover:border-zinc-500'
                }`}
              >
                {size === 'all' ? 'Alla' : size}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onStartSession(sessionSize)}
          className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          Börja studera →
        </button>
      </div>
    </div>
  );
}

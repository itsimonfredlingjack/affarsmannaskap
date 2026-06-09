import { useState, type JSX } from 'react';

interface HeroLandingProps {
  dueCount: number;
  totalCount: number;
  onStartSession: (size: number | 'all') => void;
}

export function HeroLanding({ dueCount, totalCount, onStartSession }: HeroLandingProps): JSX.Element {
  const [sessionSize, setSessionSize] = useState<number | 'all'>(20);

  return (
    <div className="max-w-md mx-auto w-full my-auto px-4 py-8 flex flex-col justify-center font-mono">
      
      {/* Terminal Title */}
      <div className="text-center mb-6">
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          AFFÄRSMANNASKAP :: QUIZ_SYSTEM_v2.0
        </h1>
        <p className="text-[11px] text-slate-550 dark:text-zinc-500 leading-relaxed max-w-sm mx-auto font-sans">
          Träning och självvärdering på ekonomiska modeller, case och begrepp baserat på Spaced Repetition (SM-2).
        </p>
      </div>

      {/* Due Info Box */}
      <div className="mb-4 p-4 rounded-none bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs">
        <span className="block text-[9px] font-bold text-slate-400 dark:text-zinc-550 uppercase mb-2">
          :: STATUS_KOLL
        </span>
        <div className="space-y-1.5 font-mono text-[11px] text-slate-700 dark:text-zinc-350">
          <div className="flex justify-between">
            <span>TOTALA FRÅGOR I SYSTEMET:</span>
            <span className="font-bold">{totalCount}</span>
          </div>
          <div className="flex justify-between">
            <span>DESSA BÖR REPETERAS IDAG:</span>
            <span className={`font-bold ${dueCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-500'}`}>
              {dueCount}
            </span>
          </div>
        </div>
      </div>

      {/* Selection Control Panel */}
      <div className="p-5 rounded-none bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
        <h2 className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550 mb-3 text-center">
          VÄLJ STORLEK PÅ STUDIESESSION
        </h2>
        
        {/* Buttons Group */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[10, 20, 'all'].map((size) => {
            const isSelected = sessionSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSessionSize(size as any)}
                className={`py-2 rounded-none border text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 text-slate-550 dark:text-zinc-400 hover:border-slate-400 dark:hover:border-zinc-700 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                {size === 'all' ? 'ALLA' : size}
              </button>
            );
          })}
        </div>

        {/* Start Button */}
        <button
          type="button"
          onClick={() => onStartSession(sessionSize)}
          className="w-full py-3 rounded-none bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase cursor-pointer"
        >
          [ BÖRJA STUDERA ]
        </button>
        
        <p className="text-[9px] text-slate-400 dark:text-zinc-600 text-center mt-3 uppercase">
          Inlärningskort laddas och sorteras enligt SM-2.
        </p>
      </div>
    </div>
  );
}

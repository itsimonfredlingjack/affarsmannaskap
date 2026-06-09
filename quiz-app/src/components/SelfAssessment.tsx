import type { JSX } from 'react';

interface SelfAssessmentProps {
  onRateAnswer: (rating: 'known' | 'almost' | 'again') => void;
  suggestedRating: 'known' | 'almost' | 'again' | '';
}

export function SelfAssessment({
  onRateAnswer,
  suggestedRating,
}: SelfAssessmentProps): JSX.Element {
  return (
    <div className="text-left font-sans">
      <span className="block text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5 font-mono">
        Betygsätt ditt svar för att gå vidare:
      </span>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Again / Igen Button */}
        <button
          type="button"
          onClick={() => onRateAnswer('again')}
          className={`flex flex-col items-start p-3 rounded-none border text-left cursor-pointer transition-all ${
            suggestedRating === 'again'
              ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 font-semibold ring-1 ring-rose-500'
              : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-350 hover:border-rose-400 hover:bg-rose-500/5 hover:text-rose-600 dark:hover:text-rose-450'
          }`}
        >
          <span className="text-sm font-semibold mb-0.5 flex items-center justify-between w-full">
            <span>[3] Igen</span>
            {suggestedRating === 'again' && (
              <span className="text-[9px] px-1.5 py-0.2 bg-rose-500/20 border border-rose-500/30 text-rose-700 dark:text-rose-400 uppercase font-mono font-bold tracking-wider">
                Rekom.
              </span>
            )}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-550">Repetera inom kort</span>
        </button>

        {/* Almost / Nästan Button */}
        <button
          type="button"
          onClick={() => onRateAnswer('almost')}
          className={`flex flex-col items-start p-3 rounded-none border text-left cursor-pointer transition-all ${
            suggestedRating === 'almost'
              ? 'bg-amber-500/10 border-amber-500 text-amber-800 dark:text-amber-400 font-semibold ring-1 ring-amber-500'
              : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-350 hover:border-amber-400 hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-450'
          }`}
        >
          <span className="text-sm font-semibold mb-0.5 flex items-center justify-between w-full">
            <span>[2] Nästan</span>
            {suggestedRating === 'almost' && (
              <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-400 uppercase font-mono font-bold tracking-wider">
                Rekom.
              </span>
            )}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-550">Missade nyckeldelar</span>
        </button>

        {/* Known / Kan Button */}
        <button
          type="button"
          onClick={() => onRateAnswer('known')}
          className={`flex flex-col items-start p-3 rounded-none border text-left cursor-pointer transition-all ${
            suggestedRating === 'known'
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-semibold ring-1 ring-emerald-500'
              : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-350 hover:border-emerald-400 hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-450'
          }`}
        >
          <span className="text-sm font-semibold mb-0.5 flex items-center justify-between w-full">
            <span>[1] Kan</span>
            {suggestedRating === 'known' && (
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-800 dark:text-emerald-400 uppercase font-mono font-bold tracking-wider">
                Rekom.
              </span>
            )}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-550">Satt helt perfekt</span>
        </button>
      </div>
    </div>
  );
}

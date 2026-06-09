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
    <div className="p-4 rounded-none bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-left">
      <h4 className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-3 font-mono">
        :: UTVÄRDERING (SPACED REPETITION)
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Again / Igen Button */}
        <button
          type="button"
          onClick={() => onRateAnswer('again')}
          className={`flex flex-col items-start p-3 rounded-none border text-left cursor-pointer transition-all ${
            suggestedRating === 'again'
              ? 'bg-rose-500/5 border-rose-500 text-rose-700 dark:text-rose-400 font-bold'
              : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-450 hover:border-rose-500/50 hover:bg-rose-500/5 hover:text-rose-600 dark:hover:text-rose-400'
          }`}
        >
          <span className="font-mono text-xs mb-1">
            [3] IGEN {suggestedRating === 'again' && ':: REKOMMENDERAD'}
          </span>
          <span className="text-[10px] text-slate-550 dark:text-zinc-550">Repetera inom kort</span>
        </button>

        {/* Almost / Nästan Button */}
        <button
          type="button"
          onClick={() => onRateAnswer('almost')}
          className={`flex flex-col items-start p-3 rounded-none border text-left cursor-pointer transition-all ${
            suggestedRating === 'almost'
              ? 'bg-amber-500/5 border-amber-500 text-amber-800 dark:text-amber-400 font-bold'
              : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-450 hover:border-amber-500/50 hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400'
          }`}
        >
          <span className="font-mono text-xs mb-1">
            [2] NÄSTAN {suggestedRating === 'almost' && ':: REKOMMENDERAD'}
          </span>
          <span className="text-[10px] text-slate-550 dark:text-zinc-550">Missade nyckelbegrepp</span>
        </button>

        {/* Known / Kan Button */}
        <button
          type="button"
          onClick={() => onRateAnswer('known')}
          className={`flex flex-col items-start p-3 rounded-none border text-left cursor-pointer transition-all ${
            suggestedRating === 'known'
              ? 'bg-emerald-500/5 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-bold'
              : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-450 hover:border-emerald-500/5 hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-400'
          }`}
        >
          <span className="font-mono text-xs mb-1">
            [1] KAN {suggestedRating === 'known' && ':: REKOMMENDERAD'}
          </span>
          <span className="text-[10px] text-slate-550 dark:text-zinc-550">Satt helt perfekt</span>
        </button>
      </div>
    </div>
  );
}

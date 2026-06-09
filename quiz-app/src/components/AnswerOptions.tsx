import type { JSX } from 'react';

interface AnswerOptionsProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  isRevealed: boolean;
  correctIndex?: number;
}

export function AnswerOptions({
  options,
  selectedIndex,
  onSelect,
  isRevealed,
  correctIndex,
}: AnswerOptionsProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-2.5 mb-6">
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = correctIndex === index;
        const isWrongSelection = isSelected && !isCorrect;

        let cardStyle = "bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-400 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-900/50 hover:text-slate-900 dark:hover:text-white";
        let labelStyle = "text-slate-400 dark:text-zinc-650 font-mono";

        if (!isRevealed) {
          if (isSelected) {
            cardStyle = "bg-blue-50/20 dark:bg-blue-500/5 border-blue-500 text-blue-700 dark:text-blue-400 font-medium";
            labelStyle = "text-blue-500 dark:text-blue-400 font-mono font-bold";
          }
        } else {
          // Revealed / Grading state
          if (isCorrect) {
            cardStyle = "bg-emerald-50/20 dark:bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-bold";
            labelStyle = "text-emerald-500 dark:text-emerald-400 font-mono font-bold";
          } else if (isWrongSelection) {
            cardStyle = "bg-rose-50/20 dark:bg-rose-500/10 border-rose-500 text-rose-800 dark:text-rose-450";
            labelStyle = "text-rose-500 dark:text-rose-400 font-mono font-bold";
          } else {
            cardStyle = "opacity-40 bg-slate-50 dark:bg-zinc-900/20 border-slate-200 dark:border-zinc-900 text-slate-400 dark:text-zinc-600 cursor-not-allowed";
            labelStyle = "text-slate-300 dark:text-zinc-800 font-mono";
          }
        }

        return (
          <button
            key={index}
            type="button"
            disabled={isRevealed}
            onClick={() => onSelect(index)}
            className={`flex items-start w-full p-3.5 rounded-none border text-left text-sm leading-relaxed transition-all cursor-pointer ${cardStyle}`}
          >
            {/* Keyboard label indicator */}
            <span className={`shrink-0 mr-3.5 transition-all text-xs ${labelStyle}`}>
              [{index + 1}]
            </span>
            <span className="flex-1">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

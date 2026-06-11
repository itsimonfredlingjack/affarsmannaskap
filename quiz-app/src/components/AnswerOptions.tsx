import type { JSX } from 'react';

interface AnswerOptionsProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  isRevealed: boolean;
  correctIndex?: number;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function AnswerOptions({
  options,
  selectedIndex,
  onSelect,
  isRevealed,
  correctIndex,
}: AnswerOptionsProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-2.5">
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = correctIndex === index;
        const isWrongSelection = isSelected && !isCorrect;

        let cardStyle = 'bg-panel border-border text-text-primary hover:border-accent/40 hover:bg-accent-subtle';
        let letterStyle = 'bg-border-subtle text-text-muted border-border';

        if (!isRevealed) {
          if (isSelected) {
            cardStyle = 'bg-accent-subtle border-accent text-text-primary font-medium';
            letterStyle = 'bg-accent text-white border-accent';
          }
        } else {
          if (isCorrect) {
            cardStyle = 'bg-success-muted/25 border-success text-text-primary font-semibold';
            letterStyle = 'bg-success text-white border-success';
          } else if (isWrongSelection) {
            cardStyle = 'bg-danger-muted/25 border-danger text-text-primary';
            letterStyle = 'bg-danger text-white border-danger';
          } else {
            cardStyle = 'opacity-50 bg-panel border-border-subtle text-text-muted cursor-not-allowed';
            letterStyle = 'bg-border-subtle text-text-muted border-border-subtle';
          }
        }

        return (
          <button
            key={index}
            type="button"
            disabled={isRevealed}
            onClick={() => onSelect(index)}
            className={`flex items-start w-full p-4 rounded-xl border text-left text-sm leading-relaxed transition-all cursor-pointer ${cardStyle}`}
          >
            <span className={`shrink-0 mr-3.5 w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold transition-all ${letterStyle}`}>
              {LETTERS[index] ?? index + 1}
            </span>
            <span className="flex-1 pt-0.5">{option}</span>
            {!isRevealed && (
              <span className="shrink-0 ml-2 text-[10px] text-text-muted font-mono pt-1">
                {index + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
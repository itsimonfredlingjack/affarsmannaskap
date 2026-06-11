import type { JSX } from 'react';
import type { Question } from '../logic/questions';
import { Badge } from './ui/Badge';

const MODE_LABELS: Record<Question['mode'], string> = {
  resonemang: 'Resonemang',
  case: 'Case/essä',
  examinatorrisk: 'Examinator',
  repetition: 'Repetition',
};

interface QuestionPromptProps {
  question: Question;
}

export function QuestionPrompt({ question }: QuestionPromptProps): JSX.Element {
  const tags = question.tags.slice(0, 3);

  return (
    <div className="reading-panel rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Badge variant="accent">{MODE_LABELS[question.mode]}</Badge>
        <Badge variant="default">{question.category}</Badge>
        {question.source && (
          <span className="text-xs text-text-muted">· {question.source}</span>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tags.map(tag => (
            <Badge key={tag} variant="muted">{tag}</Badge>
          ))}
        </div>
      )}

      <p className="font-serif text-lg sm:text-xl leading-loose text-text-primary max-w-prose mx-auto text-center">
        {question.question}
      </p>

      {question.type === 'open' && (
        <>
          <div className="my-6 border-t border-border-subtle" />
          <p className="text-sm text-text-muted text-center">
            Skriv ett kort resonemang innan du visar facit
          </p>
        </>
      )}
    </div>
  );
}
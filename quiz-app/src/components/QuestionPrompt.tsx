import type { JSX } from 'react';
import type { Question, TentaQuestion } from '../logic/questions';
import { Badge } from './ui/Badge';

const MODE_LABELS: Record<Question['mode'], string> = {
  resonemang: 'Resonemang',
  case: 'Case/essä',
  examinatorrisk: 'Examinator',
  repetition: 'Repetition',
  begrepp: 'Begrepp',
  samband: 'Samband',
  tenta: 'Tentamen',
};

const PRIO_LABELS = {
  high: '★★★ Mycket trolig',
  medium: '★★ Trolig',
  low: '★ Buffert',
} as const;

interface QuestionPromptProps {
  question: Question;
}

export function QuestionPrompt({ question }: QuestionPromptProps): JSX.Element {
  const tags = question.tags.slice(0, 3);
  const tenta = question.mode === 'tenta' ? (question as TentaQuestion) : null;

  return (
    <div className={`reading-panel rounded-2xl p-6 sm:p-8 ${tenta?.isPriority ? 'ring-2 ring-warning/30' : ''}`}>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Badge variant="accent">{MODE_LABELS[question.mode]}</Badge>
        {tenta && (
          <Badge variant="muted">Fråga {tenta.originalNumber}</Badge>
        )}
        {tenta?.isPriority && tenta.priorityLevel && (
          <Badge variant="warning">{PRIO_LABELS[tenta.priorityLevel]}</Badge>
        )}
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
            {question.mode === 'tenta'
              ? 'Skriv ett utvecklat tentasvar innan du visar facit'
              : question.mode === 'begrepp' || question.mode === 'samband'
              ? 'Skriv definitionen med egna ord innan du visar facit'
              : 'Skriv ett kort resonemang innan du visar facit'}
          </p>
        </>
      )}
    </div>
  );
}
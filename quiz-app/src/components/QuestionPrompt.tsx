import type { JSX } from 'react';
import type { Question, TentaQuestion, TentaprioQuestion } from '../logic/questions';
import { Badge } from './ui/Badge';

const MODE_LABELS: Record<Question['mode'], string> = {
  resonemang: 'Resonemang',
  case: 'Case/essä',
  examinatorrisk: 'Examinator',
  repetition: 'Repetition',
  begrepp: 'Begrepp',
  samband: 'Samband',
  tenta: 'Tentamen',
  tentaprio: 'Tentaprio 25',
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
  const tenta = question.mode === 'tenta' ? (question as TentaQuestion) : null;
  const tentaprio = question.mode === 'tentaprio' ? (question as TentaprioQuestion) : null;

  const filteredTags = question.tags.slice(0, 3).filter(tag => {
    if (!tenta) return true;
    if (tag === question.category) return false;
    if (/^Tentaprio/.test(tag)) return false;
    if (/^Prio \d/.test(tag)) return false;
    return true;
  });

  return (
    <div className={`reading-panel rounded-2xl p-6 sm:p-8 ${tenta?.isPriority ? 'ring-2 ring-warning/30' : tentaprio ? 'ring-2 ring-accent/25' : ''}`}>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {tentaprio ? (
          <>
            <Badge variant="accent">Tentaprio #{tentaprio.originalNumber}</Badge>
            <Badge variant="warning">Prioriterad</Badge>
            <span className="text-xs text-text-muted">{question.category}</span>
            {question.source && (
              <span className="text-xs text-text-muted">· {question.source}</span>
            )}
          </>
        ) : tenta ? (
          <>
            <Badge variant="accent">Tenta #{tenta.originalNumber}</Badge>
            {tenta.isPriority && tenta.priorityLevel && (
              <Badge variant="warning">{PRIO_LABELS[tenta.priorityLevel]}</Badge>
            )}
            <span className="text-xs text-text-muted">{question.category}</span>
            {question.source && (
              <span className="text-xs text-text-muted">· {question.source}</span>
            )}
          </>
        ) : (
          <>
            <Badge variant="accent">{MODE_LABELS[question.mode]}</Badge>
            <Badge variant="default">{question.category}</Badge>
            {question.source && (
              <span className="text-xs text-text-muted">· {question.source}</span>
            )}
          </>
        )}
      </div>

      {filteredTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {filteredTags.map(tag => (
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
              : question.mode === 'tentaprio'
              ? 'Skriv ett kort svar innan du visar sammanfattningsfacit'
              : question.mode === 'begrepp' || question.mode === 'samband'
              ? 'Skriv definitionen med egna ord innan du visar facit'
              : 'Skriv ett kort resonemang innan du visar facit'}
          </p>
        </>
      )}
    </div>
  );
}
import { useState, type JSX } from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TENTA_EXAM_INFO } from '../logic/tenta-questions';

interface TentaSessionPanelProps {
  totalCount: number;
  dueCount: number;
  onStartSession: (size: number | 'all') => void;
  onBrowse: () => void;
}

export function TentaSessionPanel({
  totalCount,
  dueCount,
  onStartSession,
  onBrowse,
}: TentaSessionPanelProps): JSX.Element {
  const [sessionSize, setSessionSize] = useState<number | 'all'>(10);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-2 gap-3">
        <Card padding="sm" className="text-center">
          <BookOpen size={18} className="mx-auto mb-2 text-accent opacity-80" />
          <p className="text-2xl font-display font-bold text-text-primary tabular-nums">{totalCount}</p>
          <p className="text-xs text-text-muted mt-0.5">Totalt</p>
        </Card>
        <Card
          padding="sm"
          className={`text-center ${dueCount > 0 ? 'border-warning/30' : 'border-success/30'}`}
        >
          <RefreshCw
            size={18}
            className={`mx-auto mb-2 ${dueCount > 0 ? 'text-warning' : 'text-success'}`}
          />
          <p
            className={`text-2xl font-display font-bold tabular-nums ${
              dueCount > 0 ? 'text-warning' : 'text-success'
            }`}
          >
            {dueCount}
          </p>
          <p className={`text-xs mt-0.5 ${dueCount > 0 ? 'text-warning' : 'text-success'}`}>
            {dueCount > 0 ? 'Att repetera' : 'Klart idag'}
          </p>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col">
        <p className="text-sm font-semibold text-text-secondary mb-4">
          Starta session
        </p>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {([5, 10, 25, 'all'] as Array<number | 'all'>).map(size => {
            const isSelected = sessionSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSessionSize(size)}
                className={`min-h-11 rounded-xl border text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                  isSelected
                    ? 'bg-accent text-white border-accent shadow-card'
                    : 'bg-surface border-border text-text-secondary hover:border-accent/40 hover:bg-accent-subtle active:scale-[0.98]'
                }`}
              >
                {size === 'all' ? 'Alla' : size}
              </button>
            );
          })}
        </div>

        <Button onClick={() => onStartSession(sessionSize)} size="lg" fullWidth className="mb-3">
          Börja studera →
        </Button>

        <button
          type="button"
          onClick={onBrowse}
          className="w-full min-h-11 py-2 text-sm text-text-muted hover:text-accent transition-colors cursor-pointer rounded-xl hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Bläddra alla frågor
        </button>
      </Card>

      <Card className="border-warning/20 bg-warning-muted/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-warning mb-3">
          Så bedöms tentan
        </p>
        <ul className="space-y-2 text-xs text-text-secondary">
          {TENTA_EXAM_INFO.areas.map(area => (
            <li key={area.id} className="flex gap-2">
              <span className="font-semibold text-warning shrink-0 w-4">
                {String.fromCharCode(64 + area.id)}
              </span>
              <span>
                <span className="text-text-primary">{area.label}</span>
                {' — '}
                {area.questionsOnExam} frågor, minst {area.passAt} rätt
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-text-muted mt-3 leading-relaxed border-t border-border-subtle pt-3">
          Godkänt svar: förklara, redogör, sätt i sammanhang och ge exempel.
        </p>
      </Card>
    </div>
  );
}
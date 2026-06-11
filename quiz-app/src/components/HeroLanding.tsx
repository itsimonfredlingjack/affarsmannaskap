import { useState, type JSX } from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface HeroLandingProps {
  dueCount: number;
  totalCount: number;
  onStartSession: (size: number | 'all') => void;
}

export function HeroLanding({ dueCount, totalCount, onStartSession }: HeroLandingProps): JSX.Element {
  const [sessionSize, setSessionSize] = useState<number | 'all'>(10);

  return (
    <div className="max-w-lg mx-auto w-full my-auto px-4 py-12 flex flex-col justify-center card-enter">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Briefing Room</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-text-primary mb-3">
          Dags att studera
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
          Träna korta essäsvar med modeller, ekonomi och affärsbeslut.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card padding="sm" className="text-center">
          <BookOpen size={18} className="mx-auto mb-2 text-accent opacity-80" />
          <p className="text-2xl font-display font-bold text-text-primary">{totalCount}</p>
          <p className="text-xs text-text-muted mt-0.5">Totala frågor</p>
        </Card>
        <Card
          padding="sm"
          className={`text-center ${dueCount > 0 ? 'border-warning/30' : 'border-success/30'}`}
        >
          <RefreshCw size={18} className={`mx-auto mb-2 ${dueCount > 0 ? 'text-warning' : 'text-success'}`} />
          <p className={`text-2xl font-display font-bold ${dueCount > 0 ? 'text-warning' : 'text-success'}`}>
            {dueCount}
          </p>
          <p className={`text-xs mt-0.5 ${dueCount > 0 ? 'text-warning' : 'text-success'}`}>
            {dueCount > 0 ? 'Att repetera idag' : 'Allt repeterat'}
          </p>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-semibold text-text-secondary mb-4 text-center">
          Hur många frågor?
        </p>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {([5, 10, 'all'] as const).map((size) => {
            const isSelected = sessionSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSessionSize(size)}
                className={`py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-white border-accent shadow-card'
                    : 'bg-surface border-border text-text-secondary hover:border-accent/40 hover:bg-accent-subtle'
                }`}
              >
                {size === 'all' ? 'Alla' : size}
              </button>
            );
          })}
        </div>

        <Button onClick={() => onStartSession(sessionSize)} size="lg" fullWidth>
          Börja studera →
        </Button>
      </Card>
    </div>
  );
}
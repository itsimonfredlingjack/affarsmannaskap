import { useState, type JSX } from 'react';
import { BookOpen, RefreshCw, Calculator, GitMerge } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export type StudyTrack = 'essay' | 'terms';

interface HeroLandingProps {
  studyTrack: StudyTrack | null;
  essayCount: number;
  termsCount: number;
  essayDueCount: number;
  termsDueCount: number;
  onSelectTrack: (track: StudyTrack) => void;
  onBackToTracks: () => void;
  onBrowse: () => void;
  onStartSession: (size: number | 'all') => void;
}

export function HeroLanding({
  studyTrack,
  essayCount,
  termsCount,
  essayDueCount,
  termsDueCount,
  onSelectTrack,
  onBackToTracks,
  onBrowse,
  onStartSession,
}: HeroLandingProps): JSX.Element {
  const [sessionSize, setSessionSize] = useState<number | 'all'>(10);

  if (studyTrack === null) {
    return (
      <div className="max-w-lg mx-auto w-full my-auto px-4 py-12 flex flex-col justify-center card-enter">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Briefing Room</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary mb-3">
            Dags att studera
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
            Välj om du vill träna essäer eller ekonomibegrepp från kurslitteraturen.
          </p>
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => onSelectTrack('essay')}
            className="text-left rounded-2xl border border-border bg-panel p-5 hover:border-accent/40 hover:bg-accent-subtle transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-accent-subtle text-accent">
                <GitMerge size={22} />
              </div>
              <div>
                <h2 className="font-display font-bold text-text-primary mb-1">Essäträning</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Korta essäsvar med modeller, affärsbeslut och tentamensfrågor.
                </p>
                <p className="text-xs text-text-muted mt-2">{essayCount} frågor</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTrack('terms')}
            className="text-left rounded-2xl border border-border bg-panel p-5 hover:border-accent/40 hover:bg-accent-subtle transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-accent-subtle text-accent">
                <Calculator size={22} />
              </div>
              <div>
                <h2 className="font-display font-bold text-text-primary mb-1">Ekonomibegrepp</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Definitioner, formler och samband från AM5 — soliditet, likviditet, TB m.m.
                </p>
                <p className="text-xs text-text-muted mt-2">{termsCount} kort</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  const totalCount = studyTrack === 'essay' ? essayCount : termsCount;
  const dueCount = studyTrack === 'essay' ? essayDueCount : termsDueCount;
  const trackLabel = studyTrack === 'essay' ? 'Essäträning' : 'Ekonomibegrepp';
  const trackDescription = studyTrack === 'essay'
    ? 'Träna korta essäsvar med modeller, ekonomi och affärsbeslut.'
    : 'Träna definitioner, flerval och samband från företagsekonomin.';

  return (
    <div className="max-w-lg mx-auto w-full my-auto px-4 py-12 flex flex-col justify-center card-enter">
      <button
        type="button"
        onClick={onBackToTracks}
        className="text-sm text-text-muted hover:text-accent mb-6 self-start cursor-pointer transition-colors"
      >
        ← Byt studieläge
      </button>

      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">{trackLabel}</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-text-primary mb-3">
          Dags att studera
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
          {trackDescription}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Card padding="sm" className="text-center">
          <BookOpen size={18} className="mx-auto mb-2 text-accent opacity-80" />
          <p className="text-2xl font-display font-bold text-text-primary">{totalCount}</p>
          <p className="text-xs text-text-muted mt-0.5">Totalt</p>
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

        <button
          type="button"
          onClick={onBrowse}
          className="w-full mt-3 py-2.5 text-sm text-text-muted hover:text-accent transition-colors cursor-pointer"
        >
          Bläddra alla frågor
        </button>
      </Card>
    </div>
  );
}
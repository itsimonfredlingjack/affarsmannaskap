import { useState, type JSX } from 'react';
import { BookOpen, RefreshCw, Calculator, GitMerge, GraduationCap, Star, Zap } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import type { TentaReadiness } from '../logic/tenta-readiness';
import { TentaDashboard } from './TentaDashboard';
import { TentaSessionPanel } from './TentaSessionPanel';

export type StudyTrack = 'essay' | 'terms' | 'tenta' | 'tentaprio';

interface HeroLandingProps {
  studyTrack: StudyTrack | null;
  essayCount: number;
  termsCount: number;
  tentaCount: number;
  tentaPriorityCount: number;
  tentaprioCount: number;
  essayDueCount: number;
  termsDueCount: number;
  tentaDueCount: number;
  tentaprioDueCount: number;
  tentaReadiness?: TentaReadiness | null;
  tentaprioReadiness?: TentaReadiness | null;
  onSelectTrack: (track: StudyTrack) => void;
  onBackToTracks: () => void;
  onBrowse: () => void;
  onStartSession: (size: number | 'all') => void;
}

export function HeroLanding({
  studyTrack,
  essayCount,
  termsCount,
  tentaCount,
  tentaPriorityCount,
  tentaprioCount,
  essayDueCount,
  termsDueCount,
  tentaDueCount,
  tentaprioDueCount,
  tentaReadiness = null,
  tentaprioReadiness = null,
  onSelectTrack,
  onBackToTracks,
  onBrowse,
  onStartSession,
}: HeroLandingProps): JSX.Element {
  const [sessionSize, setSessionSize] = useState<number | 'all'>(10);

  if (studyTrack === null) {
    return (
      <div className="max-w-5xl mx-auto w-full my-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center card-enter">
        <div className="mb-8 sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Briefing Room</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-text-primary mb-3">
            Dags att studera
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            Välj studieläge: tentafrågor med facit, snabbversion av de 25 prioriterade, essäträning eller ekonomibegrepp.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onSelectTrack('tenta')}
            className="text-left rounded-2xl border-2 border-warning/40 bg-panel p-5 hover:border-warning/60 hover:bg-warning-muted/10 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-warning-muted/30 text-warning">
                <GraduationCap size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display font-bold text-text-primary">Tentamen</h2>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-warning">Nästa vecka</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Alla 61 instuderingsfrågor med handkurerade tentasvar. Prioriterade 25 först.
                </p>
                <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                  <Star size={11} className="text-warning fill-warning" />
                  {tentaPriorityCount} prioriterade · {tentaCount} totalt
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTrack('tentaprio')}
            className="text-left rounded-2xl border-2 border-accent/40 bg-panel p-5 hover:border-accent/60 hover:bg-accent-subtle transition-all cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-accent-subtle text-accent">
                <Zap size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display font-bold text-text-primary">Tentaprio 25</h2>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">Snabbversion</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Samma 25 prioriterade frågor med kort sammanfattning först och fördjupning på begäran.
                </p>
                <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                  <Star size={11} className="text-accent fill-accent" />
                  {tentaprioCount} frågor · sammanfattningsfacit
                </p>
              </div>
            </div>
          </button>

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

  const totalCount = studyTrack === 'tenta'
    ? tentaCount
    : studyTrack === 'tentaprio'
    ? tentaprioCount
    : studyTrack === 'essay'
    ? essayCount
    : termsCount;
  const dueCount = studyTrack === 'tenta'
    ? tentaDueCount
    : studyTrack === 'tentaprio'
    ? tentaprioDueCount
    : studyTrack === 'essay'
    ? essayDueCount
    : termsDueCount;
  const trackLabel = studyTrack === 'tenta'
    ? 'Tentamen'
    : studyTrack === 'tentaprio'
    ? 'Tentaprio 25'
    : studyTrack === 'essay'
    ? 'Essäträning'
    : 'Ekonomibegrepp';
  const trackDescription = studyTrack === 'tenta'
    ? 'Träna de faktiska tentafrågorna. Prioriterade frågor kommer först i kön.'
    : studyTrack === 'tentaprio'
    ? 'Snabbträna de 25 viktigaste frågorna. Facit visar kort sammanfattning — fäll ut fördjupning vid behov.'
    : studyTrack === 'essay'
    ? 'Träna korta essäsvar med modeller, ekonomi och affärsbeslut.'
    : 'Träna definitioner, flerval och samband från företagsekonomin.';

  if (studyTrack === 'tenta' || studyTrack === 'tentaprio') {
    return (
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 card-enter">
        <button
          type="button"
          onClick={onBackToTracks}
          className="text-sm text-text-muted hover:text-accent mb-6 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-lg px-1"
        >
          ← Byt studieläge
        </button>

        <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
              {trackLabel}
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-text-primary mb-2">
              Dags att studera
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
              {trackDescription}
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            {studyTrack === 'tenta' && tentaReadiness && <TentaDashboard readiness={tentaReadiness} />}
            {studyTrack === 'tentaprio' && tentaprioReadiness && <TentaDashboard readiness={tentaprioReadiness} />}
          </div>
          <div className="lg:col-span-4">
            <TentaSessionPanel
              totalCount={studyTrack === 'tentaprio' ? tentaprioCount : tentaCount}
              dueCount={studyTrack === 'tentaprio' ? tentaprioDueCount : tentaDueCount}
              onStartSession={onStartSession}
              onBrowse={onBrowse}
            />
          </div>
        </div>
      </div>
    );
  }

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
          {([5, 10, 'all'] as Array<number | 'all'>).map((size) => {
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
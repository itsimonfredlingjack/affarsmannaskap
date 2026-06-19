import { useState, type JSX } from 'react';
import { Search, RotateCcw, X, ChevronDown, BookOpen, GitMerge, Briefcase, RefreshCw, Target, Calculator, ListChecks, Link2, GraduationCap, Star, Building2, Users, Handshake } from 'lucide-react';
import type { Question, TentaQuestion } from '../logic/questions';
import type { StudyTrack } from './HeroLanding';
import type { CardProgress } from '../logic/sm2';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface SidebarProps {
  studyTrack: StudyTrack | null;
  masteryPercent: number;
  masteredCount: number;
  totalCount: number;
  onResetProgress: () => void;
  isOpen: boolean;
  onClose: () => void;
  dueCount: number;
  activeMode: string;
  setActiveMode: (mode: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredQuestions: Question[];
  cardProgresses: Record<string, CardProgress>;
  activeQuestionId: string | null;
  onSelectQuestion: (question: Question) => void;
  collapsed?: boolean;
}

function getQuestionLabel(question: Question): string {
  if (question.mode === 'tenta') {
    const tenta = question as TentaQuestion;
    const prefix = tenta.isPriority ? '★ ' : '';
    const title = question.question.length <= 36
      ? question.question
      : `${question.question.slice(0, 36)}…`;
    return `${prefix}${tenta.originalNumber}. ${title}`;
  }

  const fromId = question.id
    .replace(/^essay-/, '')
    .replace(/^mc-/, '')
    .replace(/-/g, ' ');
  if (fromId.length <= 42) {
    return fromId.charAt(0).toUpperCase() + fromId.slice(1);
  }
  return `${question.question.slice(0, 40)}…`;
}

export function Sidebar({
  studyTrack,
  masteryPercent,
  masteredCount,
  totalCount,
  dueCount,
  activeMode,
  setActiveMode,
  searchQuery,
  setSearchQuery,
  filteredQuestions,
  cardProgresses,
  activeQuestionId,
  onSelectQuestion,
  onResetProgress,
  isOpen,
  onClose,
  collapsed = false,
}: SidebarProps): JSX.Element {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [questionsListOpen, setQuestionsListOpen] = useState(false);

  const questionListLabel = studyTrack === 'terms'
    ? 'Begreppslista'
    : studyTrack === 'tenta'
    ? 'Tentafrågor'
    : 'Frågelista';

  const getCareerBadge = (percent: number) => {
    if (percent >= 100) return { title: 'Partner', variant: 'warning' as const };
    if (percent >= 80) return { title: 'Manager', variant: 'accent' as const };
    if (percent >= 60) return { title: 'Senior Consultant', variant: 'default' as const };
    if (percent >= 40) return { title: 'Consultant', variant: 'success' as const };
    if (percent >= 20) return { title: 'Junior Associate', variant: 'muted' as const };
    return { title: 'Intern', variant: 'muted' as const };
  };

  const badge = getCareerBadge(masteryPercent);

  const essayModeButtons = [
    { id: 'all', label: 'Alla frågor', icon: BookOpen },
    { id: 'resonemang', label: 'Resonemang', icon: GitMerge },
    { id: 'case', label: 'Case/essä', icon: Briefcase },
    { id: 'examinatorrisk', label: 'Examinator', icon: Target },
    { id: 'repetition', label: 'Repetition', icon: RefreshCw },
  ];

  const termsModeButtons = [
    { id: 'all', label: 'Alla begrepp', icon: Calculator },
    { id: 'begrepp', label: 'Öppna', icon: BookOpen },
    { id: 'mc', label: 'Flerval', icon: ListChecks },
    { id: 'samband', label: 'Samband', icon: Link2 },
    { id: 'repetition', label: 'Repetition', icon: RefreshCw },
  ];

  const tentaModeButtons = [
    { id: 'all', label: 'Alla frågor', icon: GraduationCap },
    { id: 'priority', label: 'Tentaprio 25', icon: Star },
    { id: 'area1', label: 'Block A — Ekonomi', icon: Building2 },
    { id: 'area2', label: 'Block B — Kund', icon: Users },
    { id: 'area3', label: 'Block C — Sälj', icon: Handshake },
    { id: 'repetition', label: 'Repetition', icon: RefreshCw },
  ];

  const modeButtons = studyTrack === 'tenta'
    ? tentaModeButtons
    : studyTrack === 'terms'
    ? termsModeButtons
    : essayModeButtons;

  if (collapsed) {
    return <></>;
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-elevated border-r border-border transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <span className="text-sm font-display font-bold text-text-primary">
            {studyTrack === 'tenta' ? 'Tentamen' : studyTrack === 'terms' ? 'Ekonomibegrepp' : studyTrack === 'essay' ? 'Essäträning' : 'Affärsmannaskap'}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-panel lg:hidden cursor-pointer transition-colors"
            aria-label="Stäng sidopanel"
          >
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-border shrink-0">
          <button
            type="button"
            onClick={() => setOverviewOpen(prev => !prev)}
            className="flex items-center justify-between w-full px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted hover:text-text-primary cursor-pointer transition-colors"
            aria-expanded={overviewOpen}
          >
            <span>Översikt & filter</span>
            <ChevronDown
              size={14}
              className={`shrink-0 transition-transform duration-200 ${overviewOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {overviewOpen && (
            <>
              <div className="px-4 pb-4">
                <div className="p-4 rounded-xl bg-panel border border-border shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-text-muted uppercase tracking-wide">Framsteg</span>
                    <Badge variant={badge.variant}>{badge.title}</Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className="relative w-14 h-14 shrink-0 rounded-full flex items-center justify-center"
                      style={{
                        background: `conic-gradient(var(--color-accent) ${masteryPercent}%, var(--color-border) ${masteryPercent}%)`,
                      }}
                    >
                      <div className="absolute inset-1.5 rounded-full bg-panel flex items-center justify-center">
                        <span className="text-xs font-bold text-accent">{masteryPercent}%</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">
                        {masteredCount} / {totalCount} bemästrade
                      </p>
                      {dueCount > 0 && (
                        <p className="text-xs text-warning mt-0.5">{dueCount} att repetera</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <nav className="px-3 pb-3" aria-label="Studielägen">
                <div className="flex flex-col gap-1">
                  {modeButtons.map(button => {
                    const Icon = button.icon;
                    const isActive = activeMode === button.id;
                    return (
                      <button
                        key={button.id}
                        onClick={() => {
                          setActiveMode(button.id);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`flex items-center w-full px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                          isActive
                            ? 'bg-accent-muted text-accent font-semibold border border-accent/20'
                            : 'text-text-secondary hover:text-text-primary hover:bg-panel border border-transparent'
                        }`}
                      >
                        <Icon size={15} className={`mr-2.5 shrink-0 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
                        <span className="flex-1 text-left">{button.label}</span>
                        {button.id === 'repetition' && dueCount > 0 && (
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0">{dueCount}</Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </nav>

              <div className="px-3 pb-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Sök frågor..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col flex-1 min-h-0 border-b border-border">
          <button
            type="button"
            onClick={() => setQuestionsListOpen(prev => !prev)}
            className="flex items-center justify-between w-full px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted hover:text-text-primary cursor-pointer transition-colors shrink-0"
            aria-expanded={questionsListOpen}
          >
            <span>{questionListLabel} ({filteredQuestions.length})</span>
            <ChevronDown
              size={14}
              className={`shrink-0 transition-transform duration-200 ${questionsListOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {questionsListOpen && (
            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
              <ul className="space-y-1 pb-4">
                {filteredQuestions.map((q) => {
                  const progress = cardProgresses[q.id];
                  const rating = progress?.rating;

                  let dotColor = 'bg-border';
                  if (rating === 'known') dotColor = 'bg-success';
                  else if (rating === 'almost') dotColor = 'bg-warning';
                  else if (rating === 'again') dotColor = 'bg-danger';

                  const isActive = activeQuestionId === q.id;
                  const isPriorityTenta = q.mode === 'tenta' && (q as TentaQuestion).isPriority;

                  return (
                    <li key={q.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectQuestion(q);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`flex items-start gap-1.5 w-full px-2 py-2 rounded-xl text-left text-sm cursor-pointer transition-all ${
                          isActive
                            ? 'bg-accent-muted border border-accent/20 text-text-primary font-semibold'
                            : isPriorityTenta
                            ? 'border border-warning/15 text-text-secondary hover:text-text-primary hover:bg-warning-muted/10'
                            : 'border border-transparent text-text-secondary hover:text-text-primary hover:bg-panel'
                        }`}
                      >
                        <span className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${dotColor}`} />
                        <span className="block truncate">{getQuestionLabel(q)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="px-3 py-3 border-t border-border">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center justify-center w-full px-3 py-2 text-xs rounded-xl text-text-muted hover:text-text-primary hover:bg-panel border border-border cursor-pointer transition-colors"
            >
              <RotateCcw size={12} className="mr-2" />
              Nollställ framsteg
            </button>
          ) : (
            <div className="space-y-2 p-3 bg-danger-muted/20 border border-danger/20 rounded-xl">
              <p className="text-xs text-center text-danger font-semibold">Nollställ allt?</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    onResetProgress();
                    setShowConfirmReset(false);
                  }}
                  variant="danger"
                  size="sm"
                  fullWidth
                >
                  Ja
                </Button>
                <Button
                  onClick={() => setShowConfirmReset(false)}
                  variant="secondary"
                  size="sm"
                  fullWidth
                >
                  Avbryt
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
import { useState, type JSX } from 'react';
import { Search, RotateCcw, X, ChevronRight, BookOpen, GitMerge, Briefcase, RefreshCw, Target } from 'lucide-react';
import type { Question } from '../logic/questions';
import type { CardProgress } from '../logic/sm2';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface SidebarProps {
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

  const getCareerBadge = (percent: number) => {
    if (percent >= 100) return { title: 'Partner', variant: 'warning' as const };
    if (percent >= 80) return { title: 'Manager', variant: 'accent' as const };
    if (percent >= 60) return { title: 'Senior Consultant', variant: 'default' as const };
    if (percent >= 40) return { title: 'Consultant', variant: 'success' as const };
    if (percent >= 20) return { title: 'Junior Associate', variant: 'muted' as const };
    return { title: 'Intern', variant: 'muted' as const };
  };

  const badge = getCareerBadge(masteryPercent);

  const modeButtons = [
    { id: 'all', label: 'Alla frågor', icon: BookOpen },
    { id: 'resonemang', label: 'Resonemang', icon: GitMerge },
    { id: 'case', label: 'Case/essä', icon: Briefcase },
    { id: 'examinatorrisk', label: 'Examinator', icon: Target },
    { id: 'repetition', label: 'Repetition', icon: RefreshCw },
  ];

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
          <span className="text-sm font-display font-bold text-text-primary">Affärsmannaskap</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-panel lg:hidden cursor-pointer transition-colors"
            aria-label="Stäng sidopanel"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-border">
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

        <nav className="px-3 py-3 border-b border-border" aria-label="Studielägen">
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

        <div className="px-3 py-3 border-b border-border">
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

        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
          <p className="px-1 mb-2 text-xs text-text-muted">
            {filteredQuestions.length} frågor
          </p>
          <ul className="space-y-1 pb-4">
            {filteredQuestions.map((q) => {
              const progress = cardProgresses[q.id];
              const rating = progress?.rating;

              let dotColor = 'bg-border';
              if (rating === 'known') dotColor = 'bg-success';
              else if (rating === 'almost') dotColor = 'bg-warning';
              else if (rating === 'again') dotColor = 'bg-danger';

              const isActive = activeQuestionId === q.id;

              return (
                <li key={q.id}>
                  <button
                    onClick={() => {
                      onSelectQuestion(q);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-left text-sm transition-all cursor-pointer ${
                      isActive
                        ? 'bg-accent-muted text-text-primary font-semibold border border-accent/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-panel border border-transparent'
                    }`}
                  >
                    <span className={`shrink-0 w-2 h-2 rounded-full ${dotColor}`} />
                    <span className="truncate flex-1 min-w-0">{getQuestionLabel(q)}</span>
                    <Badge variant="muted" className="shrink-0 text-[10px] max-w-[72px] truncate hidden sm:inline-flex">
                      {q.category}
                    </Badge>
                    <ChevronRight size={12} className="text-text-muted shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
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
import { useState, type JSX } from 'react';
import { Search, RotateCcw, X, ChevronRight, BookOpen, GitMerge, Briefcase, RefreshCw, Target } from 'lucide-react';
import type { Question } from '../logic/questions';
import type { CardProgress } from '../logic/sm2';

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
}: SidebarProps): JSX.Element {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const getCareerBadge = (percent: number) => {
    if (percent >= 100) return { title: "Partner 👑", color: "bg-yellow-500/10 text-yellow-500 border-yellow-600/30" };
    if (percent >= 80) return { title: "Manager 👔", color: "bg-blue-500/10 text-blue-400 border-blue-600/30" };
    if (percent >= 60) return { title: "Senior Consultant", color: "bg-slate-500/10 text-slate-300 border-slate-500/30" };
    if (percent >= 40) return { title: "Consultant", color: "bg-emerald-500/10 text-emerald-400 border-emerald-600/30" };
    if (percent >= 20) return { title: "Junior Associate", color: "bg-zinc-800/30 text-zinc-400 border-zinc-700/50" };
    return { title: "Intern", color: "bg-zinc-900/30 text-zinc-500 border-zinc-800" };
  };

  const badge = getCareerBadge(masteryPercent);

  const modeButtons = [
    { id: 'all', label: 'Alla frågor', icon: BookOpen },
    { id: 'resonemang', label: 'Resonemang', icon: GitMerge },
    { id: 'case', label: 'Case/essä', icon: Briefcase },
    { id: 'examinatorrisk', label: 'Examinator', icon: Target },
    { id: 'repetition', label: 'Repetition', icon: RefreshCw },
  ];

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-zinc-950 border-r border-zinc-800 transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <span className="text-sm font-bold text-zinc-200">Affärsmannaskap</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 lg:hidden cursor-pointer transition-colors"
            aria-label="Stäng sidopanel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress block */}
        <div className="px-4 py-4 border-b border-zinc-800">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Bemästrade</span>
              <span className="text-xs font-bold text-blue-400">{masteredCount} / {totalCount}</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${masteryPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full border text-center ${badge.color}`}>
                {badge.title}
              </span>
              {dueCount > 0 && (
                <span className="text-xs text-amber-400">{dueCount} att repetera</span>
              )}
            </div>
          </div>
        </div>

        {/* Mode Navigation */}
        <nav className="px-3 py-3 space-y-0.5 border-b border-zinc-800" aria-label="Studielägen">
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
                className={`flex items-center w-full px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon size={14} className={`mr-2.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                <span className="flex-1 text-left">{button.label}</span>
                {button.id === 'repetition' && dueCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400">
                    {dueCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Search */}
        <div className="px-3 py-3 border-b border-zinc-800">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök frågor..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Question List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
          <p className="px-1 mb-2 text-xs text-zinc-600">
            {filteredQuestions.length} frågor
          </p>
          <ul className="space-y-0.5 pb-4">
            {filteredQuestions.map((q) => {
              const progress = cardProgresses[q.id];
              const rating = progress?.rating;

              let dot = '○';
              let dotColor = 'text-zinc-700';

              if (rating === 'known') {
                dot = '●';
                dotColor = 'text-emerald-500';
              } else if (rating === 'almost') {
                dot = '●';
                dotColor = 'text-amber-500';
              } else if (rating === 'again') {
                dot = '●';
                dotColor = 'text-rose-500';
              }

              const isActive = activeQuestionId === q.id;

              return (
                <li key={q.id}>
                  <button
                    onClick={() => {
                      onSelectQuestion(q);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center w-full px-2 py-1.5 rounded-lg text-left text-sm transition-all cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    <span className={`mr-2 shrink-0 text-xs ${dotColor}`}>{dot}</span>
                    <span className="truncate flex-1">{q.question}</span>
                    <ChevronRight size={12} className="text-zinc-600 shrink-0 ml-1" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer / Reset */}
        <div className="px-3 py-3 border-t border-zinc-800">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center justify-center w-full px-3 py-2 text-xs rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-zinc-800 cursor-pointer transition-colors"
            >
              <RotateCcw size={12} className="mr-2" />
              Nollställ framsteg
            </button>
          ) : (
            <div className="space-y-2 p-2 bg-rose-500/5 border border-rose-500/20 rounded-lg">
              <p className="text-xs text-center text-rose-400 font-semibold">Nollställ allt?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowConfirmReset(false);
                  }}
                  className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-colors"
                >
                  Ja
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

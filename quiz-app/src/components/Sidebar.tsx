import { useState, type JSX } from 'react';
import { Search, RotateCcw, X, ChevronRight, BookOpen, Layers, GitMerge, Briefcase, RefreshCw } from 'lucide-react';
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

  // Calculate career title
  const getCareerBadge = (percent: number) => {
    if (percent >= 100) return { title: "PARTNER 👑", color: "border-yellow-600/35 bg-yellow-500/5 text-yellow-500 font-bold" };
    if (percent >= 80) return { title: "MANAGER 👔", color: "border-blue-600/35 bg-blue-500/5 text-blue-400 font-bold" };
    if (percent >= 60) return { title: "SENIOR CONSULTANT", color: "border-slate-500/30 bg-slate-500/5 text-slate-300" };
    if (percent >= 40) return { title: "CONSULTANT", color: "border-emerald-600/35 bg-emerald-500/5 text-emerald-400" };
    if (percent >= 20) return { title: "JUNIOR ASSOCIATE", color: "border-zinc-700/50 bg-zinc-800/10 text-zinc-400" };
    return { title: "INTERN", color: "border-zinc-800 bg-zinc-900/30 text-zinc-500" };
  };

  const badge = getCareerBadge(masteryPercent);

  const modeButtons = [
    { id: 'all', label: 'Alla frågor', icon: BookOpen },
    { id: 'begrepp', label: 'Begrepp', icon: Layers },
    { id: 'samband', label: 'Samband', icon: GitMerge },
    { id: 'case', label: 'Case', icon: Briefcase },
    { id: 'repetition', label: 'Repetition', icon: RefreshCw },
  ];

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 lg:hidden transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-80 bg-zinc-950 border-r border-slate-200 dark:border-zinc-850 transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4.5 border-b border-slate-200 dark:border-zinc-850">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-blue-500">
              [AM_CORE_v2.0]
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-500">
              TERMINAL
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-none text-slate-500 hover:text-slate-300 lg:hidden cursor-pointer"
            aria-label="Stäng sidopanel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress block */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-850">
          <div className="p-3 bg-slate-50 dark:bg-zinc-900/40 border border-slate-250 dark:border-zinc-800 font-mono text-[10px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-500 dark:text-zinc-500">BEMÄSTRAT:</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">{masteryPercent}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-900 rounded-none overflow-hidden mb-2">
              <div 
                className="h-full bg-blue-500 dark:bg-blue-600 rounded-none"
                style={{ width: `${masteryPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-slate-550 dark:text-zinc-500">
              <span>{masteredCount}/{totalCount} KLARA</span>
              <span>[{dueCount} REPETITIONER]</span>
            </div>

            {/* Career badge */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="font-bold text-slate-500 dark:text-zinc-500">KARRIÄRNIVÅ:</span>
              <div className={`px-2 py-0.5 text-[9px] border font-mono rounded-none ${badge.color}`}>
                {badge.title}
              </div>
            </div>
          </div>
        </div>

        {/* Mode Navigation */}
        <nav className="p-3 space-y-1 font-mono text-[11px]" aria-label="Studielägen">
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
                className={`flex items-center w-full px-3 py-2 rounded-none transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white border-l-2 border-blue-500 font-bold' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900/30'
                }`}
              >
                <Icon size={12} className={`mr-2.5 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
                <span className="flex-1 text-left">{button.label.toUpperCase()}</span>
                {button.id === 'repetition' && dueCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-none bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                    {dueCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Search */}
        <div className="px-3 py-1.5 border-b border-slate-200 dark:border-zinc-850 pb-3">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SÖK FRÅGOR..."
              className="w-full pl-7 pr-3 py-2 text-[10px] font-mono rounded-none bg-slate-50 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-800 text-slate-800 dark:text-zinc-350 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-0"
            />
          </div>
        </div>

        {/* Question List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 mt-1">
          <div className="px-1.5 mb-1.5">
            <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase font-mono">:: FRÅGELISTA ({filteredQuestions.length})</span>
          </div>
          <ul className="space-y-0.5 pb-4 font-mono text-[10px]">
            {filteredQuestions.map((q) => {
              const progress = cardProgresses[q.id];
              const rating = progress?.rating;
              
              // Status text indicators
              let statusTag = '[ ]';
              let statusColor = 'text-zinc-600 dark:text-zinc-550';
              
              if (rating === 'known') {
                statusTag = '[K]';
                statusColor = 'text-emerald-600 dark:text-emerald-400 font-bold';
              } else if (rating === 'almost') {
                statusTag = '[A]';
                statusColor = 'text-amber-600 dark:text-amber-400 font-bold';
              } else if (rating === 'again') {
                statusTag = '[I]';
                statusColor = 'text-rose-600 dark:text-rose-450 font-bold';
              }

              const isActive = activeQuestionId === q.id;

              return (
                <li key={q.id}>
                  <button
                    onClick={() => {
                      onSelectQuestion(q);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center w-full px-2 py-1.5 rounded-none text-left transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-zinc-800' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900/20'
                    }`}
                  >
                    <span className={`mr-2 shrink-0 ${statusColor}`}>
                      {statusTag}
                    </span>
                    <span className="truncate flex-1 font-sans text-[11px] font-medium text-slate-700 dark:text-zinc-300">{q.question}</span>
                    <ChevronRight size={10} className="text-slate-400 shrink-0 ml-1" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer / Reset */}
        <div className="p-3 border-t border-slate-200 dark:border-zinc-850 bg-slate-50 dark:bg-zinc-950/40">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center justify-center w-full px-3 py-1.5 text-[9px] font-mono font-bold rounded-none text-slate-500 hover:text-slate-800 dark:hover:text-zinc-350 hover:bg-slate-100 dark:hover:bg-zinc-900 border border-slate-250 dark:border-zinc-800 cursor-pointer"
            >
              <RotateCcw size={10} className="mr-1.5" />
              NOLLSTÄLL FRAMSTEG
            </button>
          ) : (
            <div className="space-y-1.5 p-1 bg-rose-500/5 border border-rose-500/10 rounded-none">
              <span className="block text-[9px] text-center text-rose-500 dark:text-rose-450 font-bold uppercase tracking-wider font-mono">BEKRÄFTA NOLLSTÄLLNING</span>
              <div className="flex space-x-1.5">
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowConfirmReset(false);
                  }}
                  className="flex-1 px-2 py-1 text-[9px] font-mono font-bold rounded-none bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                >
                  JA
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 px-2 py-1 text-[9px] font-mono font-bold rounded-none bg-slate-800 hover:bg-slate-700 text-slate-350 dark:text-zinc-400 cursor-pointer"
                >
                  NEJ
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

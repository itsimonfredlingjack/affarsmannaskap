import { useState, type JSX } from 'react';
import { Copy, Check, ChevronRight } from 'lucide-react';
import type { Question } from '../logic/questions';

interface SessionResult {
  questionId: string;
  score: number;
  rating: 'known' | 'almost' | 'again' | '';
  category: string;
}

interface SessionSummaryProps {
  results: SessionResult[];
  questions: Question[];
  masteryPercent: number;
  onRetryQuestion: (question: Question) => void;
  onNewSession: () => void;
}

export function SessionSummary({
  results,
  questions,
  masteryPercent,
  onRetryQuestion,
  onNewSession,
}: SessionSummaryProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  if (!results.length) return null as any;

  const knownCount = results.filter(r => r.rating === 'known').length;
  const almostCount = results.filter(r => r.rating === 'almost').length;
  const againCount = results.filter(r => r.rating === 'again').length;

  // Career rank title
  const getCareerTitle = (percent: number) => {
    if (percent >= 100) return "Partner 👑";
    if (percent >= 80) return "Manager 👔";
    if (percent >= 60) return "Senior Consultant";
    if (percent >= 40) return "Consultant";
    if (percent >= 20) return "Junior Associate";
    return "Intern";
  };

  const careerTitle = getCareerTitle(masteryPercent);

  const missedResults = results.filter(r => r.rating === 'again' || r.rating === 'almost');

  const shareText = `Jag slutförde precis en studiesession i Affärsmannaquizet! Kan ${knownCount} av ${results.length} frågor perfekt. Nivå: ${careerTitle}. 🚀`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sessionFeel = knownCount === results.length
    ? { emoji: '🏆', label: 'Perfekt session!', color: 'text-emerald-600 dark:text-emerald-400' }
    : knownCount >= results.length * 0.7
    ? { emoji: '🎯', label: 'Bra jobbat!', color: 'text-blue-600 dark:text-blue-400' }
    : { emoji: '💪', label: 'Fortsätt öva!', color: 'text-amber-600 dark:text-amber-400' };

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-6 space-y-4">

      {/* Score card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center">
        <p className="text-4xl mb-2">{sessionFeel.emoji}</p>
        <h2 className={`text-xl font-bold mb-1 ${sessionFeel.color}`}>{sessionFeel.label}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-500 mb-5">
          Session klar · {careerTitle}
        </p>

        {/* Result breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{knownCount}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">✅ Kan</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{almostCount}</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">🤔 Nästan</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-700">
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{againCount}</p>
            <p className="text-xs text-rose-600 dark:text-rose-500 mt-0.5">😓 Igen</p>
          </div>
        </div>

        {/* Share */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleCopy}
            type="button"
            className={`flex items-center px-3 py-2 rounded-lg text-sm border cursor-pointer transition-colors ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700'
            }`}
          >
            {copied ? <Check size={13} className="mr-1.5" /> : <Copy size={13} className="mr-1.5" />}
            {copied ? 'Kopierat!' : 'Kopiera'}
          </button>
          <button
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
            type="button"
            className="px-3 py-2 rounded-lg text-sm border bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
          >
            Dela på X
          </button>
        </div>
      </div>

      {/* Missed questions – only if any */}
      {missedResults.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-3">
            Repetera dessa ({missedResults.length} st)
          </h3>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {missedResults.map(res => {
              const q = questions.find(item => item.id === res.questionId);
              if (!q) return null;
              const isAlmost = res.rating === 'almost';
              return (
                <button
                  key={res.questionId}
                  type="button"
                  onClick={() => onRetryQuestion(q)}
                  className="flex items-center w-full p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-left hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors"
                >
                  <span className={`text-sm shrink-0 mr-2.5 ${isAlmost ? 'text-amber-500' : 'text-rose-500'}`}>
                    {isAlmost ? '🤔' : '😓'}
                  </span>
                  <span className="truncate flex-1 text-sm text-slate-700 dark:text-zinc-300">{q.question}</span>
                  <ChevronRight size={13} className="text-slate-400 shrink-0 ml-1" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* New session button */}
      <button
        onClick={onNewSession}
        type="button"
        className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
      >
        Ny session →
      </button>
    </div>
  );
}

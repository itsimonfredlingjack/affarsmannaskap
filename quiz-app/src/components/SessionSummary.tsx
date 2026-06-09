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

  // Calculate overall score
  const totalScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

  // Group by category for breakdown
  const categories: Record<string, { total: number; count: number }> = {};
  results.forEach(r => {
    if (!categories[r.category]) {
      categories[r.category] = { total: 0, count: 0 };
    }
    categories[r.category].total += r.score;
    categories[r.category].count++;
  });

  const categoryBreakdown = Object.entries(categories)
    .map(([name, data]) => ({
      name,
      avg: Math.round(data.total / data.count),
    }))
    .sort((a, b) => b.avg - a.avg);

  // Career rank title
  const getCareerTitle = (percent: number) => {
    if (percent >= 100) return "PARTNER 👑";
    if (percent >= 80) return "MANAGER 👔";
    if (percent >= 60) return "SENIOR CONSULTANT";
    if (percent >= 40) return "CONSULTANT";
    if (percent >= 20) return "JUNIOR ASSOCIATE";
    return "INTERN";
  };

  const careerTitle = getCareerTitle(masteryPercent);

  // List missed questions (score < 100)
  const missedResults = results.filter(r => r.score < 100);

  // Share message
  const shareText = `Jag slutförde precis en studiesession i Affärsmannaquizet med ${totalScore}% rätt! Min nuvarande nivå är ${careerTitle}. 🚀 Slipa ditt affärsmannaskap du också!`;

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareLinkedIn = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.open('https://www.linkedin.com/sharing/share-offsite/', '_blank');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const scoreColor = getScoreColor(totalScore);

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-4 space-y-4">
      
      {/* Overall Summary block */}
      <div className="p-5 sm:p-6 rounded-none bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-center">
        
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mb-4">
          :: SESSION_STATISTIK_ANALYS
        </h2>

        {/* Flat Monospace Score Box */}
        <div className="inline-block px-8 py-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 mb-4 font-mono text-left min-w-[200px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold">TOTAL SCORE:</span>
            <span className={`text-xl font-bold ${scoreColor}`}>{totalScore}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-900 overflow-hidden mb-2">
            <div className={`h-full ${totalScore >= 80 ? 'bg-emerald-500' : totalScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${totalScore}%` }} />
          </div>
          <div className="flex justify-between items-center text-[9px] text-zinc-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1 font-mono uppercase">
          [ {totalScore >= 80 ? 'UTMÄRKT PRESTATION' : totalScore >= 50 ? 'BRA FRAMSTEG' : 'FORTSÄTT ÖVA'} ]
        </p>
        <p className="text-[11px] text-slate-550 dark:text-zinc-400 max-w-md mx-auto leading-relaxed font-mono">
          Framsteg har uppdaterats enligt SM-2 Spaced Repetition.
        </p>

        {/* Share Section */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-zinc-850/80 max-w-md mx-auto font-mono text-[10px]">
          <span className="block text-slate-500 uppercase font-bold mb-3">
            :: DELA DINA FRAMSTEG
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={handleShareLinkedIn}
              type="button"
              className="flex items-center px-3 py-1.5 rounded-none bg-slate-50 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 border border-slate-250 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold cursor-pointer"
            >
              [ LINKEDIN ]
            </button>
            <button
              onClick={handleShareTwitter}
              type="button"
              className="flex items-center px-3 py-1.5 rounded-none bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-slate-350 border border-slate-250 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold cursor-pointer"
            >
              [ X / TWITTER ]
            </button>
            <button
              onClick={handleCopyShareText}
              type="button"
              className={`flex items-center px-3 py-1.5 rounded-none border font-bold cursor-pointer ${
                copied 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-slate-400 border border-slate-250 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {copied ? <Check size={11} className="mr-1.5" /> : <Copy size={11} className="mr-1.5" />}
              {copied ? '[ KOPIERAT! ]' : '[ KOPIERA TEXT ]'}
            </button>
          </div>
        </div>
      </div>

      {/* Category breakdown & Missed questions row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Category Breakdown Card */}
        <div className="p-4 rounded-none bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-4 font-mono">
            :: RESULTAT PER KATEGORI
          </h3>
          <div className="space-y-3 font-mono text-[11px]">
            {categoryBreakdown.map(cat => {
              let barColor = 'bg-rose-505 dark:bg-rose-500';
              if (cat.avg >= 80) barColor = 'bg-emerald-500';
              else if (cat.avg >= 50) barColor = 'bg-amber-500';

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-655 dark:text-zinc-350 capitalize font-sans">{cat.name}</span>
                    <span>{cat.avg}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 rounded-none overflow-hidden">
                    <div 
                      className={`h-full ${barColor} transition-all duration-300`}
                      style={{ width: `${cat.avg}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missed Questions Card */}
        <div className="p-4 rounded-none bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
          <h3 className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-4 font-mono">
            {missedResults.length === 0 ? ':: SYSTEM_PERFECT_RESULT' : `:: FRÅGOR ATT REPETERA (${missedResults.length})`}
          </h3>
          
          {missedResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center text-slate-450 dark:text-zinc-600 font-mono text-[11px] space-y-1.5">
              <span>[✓] 100% ACCURACY IN SESSION.</span>
              <span>Allt satt helt felfritt.</span>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 font-mono text-[10px]">
              {missedResults.map(res => {
                const q = questions.find(item => item.id === res.questionId);
                if (!q) return null;

                const isAlmost = res.score >= 40;

                return (
                  <button
                    key={res.questionId}
                    type="button"
                    onClick={() => onRetryQuestion(q)}
                    className="flex items-center w-full p-2 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 text-left text-slate-600 dark:text-zinc-400 hover:border-blue-500/50 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    <span className={`font-bold shrink-0 mr-3 ${isAlmost ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600'}`}>
                      [{res.score}%]
                    </span>
                    <span className="truncate flex-1 font-sans font-medium text-slate-700 dark:text-zinc-300">{q.question}</span>
                    <ChevronRight size={10} className="text-slate-400 dark:text-zinc-650 shrink-0 ml-1" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Control Buttons */}
      <button
        onClick={onNewSession}
        type="button"
        className="w-full flex items-center justify-center py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-mono font-bold text-xs uppercase cursor-pointer"
      >
        [ NY STUDIESESSION ]
      </button>

    </div>
  );
}

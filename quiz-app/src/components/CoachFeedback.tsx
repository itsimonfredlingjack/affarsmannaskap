import { useState, type JSX } from 'react';
import type { Question } from '../logic/questions';
import type { Assessment } from '../logic/grader';
import { SelfAssessment } from './SelfAssessment';

interface CoachFeedbackProps {
  question: Question;
  assessment: Assessment;
  selectedMCIndex: number;
  onRateAnswer: (rating: 'known' | 'almost' | 'again') => void;
  onNextQuestion: () => void;
}

export function CoachFeedback({
  question,
  assessment,
  selectedMCIndex,
  onRateAnswer,
  onNextQuestion,
}: CoachFeedbackProps): JSX.Element {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const isMC = question.type === 'mc';
  const isCorrectMC = isMC && selectedMCIndex === question.correctIndex;

  // Determine colors
  const getColors = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', bar: 'bg-emerald-500' };
    if (score >= 40) return { text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/5', bar: 'bg-amber-500' };
    return { text: 'text-rose-605 dark:text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/5', bar: 'bg-rose-500' };
  };

  const colors = getColors(assessment.score);

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-2 space-y-4">
      
      {/* Overview Block */}
      <div className="p-4 rounded-none bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
        
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-3 mb-4 gap-3">
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-0.5 text-[10px] font-bold font-mono border ${colors.border} ${colors.bg} ${colors.text}`}>
              {isMC
                ? (isCorrectMC ? 'STATUS: CORRECT' : 'STATUS: INCORRECT')
                : `GRADE: ${assessment.score}%`}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">
              COACH_BEDÖMNING_v2.0
            </span>
          </div>

          {/* Simple Monospace Match Score Bar */}
          {!isMC && (
            <div className="flex items-center space-x-2 font-mono text-[10px] text-slate-500 dark:text-zinc-400">
              <span>MATCH SCORE:</span>
              <div className="w-24 h-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden">
                <div className={`h-full ${colors.bar}`} style={{ width: `${assessment.score}%` }} />
              </div>
              <span>{assessment.score}%</span>
            </div>
          )}
        </div>

        {/* Coach Feedback Body */}
        <div className="space-y-1 mb-4">
          <p className="text-sm font-bold text-slate-900 dark:text-zinc-200">
            {isMC 
              ? (isCorrectMC ? 'Helt rätt! Bra svar.' : 'Inte helt rätt. Se förklaring.')
              : assessment.feedback.title}
          </p>
          <p className="text-xs text-slate-655 dark:text-zinc-400 leading-relaxed">
            {isMC ? question.explanation : assessment.feedback.body}
          </p>
        </div>

        {/* Concept matches */}
        {!isMC && assessment.hasRubric && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4.5 border-t border-slate-200 dark:border-zinc-800/80">
            {/* Matched */}
            <div>
              <span className="block text-[10px] font-bold text-slate-500 dark:text-zinc-500 font-mono uppercase mb-2">
                :: IDENTIFIERADE BEGREPP
              </span>
              <div className="flex flex-wrap gap-1.5">
                {assessment.matched.length > 0 ? (
                  assessment.matched.map((m, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    >
                      [✓] {m}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400 dark:text-zinc-650 font-mono italic">
                    [Inga begrepp matchade]
                  </span>
                )}
              </div>
            </div>

            {/* Missing */}
            <div>
              <span className="block text-[10px] font-bold text-slate-500 dark:text-zinc-500 font-mono uppercase mb-2">
                :: SAKNADE NYCKELDELAR
              </span>
              <div className="flex flex-wrap gap-1.5">
                {assessment.missing.length > 0 ? (
                  assessment.missing.map((m, idx) => (
                    <span 
                      key={idx} 
                      className={`px-2 py-0.5 text-[10px] font-mono ${
                        assessment.verdict === 'correct'
                          ? 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                          : 'bg-rose-500/5 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      [!] {m}
                    </span>
                  ))
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-900 text-zinc-500 border border-zinc-850">
                    [✓] Inga saknade delar
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Misconception Warn */}
        {assessment.confusedWith && (
          <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-mono">
            <span className="font-bold block mb-1">
              [!] OBS: MÖJLIG BEGREPPSFÖRVÄXLING
            </span>
            <span>{assessment.feedback.contrast}</span>
          </div>
        )}

        {/* Official answer collapse */}
        <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-zinc-800/80">
          <button
            type="button"
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="w-full flex items-center justify-between text-[10px] font-bold text-slate-550 dark:text-zinc-450 font-mono uppercase hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <span>{isDetailsOpen ? '[-] DÖLJ FACIT & RESURSER' : '[+] VISA FACIT & RESURSER'}</span>
          </button>

          {isDetailsOpen && (
            <div className="mt-3 space-y-3 font-mono text-xs text-slate-600 dark:text-zinc-400">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800">
                <span className="block text-[9px] text-slate-400 dark:text-zinc-550 uppercase mb-1">FACIT_SVAR</span>
                <p className="text-slate-800 dark:text-zinc-300 font-sans text-xs font-semibold leading-relaxed">
                  {question.answer}
                </p>
              </div>

              {question.why && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800/60 font-sans">
                  <span className="block text-[9px] text-slate-400 dark:text-zinc-550 uppercase font-mono mb-1 font-bold">VARFÖR DETTA ÄR VIKTIGT</span>
                  <p className="text-slate-650 dark:text-zinc-400 leading-relaxed text-xs">
                    {question.why}
                  </p>
                  {assessment.memoryRule && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-zinc-800/50 text-xs text-blue-600 dark:text-blue-400 italic font-mono">
                      KOM IHÅG: {assessment.memoryRule}
                    </div>
                  )}
                </div>
              )}

              {question.example && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800/60 font-sans">
                  <span className="block text-[9px] text-slate-400 dark:text-zinc-550 uppercase font-mono mb-1 font-bold">VERKLIGT EXEMPEL</span>
                  <p className="text-slate-650 dark:text-zinc-400 leading-relaxed text-xs">
                    {question.example}
                  </p>
                </div>
              )}

              {question.related && question.related.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[10px] text-slate-500 dark:text-zinc-550 font-mono">
                  <span>RELATERAT:</span>
                  {question.related.map(r => (
                    <span key={r} className="px-1.5 py-0.2 bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-250 dark:border-zinc-800">
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Spaced Repetition SR buttons */}
      <SelfAssessment
        onRateAnswer={onRateAnswer}
        suggestedRating={assessment.suggestedRating}
      />

      {/* Next Step / Gå vidare */}
      <button
        type="button"
        onClick={onNextQuestion}
        className="w-full flex items-center justify-center py-3 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-850 border border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-300 font-mono text-xs font-bold cursor-pointer"
      >
        GÅ VIDARE MED REKOMMENDATION ({assessment.verdict === 'correct' ? 'KAN' : assessment.verdict === 'almost' || assessment.verdict === 'too_vague' ? 'NÄSTAN' : 'IGEN'})
      </button>

    </div>
  );
}

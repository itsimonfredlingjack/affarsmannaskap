import { useState, useEffect, useRef, type JSX } from 'react';
import type { Question } from '../logic/questions';
import type { Assessment } from '../logic/grader';
import { AnswerOptions } from './AnswerOptions';

interface QuestionCardProps {
  question: Question;
  answerInput: string;
  setAnswerInput: (val: string) => void;
  selectedMCIndex: number;
  setSelectedMCIndex: (val: number) => void;
  isRevealed: boolean;
  onRevealAnswer: () => void;
  onSkip: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
  assessment?: Assessment;
  onRateAnswer?: (rating: 'known' | 'almost' | 'again') => void;
}

export function QuestionCard({
  question,
  answerInput,
  setAnswerInput,
  selectedMCIndex,
  setSelectedMCIndex,
  isRevealed,
  onRevealAnswer,
  onSkip,
  currentQuestionIndex,
  totalQuestions,
  assessment,
  onRateAnswer,
}: QuestionCardProps): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Auto-focus textarea on open questions when question changes
  useEffect(() => {
    if (question.type === 'open' && textareaRef.current && !isRevealed) {
      textareaRef.current.focus();
    }
  }, [question.id, isRevealed, question.type]);

  // Reset details collapse on question change
  useEffect(() => {
    setShowDetails(false);
  }, [question.id]);

  // Keyboard shortcut: Ctrl + Enter / Cmd + Enter to reveal answer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!isRevealed && (question.type === 'open' ? answerInput.trim().length > 0 : selectedMCIndex !== -1)) {
          e.preventDefault();
          onRevealAnswer();
        }
      }

      // MC options shortcuts (1, 2, 3, 4...)
      if (question.type === 'mc' && !isRevealed && !isNaN(Number(e.key))) {
        const optionIndex = Number(e.key) - 1;
        if (question.options && optionIndex >= 0 && optionIndex < question.options.length) {
          e.preventDefault();
          setSelectedMCIndex(optionIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [question, answerInput, selectedMCIndex, isRevealed, onRevealAnswer, setSelectedMCIndex]);

  const isSubmitDisabled = question.type === 'open'
    ? answerInput.trim().length === 0
    : selectedMCIndex === -1;

  const isMC = question.type === 'mc';
  const isCorrectMC = isMC && selectedMCIndex === question.correctIndex;

  // Verdict for open questions
  const getVerdict = () => {
    if (!assessment) return null;
    if (isMC) return isCorrectMC ? 'correct' : 'wrong';
    return assessment.verdict;
  };
  const verdict = getVerdict();

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500 dark:text-zinc-500">
          Fråga {currentQuestionIndex} av {totalQuestions}
        </span>
        {isRevealed && verdict && (
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            verdict === 'correct'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
              : verdict === 'partial'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
          }`}>
            {verdict === 'correct' ? '✓ Rätt' : verdict === 'partial' ? '≈ Nästan' : isMC ? '✗ Fel' : 'Jämför med facit'}
          </span>
        )}
      </div>

      {/* Main Card */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">

        {/* Question */}
        <div className="px-6 pt-6 pb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100 leading-snug">
            {question.question}
          </h2>
        </div>

        {/* Input or Revealed content */}
        <div className="px-6 pb-6 space-y-5">
          {!isRevealed ? (
            /* PRE-REVEAL: Answer input */
            <div>
              {question.type === 'open' ? (
                <div>
                  <textarea
                    id="answer-input"
                    ref={textareaRef}
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Skriv ditt svar här..."
                    rows={4}
                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-base leading-relaxed resize-none transition-all"
                  />
                  <p className="mt-2 text-xs text-slate-400 dark:text-zinc-600 text-right">
                    ⌘ Enter för att visa facit
                  </p>
                </div>
              ) : (
                <AnswerOptions
                  options={question.options || []}
                  selectedIndex={selectedMCIndex}
                  onSelect={setSelectedMCIndex}
                  isRevealed={false}
                />
              )}
            </div>
          ) : (
            /* POST-REVEAL: Show answer comparison */
            <div className="space-y-5">

              {isMC ? (
                /* MC Revealed */
                <div className="space-y-4">
                  <AnswerOptions
                    options={question.options || []}
                    selectedIndex={selectedMCIndex}
                    onSelect={setSelectedMCIndex}
                    isRevealed={true}
                    correctIndex={question.correctIndex}
                  />
                  {question.explanation && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                      <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400 mb-1">Förklaring</p>
                      <p className="text-base text-slate-800 dark:text-zinc-200 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Open question: your answer + facit */
                <div className="space-y-4">
                  {/* Your answer */}
                  {answerInput.trim() && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                      <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wide mb-2">Ditt svar</p>
                      <p className="text-base text-slate-700 dark:text-zinc-300 leading-relaxed italic">
                        {answerInput}
                      </p>
                    </div>
                  )}

                  {/* FACIT – prominent */}
                  <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-400 dark:border-emerald-600">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2">
                      ✓ Facit – Rätt svar
                    </p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 leading-relaxed">
                      {question.answer}
                    </p>
                  </div>

                  {/* Optional details toggle */}
                  {(question.why || question.example || assessment?.memoryRule) && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {showDetails ? '▲ Dölj detaljer' : '▼ Visa fördjupning'}
                      </button>

                      {showDetails && (
                        <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-zinc-400">
                          {question.why && (
                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                              <p className="font-semibold text-slate-700 dark:text-zinc-300 mb-1">Varför viktigt?</p>
                              <p className="leading-relaxed">{question.why}</p>
                              {assessment?.memoryRule && (
                                <p className="mt-2 text-blue-600 dark:text-blue-400 italic">
                                  Kom ihåg: {assessment.memoryRule}
                                </p>
                              )}
                            </div>
                          )}
                          {question.example && (
                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                              <p className="font-semibold text-slate-700 dark:text-zinc-300 mb-1">Verkligt exempel</p>
                              <p className="leading-relaxed">{question.example}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Rating buttons */}
              {onRateAnswer && (
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <p className="text-sm text-slate-500 dark:text-zinc-500 mb-3 text-center">
                    Hur gick det?
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => onRateAnswer('again')}
                      className={`py-4 px-3 rounded-xl border-2 text-center cursor-pointer transition-all font-semibold text-sm ${
                        assessment?.suggestedRating === 'again'
                          ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-500 text-rose-700 dark:text-rose-400 ring-2 ring-rose-300 dark:ring-rose-700'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600 dark:hover:text-rose-400'
                      }`}
                    >
                      <span className="block text-lg mb-1">😓</span>
                      <span>Igen</span>
                      <span className="block text-xs text-current opacity-60 mt-0.5 font-normal">Tangent 3</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRateAnswer('almost')}
                      className={`py-4 px-3 rounded-xl border-2 text-center cursor-pointer transition-all font-semibold text-sm ${
                        assessment?.suggestedRating === 'almost'
                          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-500 text-amber-700 dark:text-amber-400 ring-2 ring-amber-300 dark:ring-amber-700'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                    >
                      <span className="block text-lg mb-1">🤔</span>
                      <span>Nästan</span>
                      <span className="block text-xs text-current opacity-60 mt-0.5 font-normal">Tangent 2</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRateAnswer('known')}
                      className={`py-4 px-3 rounded-xl border-2 text-center cursor-pointer transition-all font-semibold text-sm ${
                        assessment?.suggestedRating === 'known'
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-300 dark:ring-emerald-700'
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                    >
                      <span className="block text-lg mb-1">✅</span>
                      <span>Kan</span>
                      <span className="block text-xs text-current opacity-60 mt-0.5 font-normal">Tangent 1</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit button (pre-reveal only) */}
        {!isRevealed && (
          <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onRevealAnswer}
              disabled={isSubmitDisabled}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-base transition-all cursor-pointer ${
                isSubmitDisabled
                  ? 'bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {question.type === 'open' ? 'Visa facit' : 'Svara'}
            </button>

            <button
              type="button"
              onClick={onSkip}
              className="py-4 px-6 rounded-xl bg-transparent border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:border-slate-400 dark:hover:border-zinc-500 text-base font-medium transition-all cursor-pointer"
            >
              Hoppa över
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

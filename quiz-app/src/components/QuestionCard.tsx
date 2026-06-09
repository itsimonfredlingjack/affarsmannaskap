import { useEffect, useRef, type JSX } from 'react';
import type { Question } from '../logic/questions';
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
}: QuestionCardProps): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea on open questions when question changes
  useEffect(() => {
    if (question.type === 'open' && textareaRef.current && !isRevealed) {
      textareaRef.current.focus();
    }
  }, [question.id, isRevealed, question.type]);

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

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-4">
      <div className="p-4 sm:p-6 rounded-none bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 relative">
        
        {/* Card Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 mb-4 font-mono text-[10px]">
          <div className="flex items-center space-x-2.5">
            {/* Minimalist Question Index Tag */}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              [Q{String(currentQuestionIndex).padStart(2, '0')} / Q{String(totalQuestions).padStart(2, '0')}]
            </span>
            <span className="text-slate-400 dark:text-zinc-550 uppercase">
              :: {question.type === 'open' ? 'ÖPPEN FRÅGA' : 'FLERVALSFRÅGA'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {question.tags.map(tag => (
              <span 
                key={tag} 
                className="px-1.5 py-0.2 bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 border border-slate-250 dark:border-zinc-850"
              >
                {tag.toUpperCase()}
              </span>
            ))}
            <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-500 border border-slate-250 dark:border-zinc-850">
              {question.source.toUpperCase()}
            </span>
          </div>
        </header>

        {/* Question Title */}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 mb-5 leading-snug">
          {question.question}
        </h2>

        {/* Dynamic Input Section */}
        <div>
          {!isRevealed ? (
            <div className="mb-4">
              {question.type === 'open' ? (
                <div className="relative">
                  <label className="sr-only" htmlFor="answer-input">Ditt svar</label>
                  <textarea
                    id="answer-input"
                    ref={textareaRef}
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Skriv ditt svar med egna ord här..."
                    rows={4}
                    className="w-full p-3.5 rounded-none bg-slate-50 dark:bg-zinc-950 border border-slate-250 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-650 focus:outline-none focus:border-blue-500 focus:ring-0 text-sm leading-relaxed resize-none transition-all font-mono"
                  />
                  <div className="absolute right-3.5 bottom-3.5 text-[9px] text-slate-400 dark:text-zinc-650 font-semibold font-mono hidden sm:flex items-center">
                    <span>SKICKA: </span>
                    <span className="ml-1 px-1 py-0.2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">⌘ ENTER</span>
                  </div>
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
            /* Locked State Preview */
            <div className="mb-4">
              {question.type === 'open' ? (
                <div className="p-3.5 rounded-none bg-slate-50 dark:bg-zinc-900/20 border border-slate-200 dark:border-zinc-800/80 text-sm font-mono text-zinc-400">
                  <span className="block text-[9px] text-slate-400 dark:text-zinc-600 uppercase font-bold mb-1.5">
                    DITT AVGIVNA SVAR
                  </span>
                  <p className="whitespace-pre-wrap italic leading-relaxed text-slate-700 dark:text-zinc-300 font-sans text-xs">
                    "{answerInput}"
                  </p>
                </div>
              ) : (
                <AnswerOptions
                  options={question.options || []}
                  selectedIndex={selectedMCIndex}
                  onSelect={setSelectedMCIndex}
                  isRevealed={true}
                  correctIndex={question.correctIndex}
                />
              )}
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        {!isRevealed && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
            <button
              type="button"
              onClick={onRevealAnswer}
              disabled={isSubmitDisabled}
              className={`flex-1 flex items-center justify-center py-3 px-6 rounded-none font-bold text-xs tracking-wide transition-all cursor-pointer font-mono ${
                isSubmitDisabled
                  ? 'bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-700 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white border border-blue-500'
              }`}
            >
              {question.type === 'open' ? 'JÄMFÖR & VISA FACIT' : 'SVARA'}
              <span className="ml-1.5 opacity-60">↵</span>
            </button>
            
            <button
              type="button"
              onClick={onSkip}
              className="py-3 px-6 rounded-none bg-transparent border border-slate-250 dark:border-zinc-800 text-slate-550 dark:text-zinc-400 hover:border-slate-450 dark:hover:border-zinc-700 hover:text-slate-800 dark:hover:text-zinc-200 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              [ HOPPA ÖVER ]
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

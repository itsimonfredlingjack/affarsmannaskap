import { useState, useEffect, useRef, type JSX } from 'react';
import { Check, Minus, RotateCcw } from 'lucide-react';
import type { Question, TentaQuestion } from '../logic/questions';
import type { Assessment } from '../logic/grader';
import { AnswerOptions } from './AnswerOptions';
import { FacitContent } from './FacitContent';
import { QuestionPrompt } from './QuestionPrompt';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Panel } from './ui/Panel';

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
  const [detailsState, setDetailsState] = useState({ questionId: question.id, show: false });
  const showDetails = detailsState.questionId === question.id ? detailsState.show : false;
  const setShowDetails = (show: boolean) => {
    setDetailsState({ questionId: question.id, show });
  };
  const [facitExpanded, setFacitExpanded] = useState({ questionId: question.id, show: false });
  const showFullFacit = facitExpanded.questionId === question.id ? facitExpanded.show : false;
  const tentaSummary = question.mode === 'tenta' ? (question as TentaQuestion).answerSummary : undefined;

  useEffect(() => {
    if (question.type === 'open' && textareaRef.current && !isRevealed) {
      textareaRef.current.focus();
    }
  }, [question.id, isRevealed, question.type]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!isRevealed && (question.type === 'open' ? answerInput.trim().length > 0 : selectedMCIndex !== -1)) {
          e.preventDefault();
          onRevealAnswer();
        }
      }

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
  const isTermCard = question.mode === 'begrepp' || question.mode === 'samband';
  const isTentaCard = question.mode === 'tenta';
  const isTentaprioCard = question.mode === 'tentaprio';
  const isExamStyleCard = isTentaCard || isTentaprioCard;
  const facitTitle = isTentaprioCard
    ? 'Facit — Kort sammanfattning'
    : isTentaCard
    ? 'Facit — Tentasvar'
    : isTermCard && !isMC
    ? 'Facit — Definition'
    : 'Facit — Modellssvar';
  const isCorrectMC = isMC && selectedMCIndex === question.correctIndex;

  const getVerdict = () => {
    if (!assessment) return null;
    if (isMC) return isCorrectMC ? 'correct' : 'wrong';
    return assessment.verdict;
  };
  const verdict = getVerdict();
  const isAlmostVerdict = verdict === 'almost' || verdict === 'too_vague';
  const coachMissing = assessment?.missing
    .filter(item => item && item !== 'Inga centrala delar saknas.')
    .slice(0, 3) ?? [];

  const verdictBadge = verdict && (
    <Badge
      variant={verdict === 'correct' ? 'success' : isAlmostVerdict ? 'warning' : verdict === 'uncertain' ? 'muted' : 'danger'}
      className="text-sm font-semibold px-3 py-1"
    >
      {verdict === 'correct' ? '✓ Rätt' : isAlmostVerdict ? '≈ Nästan' : verdict === 'uncertain' ? 'Bedöm själv' : isMC ? '✗ Fel' : 'Jämför med facit'}
    </Badge>
  );

  const coachTone: 'success' | 'warning' | 'danger' = verdict === 'correct'
    ? 'success'
    : isAlmostVerdict
    ? 'warning'
    : 'danger';

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-4 card-enter" key={question.id}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-text-muted">
          Fråga {currentQuestionIndex} av {totalQuestions}
        </span>
        {isRevealed && verdictBadge}
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-5 sm:p-6">
          <QuestionPrompt question={question} />
        </div>

        <div className="px-5 sm:px-6 pb-6 space-y-5">
          {!isRevealed ? (
            <div>
              {question.type === 'open' ? (
                <div>
                  <label htmlFor="answer-input" className="block text-sm font-semibold text-text-secondary mb-2">
                    Ditt resonemang
                  </label>
                  <textarea
                    id="answer-input"
                    ref={textareaRef}
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Skriv ditt svar här..."
                    rows={7}
                    className="w-full p-4 rounded-xl bg-surface border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-[17px] leading-relaxed resize-none transition-all min-h-[180px]"
                  />
                  <p className="mt-2 text-xs text-text-muted text-right">
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
            <div className="space-y-5">
              {isMC ? (
                <div className="space-y-4">
                  <AnswerOptions
                    options={question.options || []}
                    selectedIndex={selectedMCIndex}
                    onSelect={setSelectedMCIndex}
                    isRevealed={true}
                    correctIndex={question.correctIndex}
                  />
                  {question.explanation && (
                    <Panel title="Förklaring" tone="default">
                      <p className="text-base text-text-secondary leading-relaxed">
                        {question.explanation}
                      </p>
                    </Panel>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {!isExamStyleCard && answerInput.trim() && (
                    <Panel title="Ditt svar" tone="default">
                      <p className="text-base text-text-secondary leading-relaxed italic">
                        {answerInput}
                      </p>
                    </Panel>
                  )}

                  {assessment && !isMC && !isExamStyleCard && (
                    <Panel title="Coachens bedömning" tone={coachTone}>
                      <p className="text-base font-semibold leading-relaxed">
                        {assessment.feedback.title}
                      </p>
                      {assessment.feedback.body && (
                        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                          {assessment.feedback.body}
                        </p>
                      )}
                      {assessment.confusedWith && (
                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                          <span className="font-semibold text-text-primary">Tentarisk:</span>{' '}
                          {assessment.confusedWith.label}. {assessment.confusedWith.explanation}
                        </p>
                      )}
                      {coachMissing.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-2">
                            Fyll på
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {coachMissing.map(item => (
                              <Badge key={item} variant="muted">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </Panel>
                  )}

                  <Panel title={facitTitle} tone="success" accentBar>
                    {isTentaprioCard && question.answer ? (
                      <div>
                        <p className="text-lg leading-relaxed text-text-primary font-medium">
                          <FacitContent text={question.answer} />
                        </p>
                        {question.why && (
                          <>
                            <button
                              type="button"
                              onClick={() => setFacitExpanded({ questionId: question.id, show: !showFullFacit })}
                              className="mt-3 text-sm text-accent hover:underline cursor-pointer"
                            >
                              {showFullFacit ? '▲ Dölj fördjupning & exempel' : '▼ Visa fördjupning & exempel'}
                            </button>
                            {showFullFacit && (
                              <div className="mt-4 pt-4 border-t border-success/20">
                                <FacitContent text={question.why} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : isTentaCard && question.answer ? (
                      tentaSummary ? (
                        <div>
                          <p className="text-lg leading-relaxed text-text-primary font-medium">
                            <FacitContent text={tentaSummary} />
                          </p>
                          <button
                            type="button"
                            onClick={() => setFacitExpanded({ questionId: question.id, show: !showFullFacit })}
                            className="mt-3 text-sm text-accent hover:underline cursor-pointer"
                          >
                            {showFullFacit ? '▲ Dölj fullständigt svar' : '▼ Visa fullständigt svar'}
                          </button>
                          {showFullFacit && (
                            <div className="mt-4 pt-4 border-t border-success/20">
                              <FacitContent text={question.answer} skipFirstBlock />
                            </div>
                          )}
                        </div>
                      ) : (
                        <FacitContent text={question.answer} />
                      )
                    ) : (
                      <p className="font-serif text-lg leading-relaxed text-text-primary">
                        {question.answer}
                      </p>
                    )}
                  </Panel>

                  {isExamStyleCard && answerInput.trim() && (
                    <Panel title="Ditt svar" tone="default">
                      <p className="text-base text-text-secondary leading-relaxed italic">
                        {answerInput}
                      </p>
                    </Panel>
                  )}

                  {!isTentaprioCard && (question.why || question.example || question.hint || assessment?.memoryRule) && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-sm text-accent hover:underline cursor-pointer"
                      >
                        {showDetails
                          ? '▲ Dölj detaljer'
                          : question.hint && !question.why && !question.example
                          ? '▼ Visa tips'
                          : '▼ Visa fördjupning'}
                      </button>

                      {showDetails && (
                        <div className="mt-3 space-y-3">
                          {question.why && (
                            <Panel title="Varför viktigt?" tone="default">
                              <p className="text-sm leading-relaxed text-text-secondary">{question.why}</p>
                              {assessment?.memoryRule && (
                                <p className="mt-2 text-sm text-accent italic">
                                  Kom ihåg: {assessment.memoryRule}
                                </p>
                              )}
                            </Panel>
                          )}
                          {question.example && (
                            <Panel title="Exempel" tone="default">
                              <p className="text-sm leading-relaxed text-text-secondary">{question.example}</p>
                            </Panel>
                          )}
                          {question.hint && (
                            <Panel title="Tips / kursnotering" tone="default">
                              <p className="text-sm leading-relaxed text-text-secondary">{question.hint}</p>
                            </Panel>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {onRateAnswer && (
                <div className="pt-4 border-t border-border-subtle">
                  <p className="text-sm text-text-muted mb-3 text-center">
                    Hur gick det?
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { rating: 'again' as const, icon: RotateCcw, label: 'Igen', key: '3', tone: 'danger' as const },
                      { rating: 'almost' as const, icon: Minus, label: 'Nästan', key: '2', tone: 'warning' as const },
                      { rating: 'known' as const, icon: Check, label: 'Kan', key: '1', tone: 'success' as const },
                    ]).map(({ rating, icon: Icon, label, key, tone }) => {
                      const isSuggested = assessment?.suggestedRating === rating;
                      return (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => onRateAnswer(rating)}
                          className={[
                            'py-4 px-3 rounded-xl border-2 text-center cursor-pointer transition-all font-semibold text-sm',
                            isSuggested
                              ? tone === 'success'
                                ? 'bg-success-muted/30 border-success text-success ring-2 ring-success/30'
                                : tone === 'warning'
                                ? 'bg-warning-muted/30 border-warning text-warning ring-2 ring-warning/30'
                                : 'bg-danger-muted/30 border-danger text-danger ring-2 ring-danger/30'
                              : 'bg-panel border-border text-text-secondary hover:border-accent/40 hover:bg-accent-subtle',
                          ].join(' ')}
                        >
                          <Icon size={20} className="mx-auto mb-2 opacity-80" />
                          <span>{label}</span>
                          <span className="block text-xs opacity-60 mt-0.5 font-normal">Tangent {key}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!isRevealed && (
          <div className="px-5 sm:px-6 pb-6 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onRevealAnswer}
              disabled={isSubmitDisabled}
              size="lg"
              fullWidth
              className="flex-1"
            >
              {question.type === 'open' ? 'Visa facit' : 'Svara'}
            </Button>
            <Button onClick={onSkip} variant="secondary" size="lg">
              Hoppa över
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
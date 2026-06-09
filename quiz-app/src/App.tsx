import { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Volume2, VolumeX, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

// Logic & Data
import { FOKUS_QUESTIONS, type Question } from './logic/questions';
import { FOKUS_RUBRICS } from './logic/rubrics';
import { gradeAnswer } from './logic/grader';
import { calculateSM2, isDue, type CardProgress } from './logic/sm2';
import { soundEngine } from './logic/sound';

// Components
import { Sidebar } from './components/Sidebar';
import { HeroLanding } from './components/HeroLanding';
import { QuestionCard } from './components/QuestionCard';
import { SessionSummary } from './components/SessionSummary';
import { ProgressBar } from './components/ProgressBar';

// Hooks
import { useLocalStorage } from './hooks/useLocalStorage';

interface SessionResult {
  questionId: string;
  score: number;
  rating: 'known' | 'almost' | 'again' | '';
  category: string;
}

interface SessionState {
  active: boolean;
  targetCount: number | 'all';
  questionsAnswered: number;
  queue: Question[];
  currentIndex: number;
  results: SessionResult[];
}

export default function App() {
  // Persistence States
  const [cardProgresses, setCardProgresses] = useLocalStorage<Record<string, CardProgress>>('fokusbladet-progress-v2', {});
  const [streak, setStreak] = useLocalStorage<number>('fokusbladet-streak', 0);
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('fokusbladet-sound', true);
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage<boolean>('fokusbladet-theme-dark', true);

  // App Navigation States
  const [mode, setMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Active Question Card State
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [selectedMCIndex, setSelectedMCIndex] = useState<number>(-1);

  // Layout States
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [shakeCard, setShakeCard] = useState<boolean>(false);

  // Session State
  const [session, setSession] = useState<SessionState>({
    active: false,
    targetCount: 20,
    questionsAnswered: 0,
    queue: [],
    currentIndex: 0,
    results: [],
  });

  // Sync sound engine toggle
  useEffect(() => {
    soundEngine.enabled = soundEnabled;
  }, [soundEnabled]);

  // Sync HTML class for dark theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkTheme) {
      root.classList.add('dark');
      root.style.backgroundColor = '#0A0A0C';
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#F3F4F6';
    }
  }, [isDarkTheme]);

  // List of questions based on active mode
  const studyQuestions = FOKUS_QUESTIONS.filter(q => q.mode !== 'repetition');

  const getFilteredList = () => {
    let list = studyQuestions;

    if (mode === 'begrepp') {
      list = studyQuestions.filter(q => q.mode === 'begrepp');
    } else if (mode === 'samband') {
      list = studyQuestions.filter(q => q.mode === 'samband');
    } else if (mode === 'case') {
      list = studyQuestions.filter(q => q.mode === 'case');
    } else if (mode === 'repetition') {
      list = studyQuestions.filter(q => {
        const rating = cardProgresses[q.id]?.rating;
        return rating === 'again' || rating === 'almost';
      });
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      list = list.filter(item => 
        item.question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    return list;
  };

  const filteredQuestions = getFilteredList();

  // Get active question
  const getActiveQuestion = (): Question | null => {
    if (session.active) {
      if (session.currentIndex >= 0 && session.currentIndex < session.queue.length) {
        return session.queue[session.currentIndex];
      }
      return null;
    }
    
    if (filteredQuestions.length > 0 && currentIndex >= 0 && currentIndex < filteredQuestions.length) {
      return filteredQuestions[currentIndex];
    }
    return null;
  };

  const currentQuestion = getActiveQuestion();

  // Get due count for spaced repetition
  const getDueCount = () => {
    return studyQuestions.filter(q => {
      const progress = cardProgresses[q.id];
      if (!progress || !progress.nextReview) return true; // Unseen is due
      return isDue(progress);
    }).length;
  };

  const dueCount = getDueCount();

  // Mastered stats
  const getMasteryStats = () => {
    const totalCount = studyQuestions.length;
    const mastered = studyQuestions.filter(q => {
      const progress = cardProgresses[q.id];
      return progress?.rating === 'known' && progress.repetitions >= 2;
    }).length;
    const percent = totalCount ? Math.min(100, Math.round((mastered / totalCount) * 100)) : 0;
    return { masteredCount: mastered, totalCount, masteryPercent: percent };
  };

  const { masteredCount, totalCount, masteryPercent } = getMasteryStats();

  // Spaced Repetition Queue Creator
  const getSmartQueue = (size: number | 'all') => {
    const due: Question[] = [];
    const unseen: Question[] = [];
    const future: Question[] = [];
    const modeList = filteredQuestions.length > 0 ? filteredQuestions : studyQuestions;

    modeList.forEach(q => {
      const p = cardProgresses[q.id];
      if (!p || !p.nextReview) {
        unseen.push(q);
      } else if (isDue(p)) {
        due.push(q);
      } else {
        future.push(q);
      }
    });

    // Sort future by soonest review
    future.sort((a, b) => {
      const da = new Date(cardProgresses[a.id]?.nextReview || 0).getTime();
      const db = new Date(cardProgresses[b.id]?.nextReview || 0).getTime();
      return da - db;
    });

    const combined = [...due, ...unseen, ...future];
    return size === 'all' ? combined : combined.slice(0, size);
  };

  // Start studiesession
  const handleStartSession = (size: number | 'all') => {
    const queue = getSmartQueue(size);
    if (!queue.length) return;

    setSession({
      active: true,
      targetCount: size,
      questionsAnswered: 0,
      queue,
      currentIndex: 0,
      results: [],
    });
    
    // Reset question card state
    setIsRevealed(false);
    setAnswerInput('');
    setSelectedMCIndex(-1);
  };

  // Exit/reset session and show summary
  const showSessionSummary = (results: SessionResult[]) => {
    setSession(prev => ({
      ...prev,
      active: false,
      results,
    }));
  };

  // Skip / next question
  const handleNextQuestion = () => {
    const currentQ = currentQuestion;
    if (!currentQ) return;

    // If skip/next is clicked in revealed state, auto-commit the suggested rating
    if (isRevealed) {
      const defaultRating = isMC
        ? (selectedMCIndex === currentQ.correctIndex ? 'known' as const : 'again' as const)
        : (gradeAnswer(currentQ, answerInput, FOKUS_RUBRICS[currentQ.id]).suggestedRating || 'again' as const);

      handleRateAnswer(defaultRating);
      return;
    }

    // Otherwise, just skip to next without rating (only allowed if not revealed)
    advanceQueue();
  };

  const advanceQueue = () => {
    if (session.active) {
      if (session.questionsAnswered >= (session.targetCount === 'all' ? session.queue.length : session.targetCount)) {
        showSessionSummary(session.results);
        return;
      }
      
      const nextIndex = session.currentIndex + 1;
      if (nextIndex >= session.queue.length) {
        showSessionSummary(session.results);
      } else {
        setSession(prev => ({ ...prev, currentIndex: nextIndex }));
        resetQuestionState();
      }
    } else {
      if (filteredQuestions.length > 0) {
        setCurrentIndex(prev => (prev + 1) % filteredQuestions.length);
      }
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setIsRevealed(false);
    setAnswerInput('');
    setSelectedMCIndex(-1);
  };

  const isMC = currentQuestion?.type === 'mc';

  // Reveal answer
  const handleRevealAnswer = () => {
    if (!currentQuestion) return;
    setIsRevealed(true);
  };

  // Rate answer (Known, Almost, Again)
  const handleRateAnswer = (rating: 'known' | 'almost' | 'again') => {
    const currentQ = currentQuestion;
    if (!currentQ) return;

    // Calculate score
    let score = 0;
    if (currentQ.type === 'mc') {
      score = selectedMCIndex === currentQ.correctIndex ? 100 : 0;
    } else {
      const assessment = gradeAnswer(currentQ, answerInput, FOKUS_RUBRICS[currentQ.id]);
      if (assessment.verdict === 'uncertain') {
        const scores = { known: 100, almost: 60, again: 0 };
        score = scores[rating];
      } else {
        score = assessment.scoreInternal;
      }
    }

    // SM-2 Schedule
    const prevProgress = cardProgresses[currentQ.id] || {};
    const sm2 = calculateSM2(prevProgress, rating);

    const updatedProgresses = {
      ...cardProgresses,
      [currentQ.id]: {
        rating,
        answeredAt: new Date().toISOString(),
        score,
        ...sm2,
        history: [...(prevProgress.history || []), { rating, date: new Date().toISOString(), score }],
      },
    };

    setCardProgresses(updatedProgresses);

    // Streak & Juice
    if (rating === 'known') {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      
      // Play Sound + Confetti
      if (nextStreak > 0 && nextStreak % 3 === 0) {
        soundEngine.playMilestone();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.75 } });
      } else {
        soundEngine.playCorrect();
      }
    } else {
      setStreak(0);
      if (rating === 'again') {
        soundEngine.playWrong();
        // Trigger card shake
        setShakeCard(true);
        setTimeout(() => setShakeCard(false), 500);
      } else {
        soundEngine.playPop();
      }
    }

    // Session tracking
    if (session.active) {
      const updatedResults = [
        ...session.results,
        { questionId: currentQ.id, score, rating, category: currentQ.category }
      ];

      const nextAnsweredCount = session.questionsAnswered + 1;
      const target = session.targetCount === 'all' ? session.queue.length : session.targetCount;

      if (nextAnsweredCount >= target || session.currentIndex + 1 >= session.queue.length) {
        // Complete session
        setSession(prev => ({
          ...prev,
          active: false,
          questionsAnswered: nextAnsweredCount,
          results: updatedResults,
        }));
      } else {
        setSession(prev => ({
          ...prev,
          questionsAnswered: nextAnsweredCount,
          currentIndex: prev.currentIndex + 1,
          results: updatedResults,
        }));
        resetQuestionState();
      }
    } else {
      // Direct study mode: advance
      advanceQueue();
    }
  };

  // Keyboard shortcut: Rate with 1, 2, 3 when revealed
  useEffect(() => {
    if (!isRevealed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is focused on an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === '1') {
        e.preventDefault();
        handleRateAnswer('known');
      } else if (e.key === '2') {
        e.preventDefault();
        handleRateAnswer('almost');
      } else if (e.key === '3') {
        e.preventDefault();
        handleRateAnswer('again');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRevealed, handleRateAnswer]);

  // Jump to specific question (sidebar click)
  const handleSelectQuestion = (q: Question) => {
    if (session.active) {
      // Exits session when clicking sidebar items
      setSession(prev => ({ ...prev, active: false }));
    }
    
    // Find index in filtered list
    const idx = filteredQuestions.findIndex(item => item.id === q.id);
    if (idx !== -1) {
      setCurrentIndex(idx);
      resetQuestionState();
    }
  };

  // Reset entire card progresses
  const handleResetProgress = () => {
    setCardProgresses({});
    setStreak(0);
    setCurrentIndex(0);
    resetQuestionState();
    setSession({
      active: false,
      targetCount: 20,
      questionsAnswered: 0,
      queue: [],
      currentIndex: 0,
      results: [],
    });
  };

  // Retry missed question from summary
  const handleRetryQuestion = (q: Question) => {
    // Starts a 1-question mini session
    setSession({
      active: true,
      targetCount: 1,
      questionsAnswered: 0,
      queue: [q],
      currentIndex: 0,
      results: [],
    });
    resetQuestionState();
  };

  const handleNewSession = () => {
    setSession({
      active: false,
      targetCount: 20,
      questionsAnswered: 0,
      queue: [],
      currentIndex: 0,
      results: [],
    });
    resetQuestionState();
  };

  // Calculate session percentage
  const sessionTarget = session.targetCount === 'all' ? session.queue.length : (session.targetCount || 20);
  const sessionProgressPercent = session.active 
    ? Math.round((session.questionsAnswered / sessionTarget) * 100) 
    : 0;

  return (
    <div className={`min-h-screen flex ${isDarkTheme ? 'dark text-zinc-300 bg-[#0A0A0C]' : 'text-slate-800 bg-[#F3F4F6]'}`}>
      
      {/* Sidebar Component */}
      <Sidebar
        masteryPercent={masteryPercent}
        masteredCount={masteredCount}
        totalCount={totalCount}
        dueCount={dueCount}
        activeMode={mode}
        setActiveMode={setMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredQuestions={session.active ? session.queue : filteredQuestions}
        cardProgresses={cardProgresses}
        activeQuestionId={currentQuestion?.id || null}
        onSelectQuestion={handleSelectQuestion}
        onResetProgress={handleResetProgress}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-h-screen">
        
        {/* Workspace Topbar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-slate-250 dark:border-zinc-800 sticky top-0 z-30 bg-white dark:bg-zinc-950">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-none text-slate-500 hover:text-slate-300 hover:bg-zinc-900 lg:hidden cursor-pointer"
              aria-label="Öppna sidopanel"
            >
              <Menu size={18} />
            </button>
            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              Affärsmannaskap
            </span>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Streak Counter 🔥 */}
            {streak > 1 && (
              <div 
                className="flex items-center space-x-1.5 px-2 py-0.5 rounded-none bg-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-xs font-bold font-mono"
                title={`${streak} i rad!`}
              >
                <Flame size={12} className="fill-current" />
                <span>STREAK: {streak}</span>
              </div>
            )}

            {/* Sound Toggle Button */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-none text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 border border-transparent dark:hover:border-zinc-800 transition-colors cursor-pointer"
              title={soundEnabled ? 'Stäng av ljud' : 'Sätt på ljud'}
              aria-label="Ljud av/på"
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="p-1.5 rounded-none text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900 border border-transparent dark:hover:border-zinc-800 transition-colors cursor-pointer"
              title={isDarkTheme ? 'Växla till ljust tema' : 'Växla till mörkt tema'}
              aria-label="Växla färgtema"
            >
              {isDarkTheme ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col justify-start overflow-y-auto p-4 sm:p-6 md:p-8">
          {session.active ? (
            /* Active Session flow */
            currentQuestion ? (
              <div className={shakeCard ? 'animate-shake' : ''}>
                <ProgressBar
                  current={session.questionsAnswered + 1}
                  total={sessionTarget}
                  progressPercent={sessionProgressPercent}
                />
                <QuestionCard
                  question={currentQuestion}
                  answerInput={answerInput}
                  setAnswerInput={setAnswerInput}
                  selectedMCIndex={selectedMCIndex}
                  setSelectedMCIndex={setSelectedMCIndex}
                  isRevealed={isRevealed}
                  onRevealAnswer={handleRevealAnswer}
                  onSkip={handleNextQuestion}
                  currentQuestionIndex={session.questionsAnswered + 1}
                  totalQuestions={sessionTarget}
                  assessment={isMC ? {
                    hasRubric: false,
                    verdict: selectedMCIndex === currentQuestion.correctIndex ? 'correct' : 'wrong',
                    suggestedRating: selectedMCIndex === currentQuestion.correctIndex ? 'known' : 'again',
                    scoreInternal: selectedMCIndex === currentQuestion.correctIndex ? 100 : 0,
                    score: selectedMCIndex === currentQuestion.correctIndex ? 100 : 0,
                    matched: [],
                    missing: [],
                    confusedWith: null,
                    feedback: { title: '', body: '', memoryRule: '', contrast: '' },
                    memoryRule: '',
                    summary: '',
                    signals: { conceptHits: [], missingConcepts: [], misconceptionHits: [], answerLength: 0 }
                  } : gradeAnswer(currentQuestion, answerInput, FOKUS_RUBRICS[currentQuestion.id])}
                  onRateAnswer={handleRateAnswer}
                />
              </div>
            ) : null
          ) : session.results.length > 0 ? (
            /* Session Completed summary screen */
            <SessionSummary
              results={session.results}
              questions={studyQuestions}
              masteryPercent={masteryPercent}
              onRetryQuestion={handleRetryQuestion}
              onNewSession={handleNewSession}
            />
          ) : currentQuestion ? (
            /* Default Direct study card mode */
            <div className={shakeCard ? 'animate-shake' : ''}>
              <QuestionCard
                question={currentQuestion}
                answerInput={answerInput}
                setAnswerInput={setAnswerInput}
                selectedMCIndex={selectedMCIndex}
                setSelectedMCIndex={setSelectedMCIndex}
                isRevealed={isRevealed}
                onRevealAnswer={handleRevealAnswer}
                onSkip={handleNextQuestion}
                currentQuestionIndex={1}
                totalQuestions={1}
                assessment={isMC ? {
                  hasRubric: false,
                  verdict: selectedMCIndex === currentQuestion.correctIndex ? 'correct' : 'wrong',
                  suggestedRating: selectedMCIndex === currentQuestion.correctIndex ? 'known' : 'again',
                  scoreInternal: selectedMCIndex === currentQuestion.correctIndex ? 100 : 0,
                  score: selectedMCIndex === currentQuestion.correctIndex ? 100 : 0,
                  matched: [],
                  missing: [],
                  confusedWith: null,
                  feedback: { title: '', body: '', memoryRule: '', contrast: '' },
                  memoryRule: '',
                  summary: '',
                  signals: { conceptHits: [], missingConcepts: [], misconceptionHits: [], answerLength: 0 }
                } : gradeAnswer(currentQuestion, answerInput, FOKUS_RUBRICS[currentQuestion.id])}
                onRateAnswer={handleRateAnswer}
              />
            </div>
          ) : (
            /* Landing Hero page */
            <HeroLanding
              dueCount={dueCount}
              totalCount={totalCount}
              onStartSession={handleStartSession}
            />
          )}
        </div>

        {/* Footer shortcuts helper */}
        {currentQuestion && !session.results.length && (
          <footer className="text-center py-3 text-xs text-slate-400 dark:text-zinc-600">
            {!isRevealed ? (
              <span>⌘ Enter för att visa facit{isMC && ' · Välj alternativ med 1–4'}</span>
            ) : (
              <span>Betygsätt med tangent: 1 = Kan · 2 = Nästan · 3 = Igen</span>
            )}
          </footer>
        )}
      </main>
    </div>
  );
}

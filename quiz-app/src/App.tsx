import { useState, useEffect, useRef } from 'react';
import { Menu, Sun, Moon, Volume2, VolumeX, Flame, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

// Logic & Data
import { FOKUS_QUESTIONS, type Question, type TentaQuestion } from './logic/questions';
import { ECONOMY_TERM_QUESTIONS } from './logic/economy-terms';
import { TENTA_QUESTIONS } from './logic/tenta-questions';
import { computeTentaReadiness } from './logic/tenta-readiness';
import { FOKUS_RUBRICS } from './logic/rubrics';
import { TERM_RUBRICS } from './logic/term-rubrics';
import { gradeAnswer } from './logic/grader';
import { calculateSM2, isDue, type CardProgress } from './logic/sm2';
import { soundEngine } from './logic/sound';

// Components
import { Sidebar } from './components/Sidebar';
import { HeroLanding, type StudyTrack } from './components/HeroLanding';
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
  const [essayProgresses, setEssayProgresses] = useLocalStorage<Record<string, CardProgress>>('fokusbladet-progress-v2', {});
  const [termsProgresses, setTermsProgresses] = useLocalStorage<Record<string, CardProgress>>('fokusbladet-terms-progress-v1', {});
  const [tentaProgresses, setTentaProgresses] = useLocalStorage<Record<string, CardProgress>>('fokusbladet-tenta-progress-v1', {});
  const [streak, setStreak] = useLocalStorage<number>('fokusbladet-streak', 0);
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('fokusbladet-sound', true);
  const [isDarkTheme, setIsDarkTheme] = useLocalStorage<boolean>('fokusbladet-theme-dark', true);

  // App Navigation States
  const [studyTrack, setStudyTrack] = useState<StudyTrack | null>(null);
  const [browseMode, setBrowseMode] = useState<boolean>(false);
  const [mode, setMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const essayQuestions = FOKUS_QUESTIONS.filter(q => q.mode !== 'repetition');
  const termQuestions = ECONOMY_TERM_QUESTIONS;
  const tentaQuestions = TENTA_QUESTIONS;
  const studyQuestions = studyTrack === 'tenta'
    ? tentaQuestions
    : studyTrack === 'terms'
    ? termQuestions
    : essayQuestions;
  const cardProgresses = studyTrack === 'tenta'
    ? tentaProgresses
    : studyTrack === 'terms'
    ? termsProgresses
    : essayProgresses;
  const setCardProgresses = studyTrack === 'tenta'
    ? setTentaProgresses
    : studyTrack === 'terms'
    ? setTermsProgresses
    : setEssayProgresses;

  const getRubric = (question: Question) => {
    if (studyTrack === 'tenta' || question.mode === 'tenta') return undefined;
    return studyTrack === 'terms' ? TERM_RUBRICS[question.id] : FOKUS_RUBRICS[question.id];
  };
  
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
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkTheme]);

  const getFilteredList = () => {
    if (studyTrack === null) return [];
    let list = studyQuestions;

    if (studyTrack === 'essay') {
      if (mode === 'resonemang') {
        list = studyQuestions.filter(q => q.mode === 'resonemang');
      } else if (mode === 'case') {
        list = studyQuestions.filter(q => q.mode === 'case');
      } else if (mode === 'examinatorrisk') {
        list = studyQuestions.filter(q => q.mode === 'examinatorrisk');
      } else if (mode === 'repetition') {
        list = studyQuestions.filter(q => {
          const rating = cardProgresses[q.id]?.rating;
          return rating === 'again' || rating === 'almost';
        });
      }
    } else if (studyTrack === 'terms') {
      if (mode === 'begrepp') {
        list = studyQuestions.filter(q => q.type === 'open' && q.mode === 'begrepp');
      } else if (mode === 'mc') {
        list = studyQuestions.filter(q => q.type === 'mc');
      } else if (mode === 'samband') {
        list = studyQuestions.filter(q => q.mode === 'samband');
      } else if (mode === 'repetition') {
        list = studyQuestions.filter(q => {
          const rating = cardProgresses[q.id]?.rating;
          return rating === 'again' || rating === 'almost';
        });
      }
    } else if (studyTrack === 'tenta') {
      if (mode === 'priority') {
        list = studyQuestions.filter(q => (q as TentaQuestion).isPriority);
      } else if (mode === 'area1') {
        list = studyQuestions.filter(q => (q as TentaQuestion).examArea === 1);
      } else if (mode === 'area2') {
        list = studyQuestions.filter(q => (q as TentaQuestion).examArea === 2);
      } else if (mode === 'area3') {
        list = studyQuestions.filter(q => (q as TentaQuestion).examArea === 3);
      } else if (mode === 'repetition') {
        list = studyQuestions.filter(q => {
          const rating = cardProgresses[q.id]?.rating;
          return rating === 'again' || rating === 'almost';
        });
      }
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

  const getDueCount = () => {
    if (studyTrack === null) return 0;
    return studyQuestions.filter(q => {
      const progress = cardProgresses[q.id];
      if (!progress || !progress.nextReview) return true; // Unseen is due
      return isDue(progress);
    }).length;
  };

  const dueCount = getDueCount();

  // Mastered stats
  const getMasteryStats = () => {
    if (studyTrack === null) {
      return { masteredCount: 0, totalCount: 0, masteryPercent: 0 };
    }
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
    const deckOrder = new Map(modeList.map((q, index) => [q.id, index]));
    const byDeckOrder = (a: Question, b: Question) =>
      (deckOrder.get(a.id) ?? 0) - (deckOrder.get(b.id) ?? 0);

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

    due.sort(byDeckOrder);
    unseen.sort(byDeckOrder);

    // Sort future by soonest review, then deck order
    future.sort((a, b) => {
      const da = new Date(cardProgresses[a.id]?.nextReview || 0).getTime();
      const db = new Date(cardProgresses[b.id]?.nextReview || 0).getTime();
      if (da !== db) return da - db;
      return byDeckOrder(a, b);
    });

    const combined = [...due, ...unseen, ...future];
    return size === 'all' ? combined : combined.slice(0, size);
  };

  // Start studiesession
  const handleStartSession = (size: number | 'all') => {
    const queue = getSmartQueue(size);
    if (!queue.length) return;

    setBrowseMode(false);
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
        : (gradeAnswer(currentQ, answerInput, getRubric(currentQ)).suggestedRating || 'again' as const);

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
    let score: number;
    if (currentQ.type === 'mc') {
      score = selectedMCIndex === currentQ.correctIndex ? 100 : 0;
    } else {
      const assessment = gradeAnswer(currentQ, answerInput, getRubric(currentQ));
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

  const handleRateAnswerRef = useRef(handleRateAnswer);

  useEffect(() => {
    handleRateAnswerRef.current = handleRateAnswer;
  });

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
        handleRateAnswerRef.current('known');
      } else if (e.key === '2') {
        e.preventDefault();
        handleRateAnswerRef.current('almost');
      } else if (e.key === '3') {
        e.preventDefault();
        handleRateAnswerRef.current('again');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRevealed]);

  // Jump to specific question (sidebar click)
  const handleSelectQuestion = (q: Question) => {
    if (session.active) {
      setSession(prev => ({ ...prev, active: false }));
    }

    setBrowseMode(true);
    const idx = filteredQuestions.findIndex(item => item.id === q.id);
    if (idx !== -1) {
      setCurrentIndex(idx);
      resetQuestionState();
    }
  };

  const handleSelectTrack = (track: StudyTrack) => {
    setStudyTrack(track);
    setMode('all');
    setBrowseMode(false);
    setCurrentIndex(0);
    setSearchQuery('');
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

  const handleBackToTracks = () => {
    setStudyTrack(null);
    setBrowseMode(false);
    setMode('all');
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

  const handleBrowse = () => {
    setBrowseMode(true);
    setCurrentIndex(0);
    resetQuestionState();
  };

  const getDueCountFor = (questions: Question[], progresses: Record<string, CardProgress>) => (
    questions.filter(q => {
      const progress = progresses[q.id];
      if (!progress || !progress.nextReview) return true;
      return isDue(progress);
    }).length
  );

  const essayDueCount = getDueCountFor(essayQuestions, essayProgresses);
  const termsDueCount = getDueCountFor(termQuestions, termsProgresses);
  const tentaDueCount = getDueCountFor(tentaQuestions, tentaProgresses);
  const tentaPriorityCount = tentaQuestions.filter(q => q.isPriority).length;
  const tentaReadiness = computeTentaReadiness(tentaQuestions, tentaProgresses);

  // Reset progress for active track only
  const handleResetProgress = () => {
    if (studyTrack === 'tenta') {
      setTentaProgresses({});
    } else if (studyTrack === 'terms') {
      setTermsProgresses({});
    } else {
      setEssayProgresses({});
    }
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
    setBrowseMode(false);
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
  const sidebarCollapsed = studyTrack === null;

  return (
    <div className={`min-h-screen flex ambient-bg ${isDarkTheme ? 'dark' : ''}`}>
      
      {/* Sidebar Component */}
      <Sidebar
        studyTrack={studyTrack}
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
        collapsed={sidebarCollapsed}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-h-screen">
        
        {/* Workspace Topbar */}
        <header className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-border sticky top-0 z-30 glass-header">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-panel transition-colors cursor-pointer lg:hidden"
              aria-label="Öppna sidopanel"
            >
              <Menu size={18} />
            </button>
            {studyTrack !== null && (
              <button
                onClick={handleBackToTracks}
                className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-panel transition-colors cursor-pointer"
                title="Till startsidan"
                aria-label="Till startsidan"
              >
                <Home size={18} />
              </button>
            )}
            <div>
              {studyTrack !== null ? (
                <button
                  type="button"
                  onClick={handleBackToTracks}
                  className="text-sm font-display font-bold text-text-primary hover:text-accent transition-colors cursor-pointer"
                  aria-label="Till startsidan"
                >
                  Affärsmannaskap
                </button>
              ) : (
                <span className="text-sm font-display font-bold text-text-primary">
                  Affärsmannaskap
                </span>
              )}
              {session.active && (
                <p className="text-[10px] text-text-muted uppercase tracking-wider">
                  {studyTrack === 'tenta' ? 'Tentaläge' : studyTrack === 'terms' ? 'Begreppsläge' : 'Fokusläge'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {streak > 1 && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-muted/30 text-warning border border-warning/25 text-xs font-semibold"
                title={`${streak} i rad!`}
              >
                <Flame size={12} className="fill-current" />
                <span>{streak} i rad</span>
              </div>
            )}

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-panel transition-colors cursor-pointer"
              title={soundEnabled ? 'Stäng av ljud' : 'Sätt på ljud'}
              aria-label="Ljud av/på"
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-panel transition-colors cursor-pointer"
              title={isDarkTheme ? 'Växla till ljust tema' : 'Växla till mörkt tema'}
              aria-label="Växla färgtema"
            >
              {isDarkTheme ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className={`flex-1 flex flex-col overflow-y-auto ${
          studyTrack === 'tenta' && !session.active && session.results.length === 0
            ? 'p-0 sm:p-2'
            : 'justify-start p-4 sm:p-6 md:p-8'
        }`}>
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
                  } : gradeAnswer(currentQuestion, answerInput, getRubric(currentQuestion))}
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
          ) : studyTrack === null || (!browseMode && !session.active) ? (
            <HeroLanding
              studyTrack={studyTrack}
              essayCount={essayQuestions.length}
              termsCount={termQuestions.length}
              tentaCount={tentaQuestions.length}
              tentaPriorityCount={tentaPriorityCount}
              essayDueCount={essayDueCount}
              termsDueCount={termsDueCount}
              tentaDueCount={tentaDueCount}
              tentaReadiness={tentaReadiness}
              onSelectTrack={handleSelectTrack}
              onBackToTracks={handleBackToTracks}
              onBrowse={handleBrowse}
              onStartSession={handleStartSession}
            />
          ) : currentQuestion ? (
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
                currentQuestionIndex={currentIndex + 1}
                totalQuestions={filteredQuestions.length}
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
                } : gradeAnswer(currentQuestion, answerInput, getRubric(currentQuestion))}
                onRateAnswer={handleRateAnswer}
              />
            </div>
          ) : (
            <HeroLanding
              studyTrack={studyTrack}
              essayCount={essayQuestions.length}
              termsCount={termQuestions.length}
              tentaCount={tentaQuestions.length}
              tentaPriorityCount={tentaPriorityCount}
              essayDueCount={essayDueCount}
              termsDueCount={termsDueCount}
              tentaDueCount={tentaDueCount}
              tentaReadiness={tentaReadiness}
              onSelectTrack={handleSelectTrack}
              onBackToTracks={handleBackToTracks}
              onBrowse={handleBrowse}
              onStartSession={handleStartSession}
            />
          )}
        </div>

        {/* Footer shortcuts helper */}
        {currentQuestion && !session.results.length && (
          <footer className="text-center py-3 text-xs text-text-muted">
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

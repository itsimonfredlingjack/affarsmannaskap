(function () {
  const questions = Array.isArray(window.FOKUS_QUESTIONS) ? window.FOKUS_QUESTIONS : [];
  const rubrics = window.FOKUS_RUBRICS && typeof window.FOKUS_RUBRICS === "object" ? window.FOKUS_RUBRICS : {};
  const grader = window.FOKUS_GRADER && typeof window.FOKUS_GRADER.gradeAnswer === "function"
    ? window.FOKUS_GRADER
    : null;
  const storageKey = "fokusbladet-progress-v2";
  const oldStorageKey = "fokusbladet-progress-v1";

  /* ==========================================================================
     DOM ELEMENTS
     ========================================================================== */
  const els = {
    modeButtons: Array.from(document.querySelectorAll(".mode-button")),
    counter: document.getElementById("counter"),
    sourceLine: document.getElementById("source-line"),
    title: document.getElementById("question-title"),
    tagRow: document.getElementById("tag-row"),
    studyInstruction: document.getElementById("study-instruction"),
    answerInput: document.getElementById("answer-input"),
    revealButton: document.getElementById("reveal-answer"),
    skipButton: document.getElementById("skip-question"),
    primaryActions: document.getElementById("primary-actions"),
    inputSection: document.getElementById("input-section"),
    mcOptions: document.getElementById("mc-options"),
    answerSection: document.getElementById("answer-section"),
    userAnswerCard: document.getElementById("user-answer-card"),
    userAnswerText: document.getElementById("user-answer-text"),
    assessmentCard: document.getElementById("assessment-card"),
    assessmentScore: document.getElementById("assessment-score"),
    assessmentTitle: document.getElementById("assessment-title"),
    assessmentSummary: document.getElementById("assessment-summary"),
    answerText: document.getElementById("answer-text"),
    selfCheckText: document.getElementById("self-check-text"),
    whyText: document.getElementById("why-text"),
    exampleBlock: document.getElementById("example-block"),
    exampleText: document.getElementById("example-text"),
    relatedRow: document.getElementById("related-row"),
    correctAnswerCard: document.getElementById("correct-answer-card"),
    mcExplanation: document.getElementById("mc-explanation"),
    mcExplanationText: document.getElementById("mc-explanation-text"),
    feedbackButtons: Array.from(document.querySelectorAll(".feedback-button")),
    nextButton: document.getElementById("next-question"),
    emptyState: document.getElementById("empty-state"),
    studyContainer: document.getElementById("study-container"),
    scoreRingContainer: document.querySelector(".score-ring-container"),
    scoreRing: document.getElementById("score-ring"),
    scoreRingValue: document.getElementById("score-ring-value"),
    // Sidebar
    appSidebar: document.getElementById("app-sidebar"),
    openSidebarBtn: document.getElementById("open-sidebar"),
    closeSidebarBtn: document.getElementById("close-sidebar"),
    sidebarOverlay: document.getElementById("sidebar-overlay"),
    sidebarProgressPercent: document.getElementById("sidebar-progress-percent"),
    sidebarProgressBar: document.getElementById("sidebar-progress-bar"),
    sidebarProgressText: document.getElementById("sidebar-progress-text"),
    sidebarDueCount: document.getElementById("sidebar-due-count"),
    sidebarQuestionCount: document.getElementById("sidebar-question-count"),
    sidebarQuestionList: document.getElementById("sidebar-question-list"),
    sidebarSearch: document.getElementById("sidebar-search"),
    resetButton: document.getElementById("reset-progress"),
    // Session Screens
    sessionSetup: document.getElementById("session-setup"),
    sessionSizeButtons: Array.from(document.querySelectorAll(".size-btn")),
    startSessionBtn: document.getElementById("start-session"),
    dueCountDisplay: document.getElementById("due-count"),
    sessionSummary: document.getElementById("session-summary"),
    summaryDonut: document.getElementById("summary-donut"),
    summaryDonutPercent: document.getElementById("summary-donut-percent"),
    summaryDonutLabel: document.getElementById("summary-donut-label"),
    categoryBars: document.getElementById("category-bars"),
    missedRetry: document.getElementById("missed-retry"),
    newSessionBtn: document.getElementById("new-session"),
    // Session progress indicator
    sessionProgressBar: document.getElementById("session-progress-bar"),
    sessionProgressText: document.getElementById("session-progress-text"),
    sessionProgressContainer: document.getElementById("session-progress-container")
  };

  /* ==========================================================================
     STATE
     ========================================================================== */
  const state = {
    mode: "all",
    currentIndex: 0,
    revealed: false,
    submittedAnswer: "",
    selectedMCIndex: -1,
    searchQuery: "",
    progress: loadProgress(),
    session: {
      active: false,
      targetCount: 20,
      questionsAnswered: 0,
      queue: [],
      results: [],
      startedAt: null
    }
  };

  /* ==========================================================================
     SM-2 SPACED REPETITION ENGINE
     ========================================================================== */
  function calculateSM2(cardProgress, qualityRating) {
    // qualityRating: "known" → 5, "almost" → 3, "again" → 1
    const qualityMap = { known: 5, almost: 3, again: 1 };
    const quality = qualityMap[qualityRating] || 1;

    let { easeFactor = 2.5, interval = 0, repetitions = 0 } = cardProgress;

    if (quality >= 3) {
      repetitions++;
      if (repetitions === 1) interval = 1;
      else if (repetitions === 2) interval = 6;
      else interval = Math.round(interval * easeFactor);
    } else {
      repetitions = 0;
      interval = 0;
    }

    easeFactor = Math.max(1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    const nextReview = new Date(Date.now() + interval * 86400000).toISOString();

    return { easeFactor, interval, repetitions, nextReview };
  }

  function isDueToday(cardProgress) {
    if (!cardProgress || !cardProgress.nextReview) return false;
    return new Date(cardProgress.nextReview) <= new Date();
  }

  function studyQuestions() {
    return questions.filter(q => q.mode !== "repetition");
  }

  function getDueQuestions() {
    return studyQuestions().filter(q => {
      const p = state.progress[q.id];
      if (!p || !p.nextReview) return true; // Never seen = due
      return isDueToday(p);
    });
  }

  function getSmartQuestionQueue(targetCount) {
    const due = [];
    const unseen = [];
    const future = [];
    const modeList = currentList();

    modeList.forEach(q => {
      const p = state.progress[q.id];
      if (!p || !p.nextReview) {
        unseen.push(q);
      } else if (isDueToday(p)) {
        due.push(q);
      } else {
        future.push(q);
      }
    });

    // Sort future by soonest due
    future.sort((a, b) => {
      const da = new Date(state.progress[a.id]?.nextReview || 0);
      const db = new Date(state.progress[b.id]?.nextReview || 0);
      return da - db;
    });

    // Build queue: due first, then unseen, then future
    const queue = [...due, ...unseen, ...future];
    return targetCount === "all" ? queue : queue.slice(0, targetCount);
  }

  /* ==========================================================================
     PERSISTENCE & MIGRATION
     ========================================================================== */
  function loadProgress() {
    try {
      // Try v2 first
      let parsed = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (parsed && typeof parsed === "object") return parsed;

      // Migrate from v1
      const v1 = JSON.parse(localStorage.getItem(oldStorageKey) || "null");
      if (v1 && typeof v1 === "object") {
        const migrated = {};
        for (const [id, data] of Object.entries(v1)) {
          migrated[id] = {
            rating: data.rating || "",
            answeredAt: data.answeredAt || new Date().toISOString(),
            easeFactor: 2.5,
            interval: data.rating === "known" ? 6 : data.rating === "almost" ? 1 : 0,
            repetitions: data.rating === "known" ? 2 : data.rating === "almost" ? 1 : 0,
            nextReview: new Date(Date.now() +
              (data.rating === "known" ? 6 : data.rating === "almost" ? 1 : 0) * 86400000
            ).toISOString(),
            score: data.rating === "known" ? 100 : data.rating === "almost" ? 60 : 0,
            history: [{ rating: data.rating, date: data.answeredAt, score: 0 }]
          };
        }
        localStorage.setItem(storageKey, JSON.stringify(migrated));
        return migrated;
      }

      return {};
    } catch {
      return {};
    }
  }

  function saveProgress() {
    localStorage.setItem(storageKey, JSON.stringify(state.progress));
  }

  /* ==========================================================================
     CONFETTI PARTICLE ENGINE
     ========================================================================== */
  const confettiCanvas = document.getElementById("confetti-canvas");
  const ctx = confettiCanvas ? confettiCanvas.getContext("2d") : null;
  let particles = [];
  let confettiAnimFrame = null;

  function resizeConfettiCanvas() {
    if (confettiCanvas) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
  }
  window.addEventListener("resize", resizeConfettiCanvas);

  function spawnConfetti() {
    if (!ctx) return;
    resizeConfettiCanvas();
    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: 0, y: window.innerHeight,
        vx: Math.random() * 12 + 8, vy: -(Math.random() * 15 + 12),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 5, rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4, gravity: 0.45, decay: 0.985
      });
    }
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: window.innerWidth, y: window.innerHeight,
        vx: -(Math.random() * 12 + 8), vy: -(Math.random() * 15 + 12),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 5, rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4, gravity: 0.45, decay: 0.985
      });
    }
    if (!confettiAnimFrame) animateConfetti();
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles = particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity;
      p.vx *= p.decay; p.vy *= p.decay; p.rotation += p.rotationSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
      return p.y < window.innerHeight + 10 && p.x > -10 && p.x < window.innerWidth + 10 && Math.abs(p.vx) > 0.02;
    });
    if (particles.length > 0) {
      confettiAnimFrame = requestAnimationFrame(animateConfetti);
    } else {
      confettiAnimFrame = null;
    }
  }

  /* ==========================================================================
     QUESTION FILTERING
     ========================================================================== */
  function filteredQuestions() {
    const baseQuestions = studyQuestions();
    if (state.mode === "all") return baseQuestions;
    if (state.mode === "repetition") {
      const weak = baseQuestions.filter(q => {
        const rating = state.progress[q.id]?.rating;
        return rating === "again" || rating === "almost";
      });
      return weak.length ? weak : baseQuestions;
    }
    return baseQuestions.filter(q => q.mode === state.mode);
  }

  function currentList() {
    const list = filteredQuestions();
    return list.length ? list : studyQuestions();
  }

  function clampIndex() {
    const list = state.session.active ? state.session.queue : currentList();
    if (state.currentIndex >= list.length) state.currentIndex = 0;
    if (state.currentIndex < 0) state.currentIndex = 0;
  }

  function currentQuestion() {
    const list = state.session.active ? state.session.queue : currentList();
    clampIndex();
    return list[state.currentIndex];
  }

  /* ==========================================================================
     VIEW TRANSITION HELPER
     ========================================================================== */
  function transitionRender() {
    if (document.startViewTransition) {
      document.startViewTransition(() => render());
    } else {
      render();
    }
  }

  function setMode(mode) {
    state.mode = mode;
    state.currentIndex = 0;
    state.revealed = false;
    state.submittedAnswer = "";
    state.selectedMCIndex = -1;
    markSuggestedRating("");
    els.answerInput.value = "";
    // If session is active, end it and go back to setup
    if (state.session.active) {
      endSession();
    }
    transitionRender();
  }

  /* ==========================================================================
     SESSION MANAGEMENT
     ========================================================================== */
  function startSession(targetCount) {
    const queue = getSmartQuestionQueue(targetCount);
    if (!queue.length) return;

    state.session = {
      active: true,
      targetCount: queue.length,
      questionsAnswered: 0,
      queue: queue,
      results: [],
      startedAt: new Date().toISOString()
    };
    state.currentIndex = 0;
    state.revealed = false;
    state.submittedAnswer = "";
    state.selectedMCIndex = -1;
    markSuggestedRating("");
    els.answerInput.value = "";
    transitionRender();
  }

  function endSession() {
    state.session.active = false;
  }

  function showSessionSummary() {
    state.session.active = false;
    renderSessionSummary();
  }

  function recordSessionResult(questionId, score, rating, category) {
    state.session.results.push({ questionId, score, rating, category });
    state.session.questionsAnswered++;
  }

  /* ==========================================================================
     CORE RENDERING
     ========================================================================== */
  function render() {
    const inSession = state.session.active;
    const list = inSession ? state.session.queue : currentList();
    const question = currentQuestion();
    const hasQuestions = Boolean(question);
    const showSetup = !inSession && !state.session.results.length;
    const showSummary = !inSession && state.session.results.length > 0;

    // Mode buttons
    els.modeButtons.forEach(button => {
      const active = button.dataset.mode === state.mode;
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    // Screen visibility
    if (els.sessionSetup) els.sessionSetup.hidden = !showSetup;
    if (els.sessionSummary) els.sessionSummary.hidden = !showSummary;

    const showQuiz = inSession && hasQuestions;
    const mainCard = document.getElementById("main-question-card");
    if (mainCard) mainCard.hidden = !showQuiz;
    els.emptyState.hidden = showQuiz || showSetup || showSummary;
    els.answerSection.hidden = !showQuiz || !state.revealed;

    // Session progress bar
    if (els.sessionProgressContainer) {
      els.sessionProgressContainer.hidden = !inSession;
    }
    if (inSession && els.sessionProgressBar && els.sessionProgressText) {
      const pct = Math.round((state.session.questionsAnswered / state.session.targetCount) * 100);
      els.sessionProgressBar.style.width = `${pct}%`;
      els.sessionProgressText.textContent = `${state.session.questionsAnswered + 1} av ${state.session.targetCount}`;
    }

    // Session setup due count
    if (showSetup && els.dueCountDisplay) {
      const dueCount = getDueQuestions().length;
      els.dueCountDisplay.textContent = dueCount;
    }

    if (!showQuiz) {
      els.counter.textContent = showSetup ? "—" : "0 av 0";
      renderSidebarStatsAndList();
      return;
    }

    const isMC = question.type === "mc";
    const hasRubric = Boolean(rubrics[question.id]);

    // Counter
    els.counter.textContent = `${state.currentIndex + 1} av ${list.length}`;

    // Source line
    if (isMC) {
      els.sourceLine.textContent = `${question.source} · Flerval`;
    } else {
      els.sourceLine.textContent = hasRubric
        ? `${question.source} · Snabb kontroll`
        : `${question.source} · Facitläge`;
    }

    // Title & instruction
    els.title.textContent = question.question;
    if (isMC) {
      els.studyInstruction.textContent = "Välj det alternativ som stämmer bäst.";
    } else {
      els.studyInstruction.textContent = hasRubric
        ? "Skriv med egna ord. Klicka på knappen nedan så jämförs ditt svar automatiskt."
        : "Skriv med egna ord. Denna fråga har facit men stöder inte automatisk matchning än.";
    }

    renderTags(question.tags || [question.category]);

    // Input area: show textarea only while open-ended answers are being written.
    if (els.inputSection) els.inputSection.hidden = isMC || state.revealed;
    if (els.mcOptions) {
      els.mcOptions.hidden = !isMC || state.revealed;
      if (isMC && !state.revealed) renderMCOptions(question);
    }

    // Primary actions visibility
    if (isMC) {
      els.primaryActions.hidden = true; // MC uses click-to-answer
    } else {
      els.primaryActions.hidden = state.revealed;
      els.revealButton.innerHTML = hasRubric
        ? 'Jämför & Visa facit <span class="btn-arrow">→</span>'
        : 'Visa facit <span class="btn-arrow">→</span>';
    }

    // Reveal state
    if (state.revealed) {
      if (isMC) {
        renderMCRevealed(question);
      } else {
        renderOpenRevealed(question);
      }
    }

    renderSidebarStatsAndList();
  }

  /* ==========================================================================
     MC RENDERING
     ========================================================================== */
  function renderMCOptions(question) {
    els.mcOptions.innerHTML = "";
    question.options.forEach((optionText, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mc-option";
      btn.textContent = optionText;
      btn.addEventListener("click", () => handleMCAnswer(question, idx));
      els.mcOptions.appendChild(btn);
    });
  }

  function handleMCAnswer(question, selectedIndex) {
    state.selectedMCIndex = selectedIndex;
    state.revealed = true;
    const isCorrect = selectedIndex === question.correctIndex;
    state.submittedAnswer = question.options[selectedIndex];

    // Mark options visually
    const optionBtns = els.mcOptions.querySelectorAll(".mc-option");
    optionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === question.correctIndex) {
        btn.classList.add(idx === selectedIndex ? "correct" : "missed-correct");
      } else if (idx === selectedIndex) {
        btn.classList.add("wrong");
      }
    });
    els.mcOptions.hidden = false; // Keep visible to show correct/wrong

    transitionRender();
  }

  function renderMCRevealed(question) {
    const isCorrect = state.selectedMCIndex === question.correctIndex;
    const score = isCorrect ? 100 : 0;

    // Score ring
    if (els.scoreRingContainer) els.scoreRingContainer.hidden = false;
    updateScoreRing(score);

    // Assessment badge
    setAssessmentBadge(isCorrect ? "correct" : "wrong", isCorrect ? "Rätt!" : "Fel");

    if (els.assessmentTitle) els.assessmentTitle.textContent = isCorrect ? "Rätt svar" : "Fel svar";
    els.assessmentSummary.textContent = question.explanation;

    // Hide open-ended specific cards
    if (els.userAnswerCard) els.userAnswerCard.hidden = true;
    if (els.correctAnswerCard) els.correctAnswerCard.hidden = true;
    if (els.assessmentCard) els.assessmentCard.hidden = false;
    if (els.assessmentCard) els.assessmentCard.classList.remove("coach-card");

    // MC explanation
    if (els.mcExplanation) {
      els.mcExplanation.hidden = false;
      els.mcExplanationText.textContent = question.explanation;
    }

    // Suggest rating
    markSuggestedRating(isCorrect ? "known" : "again");

    // Self-check text
    if (els.selfCheckText) {
      els.selfCheckText.textContent = isCorrect
        ? "Bra jobbat! Gå vidare eller välj nivå manuellt."
        : "Fel svar. Läs förklaringen ovan och försök komma ihåg till nästa gång.";
    }
  }

  /* ==========================================================================
     OPEN-ENDED RENDERING
     ========================================================================== */
  function renderOpenRevealed(question) {
    const assessment = getOpenAssessment(question, state.submittedAnswer);

    // Show open-ended specific cards
    if (els.userAnswerCard) els.userAnswerCard.hidden = false;
    if (els.correctAnswerCard) els.correctAnswerCard.hidden = false;
    if (els.assessmentCard) {
      els.assessmentCard.hidden = true;
      els.assessmentCard.classList.remove("coach-card");
    }
    if (els.mcExplanation) els.mcExplanation.hidden = true;
    if (els.scoreRingContainer) els.scoreRingContainer.hidden = true;

    // User answer
    els.userAnswerText.textContent = state.submittedAnswer || "Inget svar angavs innan facit visades.";

    markSuggestedRating(assessment.suggestedRating);

    els.answerText.textContent = question.answer;
    els.selfCheckText.textContent = selfCheckText(question, assessment.hasRubric);
    els.whyText.textContent = question.why;
    els.exampleText.textContent = question.example || "";
    els.exampleBlock.hidden = !question.example;
    renderRelated(question.related || []);

    const detailPanel = document.querySelector(".detail-panel");
    if (detailPanel) detailPanel.removeAttribute("open");
  }

  /* ==========================================================================
     SCORE RING
     ========================================================================== */
  function updateScoreRing(score) {
    if (els.scoreRing) {
      let ringColor;
      if (score >= 80) ringColor = "var(--color-success)";
      else if (score >= 40) ringColor = "var(--color-warning)";
      else ringColor = "var(--color-danger)";

      els.scoreRing.style.setProperty("--score", score);
      els.scoreRing.style.setProperty("--ring-color", ringColor);
    }
    if (els.scoreRingValue) {
      els.scoreRingValue.textContent = `${score}%`;
    }
  }

  function getOpenAssessment(question, rawAnswer) {
    const rubric = rubrics[question.id];
    if (grader) return grader.gradeAnswer(question, rawAnswer, rubric);
    return assessAnswer(question, rawAnswer);
  }

  function verdictLabel(verdict) {
    const labels = {
      correct: "Rätt",
      almost: "Nästan",
      too_vague: "Nästan",
      confused_with: "Fel svar",
      wrong: "Fel svar",
      nonsense: "Fel svar",
      uncertain: "Jämför"
    };
    return labels[verdict] || "Bedömning";
  }

  function setAssessmentBadge(verdict, label) {
    if (!els.assessmentScore) return;
    const classes = [
      "verdict-correct",
      "verdict-almost",
      "verdict-too-vague",
      "verdict-confused",
      "verdict-wrong",
      "verdict-nonsense",
      "verdict-uncertain"
    ];
    els.assessmentScore.classList.remove(...classes);
    const className = {
      correct: "verdict-correct",
      almost: "verdict-almost",
      too_vague: "verdict-too-vague",
      confused_with: "verdict-confused",
      wrong: "verdict-wrong",
      nonsense: "verdict-nonsense",
      uncertain: "verdict-uncertain"
    }[verdict] || "verdict-uncertain";
    els.assessmentScore.classList.add(className);
    els.assessmentScore.textContent = label;
    if (els.assessmentCard) els.assessmentCard.dataset.verdict = verdict || "";
  }

  /* ==========================================================================
     HELPERS
     ========================================================================== */
  function renderTags(tags) {
    els.tagRow.innerHTML = "";
    tags.slice(0, 3).forEach(tag => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tag;
      els.tagRow.appendChild(span);
    });
  }

  function editorIconSvg() {
    return `
      <svg class="q-type-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
      </svg>
    `;
  }

  function renderRelated(related) {
    els.relatedRow.innerHTML = "";
    related.forEach(label => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "related-link";
      button.textContent = label;
      button.addEventListener("click", () => jumpToRelated(label));
      els.relatedRow.appendChild(button);
    });
  }

  function markSuggestedRating(rating) {
    els.feedbackButtons.forEach(button => {
      button.classList.toggle("is-suggested", Boolean(rating) && button.dataset.rating === rating);
    });
  }

  /* ==========================================================================
     SESSION SUMMARY RENDERING
     ========================================================================== */
  function renderSessionSummary() {
    const results = state.session.results;
    if (!results.length) return;

    // Overall score
    const totalScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

    // Donut
    if (els.summaryDonut) {
      let donutColor;
      if (totalScore >= 80) donutColor = "var(--color-success)";
      else if (totalScore >= 50) donutColor = "var(--color-warning)";
      else donutColor = "var(--color-danger)";

      els.summaryDonut.style.setProperty("--score", totalScore);
      els.summaryDonut.style.setProperty("--ring-color", donutColor);
    }
    if (els.summaryDonutPercent) els.summaryDonutPercent.textContent = `${totalScore}%`;
    if (els.summaryDonutLabel) {
      if (totalScore >= 80) els.summaryDonutLabel.textContent = "Utmärkt!";
      else if (totalScore >= 50) els.summaryDonutLabel.textContent = "Bra jobbat";
      else els.summaryDonutLabel.textContent = "Fortsätt öva";
    }

    // Category breakdown
    if (els.categoryBars) {
      els.categoryBars.innerHTML = "";
      const categories = {};
      results.forEach(r => {
        if (!categories[r.category]) categories[r.category] = { total: 0, count: 0 };
        categories[r.category].total += r.score;
        categories[r.category].count++;
      });

      Object.entries(categories).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count)).forEach(([cat, data]) => {
        const avg = Math.round(data.total / data.count);
        const row = document.createElement("div");
        row.className = "category-bar-row";

        let barColor;
        if (avg >= 80) barColor = "var(--color-success)";
        else if (avg >= 50) barColor = "var(--color-warning)";
        else barColor = "var(--color-danger)";

        row.innerHTML = `
          <div class="cat-bar-label">
            <span class="cat-name">${cat}</span>
            <span class="cat-score">${avg}%</span>
          </div>
          <div class="cat-bar-track">
            <div class="cat-bar-fill" style="width: ${avg}%; background: ${barColor};"></div>
          </div>
        `;
        els.categoryBars.appendChild(row);
      });
    }

    // Missed questions retry links
    if (els.missedRetry) {
      els.missedRetry.innerHTML = "";
      const missed = results.filter(r => r.score < 100);
      if (missed.length === 0) {
        els.missedRetry.innerHTML = '<p class="no-missed">Perfekt. Inga missade frågor.</p>';
      } else {
        const header = document.createElement("h4");
        header.className = "missed-header";
        header.textContent = `${missed.length} frågor att repetera`;
        els.missedRetry.appendChild(header);

        missed.forEach(r => {
          const q = questions.find(q => q.id === r.questionId);
          if (!q) return;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "missed-item";
          btn.innerHTML = `
            <span class="missed-score" style="color: ${r.score >= 40 ? "var(--color-warning)" : "var(--color-danger)"}">${r.score}%</span>
            <span class="missed-title">${q.question}</span>
          `;
          btn.addEventListener("click", () => {
            // Start a mini session with just this question
            state.session.results = [];
            startSession(1);
            state.session.queue = [q];
            state.currentIndex = 0;
            transitionRender();
          });
          els.missedRetry.appendChild(btn);
        });
      }
    }

    transitionRender();
  }

  /* ==========================================================================
     SIDEBAR STATS & DYNAMIC LIST
     ========================================================================== */
  function renderSidebarStatsAndList() {
    if (!questions.length) return;

    // Progress stats
    const baseQuestions = studyQuestions();
    const totalCount = baseQuestions.length;
    const mastered = baseQuestions.filter(q => {
      const progress = state.progress[q.id];
      return progress?.rating === "known" && progress.repetitions >= 2;
    }).length;
    const percent = totalCount ? Math.min(100, Math.round((mastered / totalCount) * 100)) : 0;

    if (els.sidebarProgressPercent) els.sidebarProgressPercent.textContent = `${percent}%`;
    if (els.sidebarProgressBar) els.sidebarProgressBar.style.width = `${percent}%`;
    if (els.sidebarProgressText) {
      els.sidebarProgressText.textContent = `${mastered} av ${totalCount} bemästrade`;
    }

    // Due today count
    if (els.sidebarDueCount) {
      const dueCount = getDueQuestions().length;
      els.sidebarDueCount.textContent = `${dueCount} förfaller idag`;
    }

    // Question list
    const list = currentList();
    const query = normalize(state.searchQuery || "");
    const filteredBySearch = query ? list.filter(q => matchesQuestion(q, query)) : list;

    if (els.sidebarQuestionCount) els.sidebarQuestionCount.textContent = filteredBySearch.length;
    if (els.sidebarQuestionList) {
      els.sidebarQuestionList.innerHTML = "";

      filteredBySearch.forEach(q => {
        const indexInList = list.findIndex(item => item.id === q.id);
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sidebar-q-item";
        if (state.session.active && state.session.queue[state.currentIndex]?.id === q.id) {
          btn.classList.add("active");
        } else if (!state.session.active && state.currentIndex === indexInList) {
          btn.classList.add("active");
        }

        const meta = document.createElement("div");
        meta.className = "q-item-meta";

        const typeIcon = document.createElement("span");
        typeIcon.className = "q-item-type";
        typeIcon.title = q.type === "mc" ? "Flervalsfråga" : "Öppen fråga";
        if (q.type === "mc") {
          typeIcon.textContent = "MC";
          typeIcon.classList.add("q-item-type-text");
        } else {
          typeIcon.innerHTML = editorIconSvg();
          typeIcon.classList.add("q-item-type-icon");
          typeIcon.setAttribute("aria-hidden", "true");
        }

        const title = document.createElement("span");
        title.className = "q-item-title";
        title.textContent = q.question;

        meta.appendChild(typeIcon);
        meta.appendChild(title);
        btn.appendChild(meta);

        const statusDot = document.createElement("span");
        statusDot.className = "q-item-status";
        const rating = state.progress[q.id]?.rating;
        if (rating === "known") statusDot.classList.add("known");
        else if (rating === "almost") statusDot.classList.add("almost");
        else if (rating === "again") statusDot.classList.add("again");
        else statusDot.classList.add("unvisited");
        btn.appendChild(statusDot);

        btn.addEventListener("click", () => selectQuestionById(q.id));
        li.appendChild(btn);
        els.sidebarQuestionList.appendChild(li);
      });

      if (!filteredBySearch.length) {
        const li = document.createElement("li");
        li.style.cssText = "padding:1rem 0.5rem;font-size:0.8rem;color:var(--text-sidebar-secondary);text-align:center;";
        li.textContent = "Inga matchande frågor";
        els.sidebarQuestionList.appendChild(li);
      }
    }
  }

  function selectQuestionById(id) {
    const list = state.session.active ? state.session.queue : currentList();
    const idx = list.findIndex(q => q.id === id);
    if (idx >= 0) {
      state.currentIndex = idx;
      state.revealed = false;
      state.submittedAnswer = "";
      state.selectedMCIndex = -1;
      markSuggestedRating("");
      els.answerInput.value = "";
      transitionRender();
      els.answerInput.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
      els.appSidebar.classList.remove("open");
      if (els.sidebarOverlay) els.sidebarOverlay.classList.remove("active");
    }
  }

  /* ==========================================================================
     NAVIGATION & ACTIONS
     ========================================================================== */
  function jumpToRelated(label) {
    const normalized = normalize(label);
    const list = currentList();
    const localMatchIndex = list.findIndex(q => matchesQuestion(q, normalized));
    if (localMatchIndex >= 0) {
      state.currentIndex = localMatchIndex;
    } else {
      const globalMatch = questions.find(q => matchesQuestion(q, normalized));
      if (!globalMatch) return;
      state.mode = globalMatch.mode === "repetition" ? "all" : globalMatch.mode;
      state.currentIndex = filteredQuestions().findIndex(q => q.id === globalMatch.id);
      if (state.currentIndex < 0) state.currentIndex = 0;
    }
    state.revealed = false;
    state.submittedAnswer = "";
    state.selectedMCIndex = -1;
    markSuggestedRating("");
    els.answerInput.value = "";
    transitionRender();
    els.answerInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function matchesQuestion(question, normalized) {
    return normalize(question.question).includes(normalized) ||
      normalize(question.id).includes(normalized) ||
      (question.tags || []).some(tag => normalize(tag).includes(normalized));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ").trim();
  }

  function revealAnswer() {
    if (!currentQuestion()) return;
    state.submittedAnswer = els.answerInput.value.trim();
    state.revealed = true;
    transitionRender();
    focusAssessmentAfterReveal();
  }

  function focusAssessmentAfterReveal() {
    const focusTarget = () => {
      if (state.revealed && els.assessmentTitle && !els.answerSection?.hidden) {
        els.assessmentTitle.focus({ preventScroll: true });
      }
    };
    requestAnimationFrame(focusTarget);
    window.setTimeout(focusTarget, 220);
  }

  function nextQuestion() {
    const list = state.session.active ? state.session.queue : currentList();

    if (state.session.active) {
      // Check if session is complete
      if (state.session.questionsAnswered >= state.session.targetCount) {
        showSessionSummary();
        transitionRender();
        return;
      }
      state.currentIndex++;
      if (state.currentIndex >= list.length) {
        showSessionSummary();
        transitionRender();
        return;
      }
    } else {
      state.currentIndex = list.length ? (state.currentIndex + 1) % list.length : 0;
    }

    state.revealed = false;
    state.submittedAnswer = "";
    state.selectedMCIndex = -1;
    markSuggestedRating("");
    els.answerInput.value = "";
    transitionRender();
    els.answerInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function rateCurrent(rating) {
    const question = currentQuestion();
    if (!question) return;

    const isMC = question.type === "mc";
    const score = isMC
      ? (state.selectedMCIndex === question.correctIndex ? 100 : 0)
      : computeOpenScore(question, state.submittedAnswer, rating);

    // SM-2 calculation
    const prevProgress = state.progress[question.id] || {};
    const sm2 = calculateSM2(prevProgress, rating);

    state.progress[question.id] = {
      rating,
      answeredAt: new Date().toISOString(),
      score,
      ...sm2,
      history: [...(prevProgress.history || []), { rating, date: new Date().toISOString(), score }]
    };
    saveProgress();

    // Record session result
    if (state.session.active) {
      recordSessionResult(question.id, score, rating, question.category);
    }

    // Confetti for correct/almost
    if (rating === "known" || rating === "almost") {
      spawnConfetti();
    }

    nextQuestion();
  }

  function computeOpenScore(question, rawAnswer, manualRating = "") {
    const assessment = getOpenAssessment(question, rawAnswer);
    if (assessment.verdict === "uncertain" && manualRating) {
      const manualScores = { known: 100, almost: 60, again: 0 };
      return manualScores[manualRating] ?? assessment.scoreInternal ?? 0;
    }
    return assessment.scoreInternal ?? assessment.score ?? 0;
  }

  function resetProgress() {
    const confirmed = confirm("Är du säker på att du vill nollställa alla framsteg?");
    if (!confirmed) return;
    state.progress = {};
    localStorage.removeItem(storageKey);
    localStorage.removeItem(oldStorageKey);
    state.currentIndex = 0;
    state.revealed = false;
    state.submittedAnswer = "";
    state.selectedMCIndex = -1;
    state.searchQuery = "";
    state.session = { active: false, targetCount: 20, questionsAnswered: 0, queue: [], results: [], startedAt: null };
    if (els.sidebarSearch) els.sidebarSearch.value = "";
    markSuggestedRating("");
    els.answerInput.value = "";
    transitionRender();
  }

  function selfCheckText(question, hasRubric) {
    if (hasRubric) return "Använd den rekommenderade nivån som stöd, men justera själv om du anser att appens kontroll missade en giltig synonym.";
    if (question.mode === "samband") return "Frågan saknar automatisk kontroll. Godkänn om du täckte båda begreppen samt sambandet.";
    if (question.mode === "case") return "Frågan saknar automatisk kontroll. Godkänn om ditt svar använde rätt bolagsdata och rimliga slutsatser.";
    return "Frågan saknar automatisk kontroll. Välj nivå efter hur väl du matchade facit.";
  }

  /* ==========================================================================
     ASSESSMENT (Open-ended)
     ========================================================================== */
  function assessAnswer(question, rawAnswer) {
    const rubric = rubrics[question.id];
    if (!rubric) {
      return {
        hasRubric: false, score: 0,
        matched: ["Facit visas nedan för manuell bedömning."],
        missing: ["Denna fråga saknar kriterie-rubriker."],
        scoreText: "Manuell kontroll", suggestedRating: "",
        summary: "Frågan saknar automatisk kontroll. Jämför ditt svar mot facit och välj nivå själv."
      };
    }
    const answer = normalize(rawAnswer);
    const evaluation = evaluateRubric(rubric, answer);
    const score = evaluation.score;
    const ratingLabel = score >= 80 ? "Bedömning: Rätt" : score >= 40 ? "Bedömning: Nästan" : "Bedömning: Träna igen";

    if (!answer) {
      return {
        hasRubric: true, score: 0,
        matched: ["Inget svar angivet."], missing: evaluation.missing,
        scoreText: "0%", suggestedRating: "again",
        summary: "Bedömning: Träna igen. Skriv alltid en gissning innan du visar facit!"
      };
    }
    return {
      hasRubric: true, score,
      matched: evaluation.matched, missing: evaluation.missing,
      scoreText: `${score}%`, suggestedRating: evaluation.rating,
      summary: `${ratingLabel}. ${evaluation.explanation}`
    };
  }

  function evaluateRubric(rubric, normalizedAnswer) {
    const criterionHits = new Set();
    const matched = [];
    const missing = [];

    rubric.criteria.forEach(criterion => {
      const hit = criterion.accepted.some(phrase => normalizedAnswer.includes(normalize(phrase)));
      if (hit) { criterionHits.add(criterion.key); matched.push(criterion.label); }
      else { missing.push(criterion.label); }
    });

    (rubric.compound || []).forEach(compound => {
      const count = compound.from.reduce((sum, key) => sum + (criterionHits.has(key) ? 1 : 0), 0);
      if (count >= compound.minMatches) criterionHits.add(compound.key);
    });

    const totalCriteria = rubric.criteria.length;
    const matchedCount = matched.length;
    const score = totalCriteria > 0 ? Math.round((matchedCount / totalCriteria) * 100) : 0;

    const correct = rubric.correctRequires.every(key => criterionHits.has(key));
    const almost = rubric.almostRequiresAny.some(key => criterionHits.has(key));
    const rating = correct ? "known" : almost ? "almost" : "again";
    const mistake = findRelevantMistake(rubric, rating);

    return {
      rating, score,
      matched: matched.length ? matched : ["Inga identifierade nyckelord."],
      missing: missing.length ? missing : ["Inga nyckelord saknas."],
      explanation: explanationFor(rating, mistake)
    };
  }

  function findRelevantMistake(rubric, rating) {
    if (rating === "known") return "";
    return (rubric.commonMistakes || [])[0] || "";
  }

  function explanationFor(rating, mistake) {
    if (rating === "known") return "Ditt svar lyckades täcka in alla centrala begrepp.";
    if (rating === "almost") return `Ditt svar täckte en del men missade viktiga detaljer.${mistake ? ` Vanligt misstag: "${mistake}"` : ""}`;
    return `Ditt svar missade de centrala nyckelfraserna i facit.${mistake ? ` Vanligt misstag: "${mistake}"` : ""}`;
  }

  /* ==========================================================================
     EVENT LISTENERS
     ========================================================================== */

  // Sidebar toggle
  if (els.openSidebarBtn) els.openSidebarBtn.addEventListener("click", () => {
    els.appSidebar.classList.add("open");
    if (els.sidebarOverlay) els.sidebarOverlay.classList.add("active");
  });
  if (els.closeSidebarBtn) els.closeSidebarBtn.addEventListener("click", () => {
    els.appSidebar.classList.remove("open");
    if (els.sidebarOverlay) els.sidebarOverlay.classList.remove("active");
  });
  if (els.sidebarOverlay) els.sidebarOverlay.addEventListener("click", () => {
    els.appSidebar.classList.remove("open");
    els.sidebarOverlay.classList.remove("active");
  });

  // Search
  if (els.sidebarSearch) els.sidebarSearch.addEventListener("input", e => {
    state.searchQuery = e.target.value;
    renderSidebarStatsAndList();
  });

  // Session size buttons
  els.sessionSizeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      els.sessionSizeButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  // Start session
  if (els.startSessionBtn) els.startSessionBtn.addEventListener("click", () => {
    const selectedBtn = document.querySelector(".size-btn.selected");
    const size = selectedBtn?.dataset.size;
    startSession(size === "all" ? "all" : parseInt(size) || 20);
  });

  // New session
  if (els.newSessionBtn) els.newSessionBtn.addEventListener("click", () => {
    state.session.results = [];
    transitionRender();
  });

  // Mode buttons
  els.modeButtons.forEach(button => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  els.revealButton.addEventListener("click", revealAnswer);
  els.skipButton.addEventListener("click", nextQuestion);
  els.nextButton.addEventListener("click", nextQuestion);
  if (els.resetButton) els.resetButton.addEventListener("click", resetProgress);

  els.feedbackButtons.forEach(button => {
    button.addEventListener("click", () => rateCurrent(button.dataset.rating));
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      if (!state.revealed) revealAnswer();
      return;
    }
    if (!state.revealed) return;
    if (event.key === "1") { event.preventDefault(); rateCurrent("known"); }
    else if (event.key === "2") { event.preventDefault(); rateCurrent("almost"); }
    else if (event.key === "3") { event.preventDefault(); rateCurrent("again"); }
  });

  // Init
  render();
  els.answerInput.focus();
})();

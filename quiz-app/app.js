(function () {
  const questions = Array.isArray(window.FOKUS_QUESTIONS) ? window.FOKUS_QUESTIONS : [];
  const rubrics = window.FOKUS_RUBRICS && typeof window.FOKUS_RUBRICS === "object" ? window.FOKUS_RUBRICS : {};
  const storageKey = "fokusbladet-progress-v1";

  const els = {
    // Mode Buttons
    modeButtons: Array.from(document.querySelectorAll(".mode-button")),
    
    // Header & Info
    counter: document.getElementById("counter"),
    sourceLine: document.getElementById("source-line"),
    title: document.getElementById("question-title"),
    tagRow: document.getElementById("tag-row"),
    studyInstruction: document.getElementById("study-instruction"),
    
    // Inputs
    answerInput: document.getElementById("answer-input"),
    revealButton: document.getElementById("reveal-answer"),
    skipButton: document.getElementById("skip-question"),
    primaryActions: document.getElementById("primary-actions"),
    
    // Assessment & Answers
    answerSection: document.getElementById("answer-section"),
    userAnswerText: document.getElementById("user-answer-text"),
    assessmentScore: document.getElementById("assessment-score"),
    assessmentSummary: document.getElementById("assessment-summary"),
    matchedList: document.getElementById("matched-list"),
    missingList: document.getElementById("missing-list"),
    answerText: document.getElementById("answer-text"),
    selfCheckText: document.getElementById("self-check-text"),
    whyText: document.getElementById("why-text"),
    exampleBlock: document.getElementById("example-block"),
    exampleText: document.getElementById("example-text"),
    relatedRow: document.getElementById("related-row"),
    
    // Ratings & Navigation
    feedbackButtons: Array.from(document.querySelectorAll(".feedback-button")),
    nextButton: document.getElementById("next-question"),
    emptyState: document.getElementById("empty-state"),
    studyContainer: document.getElementById("study-container"),

    // Sidebar & Layout Elements (New)
    appSidebar: document.getElementById("app-sidebar"),
    openSidebarBtn: document.getElementById("open-sidebar"),
    closeSidebarBtn: document.getElementById("close-sidebar"),
    sidebarOverlay: document.getElementById("sidebar-overlay"),
    sidebarProgressPercent: document.getElementById("sidebar-progress-percent"),
    sidebarProgressBar: document.getElementById("sidebar-progress-bar"),
    sidebarProgressText: document.getElementById("sidebar-progress-text"),
    sidebarQuestionCount: document.getElementById("sidebar-question-count"),
    sidebarQuestionList: document.getElementById("sidebar-question-list"),
    sidebarSearch: document.getElementById("sidebar-search"),
    resetButton: document.getElementById("reset-progress")
  };

  const state = {
    mode: "all",
    currentIndex: 0,
    revealed: false,
    submittedAnswer: "",
    searchQuery: "",
    progress: loadProgress()
  };

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
    
    // Spawn from bottom-left
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: 0,
        y: window.innerHeight,
        vx: Math.random() * 12 + 8,
        vy: -(Math.random() * 15 + 12),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 5,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4,
        gravity: 0.45,
        decay: 0.985
      });
    }

    // Spawn from bottom-right
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: window.innerWidth,
        y: window.innerHeight,
        vx: -(Math.random() * 12 + 8),
        vy: -(Math.random() * 15 + 12),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 5,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 8 - 4,
        gravity: 0.45,
        decay: 0.985
      });
    }

    if (!confettiAnimFrame) {
      animateConfetti();
    }
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    particles = particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.decay;
      p.vy *= p.decay;
      p.rotation += p.rotationSpeed;
      
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
     DATA CORE & LOCAL STORAGE
     ========================================================================== */
  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveProgress() {
    localStorage.setItem(storageKey, JSON.stringify(state.progress));
  }

  function filteredQuestions() {
    if (state.mode === "all") return questions.filter((question) => question.mode !== "repetition");
    if (state.mode === "repetition") {
      const weak = questions.filter((question) => {
        const rating = state.progress[question.id]?.rating;
        return rating === "again" || rating === "almost";
      });
      return weak.length ? weak : questions.filter((question) => question.mode !== "repetition");
    }
    return questions.filter((question) => question.mode === state.mode);
  }

  function currentList() {
    const list = filteredQuestions();
    return list.length ? list : questions;
  }

  function clampIndex() {
    const list = currentList();
    if (state.currentIndex >= list.length) state.currentIndex = 0;
    if (state.currentIndex < 0) state.currentIndex = 0;
  }

  function currentQuestion() {
    const list = currentList();
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
    markSuggestedRating("");
    els.answerInput.value = "";
    transitionRender();
  }

  /* ==========================================================================
     CORE RENDERING LOGIC
     ========================================================================== */
  function render() {
    const list = currentList();
    const question = currentQuestion();
    const hasQuestions = Boolean(question);

    // 1. Mode Button Active Highlights
    els.modeButtons.forEach((button) => {
      const active = button.dataset.mode === state.mode;
      if (active) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    // 2. Empty State Toggle
    els.emptyState.hidden = hasQuestions;
    if (els.answerInput.parentElement.classList.contains("textarea-wrapper")) {
      // Input section wraps textarea
      els.answerInput.parentElement.parentElement.hidden = !hasQuestions;
    } else {
      els.answerInput.hidden = !hasQuestions;
    }

    els.primaryActions.hidden = !hasQuestions || state.revealed;
    els.answerSection.hidden = !hasQuestions || !state.revealed;

    if (!hasQuestions) {
      els.counter.textContent = "0 av 0";
      els.sourceLine.textContent = "";
      els.title.textContent = "Inga frågor hittades";
      els.tagRow.innerHTML = "";
      renderSidebarStatsAndList();
      return;
    }

    // 3. Question Card Setup
    const hasRubric = Boolean(rubrics[question.id]);
    els.counter.textContent = `${state.currentIndex + 1} av ${list.length}`;
    els.sourceLine.textContent = hasRubric ? `${question.source} · Snabb kontroll tillgänglig` : `${question.source} · Facitläge`;
    els.title.textContent = question.question;
    els.studyInstruction.textContent = hasRubric
      ? "Skriv med egna ord. Klicka på knappen nedan så jämförs ditt svar automatiskt."
      : "Skriv med egna ord. Denna fråga har facit men stöder inte automatisk matchning än.";
      
    els.revealButton.innerHTML = hasRubric 
      ? 'Jämför & Visa facit <span class="btn-arrow">→</span>' 
      : 'Visa facit <span class="btn-arrow">→</span>';
    
    renderTags(question.tags || [question.category]);

    // 4. Reveal Panel Updates
    if (state.revealed) {
      const assessment = assessAnswer(question, state.submittedAnswer);
      els.userAnswerText.textContent = state.submittedAnswer || "Inget svar angavs innan facit visades.";
      
      // Update assessment rating header text & colors dynamically
      els.assessmentScore.textContent = assessment.scoreText;
      els.assessmentSummary.textContent = assessment.summary;
      
      // Clear assessment classes and apply appropriate one
      els.assessmentScore.className = "assessment-score";
      if (assessment.suggestedRating === "known") {
        els.assessmentScore.style.backgroundColor = "var(--bg-success-soft)";
        els.assessmentScore.style.borderColor = "var(--border-success-soft)";
        els.assessmentScore.style.color = "var(--text-success-dark)";
      } else if (assessment.suggestedRating === "almost") {
        els.assessmentScore.style.backgroundColor = "var(--bg-warning-soft)";
        els.assessmentScore.style.borderColor = "var(--border-warning-soft)";
        els.assessmentScore.style.color = "var(--text-warning-dark)";
      } else {
        els.assessmentScore.style.backgroundColor = "var(--bg-danger-soft)";
        els.assessmentScore.style.borderColor = "var(--border-danger-soft)";
        els.assessmentScore.style.color = "var(--text-danger-dark)";
      }

      renderListChips(els.matchedList, assessment.matched);
      renderListChips(els.missingList, assessment.missing);
      markSuggestedRating(assessment.suggestedRating);
      
      els.answerText.textContent = question.answer;
      els.selfCheckText.textContent = selfCheckText(question, assessment.hasRubric);
      els.whyText.textContent = question.why;
      els.exampleText.textContent = question.example || "";
      els.exampleBlock.hidden = !question.example;
      renderRelated(question.related || []);
      
      // If we have details elements, collapse them initially on new render
      const detailPanel = document.querySelector(".detail-panel");
      if (detailPanel) {
        detailPanel.removeAttribute("open");
      }
    }

    // 5. Update Sidebar Panel elements
    renderSidebarStatsAndList();
  }

  function renderTags(tags) {
    els.tagRow.innerHTML = "";
    tags.slice(0, 3).forEach((tag) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tag;
      els.tagRow.appendChild(span);
    });
  }

  function renderRelated(related) {
    els.relatedRow.innerHTML = "";
    related.forEach((label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "related-link";
      button.textContent = label;
      button.addEventListener("click", () => jumpToRelated(label));
      els.relatedRow.appendChild(button);
    });
  }

  // Render comparison lists as modern inline dashboard chips
  function renderListChips(element, items) {
    element.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      element.appendChild(li);
    });
  }

  function markSuggestedRating(rating) {
    els.feedbackButtons.forEach((button) => {
      button.classList.toggle("is-suggested", Boolean(rating) && button.dataset.rating === rating);
    });
  }

  /* ==========================================================================
     SIDEBAR STATS & DYNAMIC LISTS
     ========================================================================== */
  function renderSidebarStatsAndList() {
    if (!questions.length) return;

    // 1. Calculate overall progress stats
    const totalCount = questions.length;
    const answeredKeys = Object.keys(state.progress);
    const answeredCount = answeredKeys.length;
    const percent = Math.min(100, Math.round((answeredCount / totalCount) * 100));

    if (els.sidebarProgressPercent) els.sidebarProgressPercent.textContent = `${percent}%`;
    if (els.sidebarProgressBar) els.sidebarProgressBar.style.width = `${percent}%`;
    if (els.sidebarProgressText) {
      els.sidebarProgressText.textContent = `${answeredCount} av ${totalCount} avklarade`;
    }

    // 2. Render sidebar scrollable list
    const list = currentList();
    const query = normalize(state.searchQuery || "");
    const filteredBySearch = query 
      ? list.filter(q => matchesQuestion(q, query)) 
      : list;

    if (els.sidebarQuestionCount) els.sidebarQuestionCount.textContent = filteredBySearch.length;
    if (els.sidebarQuestionList) {
      els.sidebarQuestionList.innerHTML = "";
      
      filteredBySearch.forEach((q, searchIdx) => {
        // Find index of this question in the pre-search list
        const indexInModeList = list.findIndex(item => item.id === q.id);
        
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sidebar-q-item";
        if (state.currentIndex === indexInModeList && list[state.currentIndex]?.id === q.id) {
          btn.classList.add("active");
        }

        // Left block
        const meta = document.createElement("div");
        meta.className = "q-item-meta";
        
        const src = document.createElement("span");
        src.className = "q-item-source";
        src.textContent = q.source;
        
        const title = document.createElement("span");
        title.className = "q-item-title";
        title.textContent = q.question;

        meta.appendChild(src);
        meta.appendChild(title);
        btn.appendChild(meta);

        // Status indicator dot
        const statusDot = document.createElement("span");
        statusDot.className = "q-item-status";
        
        const rating = state.progress[q.id]?.rating;
        if (rating === "known") statusDot.classList.add("known");
        else if (rating === "almost") statusDot.classList.add("almost");
        else if (rating === "again") statusDot.classList.add("again");
        else statusDot.classList.add("unvisited");
        
        btn.appendChild(statusDot);

        // Click event
        btn.addEventListener("click", () => {
          selectQuestionById(q.id);
        });

        li.appendChild(btn);
        els.sidebarQuestionList.appendChild(li);
      });

      if (!filteredBySearch.length) {
        const li = document.createElement("li");
        li.style.padding = "1rem 0.5rem";
        li.style.fontSize = "0.8rem";
        li.style.color = "var(--text-sidebar-secondary)";
        li.style.textAlign = "center";
        li.textContent = "Inga matchande frågor";
        els.sidebarQuestionList.appendChild(li);
      }
    }
  }

  function selectQuestionById(id) {
    const list = currentList();
    const idx = list.findIndex(q => q.id === id);
    if (idx >= 0) {
      state.currentIndex = idx;
      state.revealed = false;
      state.submittedAnswer = "";
      markSuggestedRating("");
      els.answerInput.value = "";
      
      transitionRender();
      els.answerInput.focus();

      // Scroll card into view
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      // Close mobile sidebar menu if open
      els.appSidebar.classList.remove("open");
      els.sidebarOverlay.classList.remove("active");
    }
  }

  /* ==========================================================================
     NAVIGATION & ACTIONS
     ========================================================================== */
  function jumpToRelated(label) {
    const normalized = normalize(label);
    const list = currentList();
    const localMatchIndex = list.findIndex((question) => matchesQuestion(question, normalized));

    if (localMatchIndex >= 0) {
      state.currentIndex = localMatchIndex;
    } else {
      const globalMatch = questions.find((question) => matchesQuestion(question, normalized));
      if (!globalMatch) return;
      state.mode = globalMatch.mode === "repetition" ? "all" : globalMatch.mode;
      state.currentIndex = filteredQuestions().findIndex((question) => question.id === globalMatch.id);
      if (state.currentIndex < 0) state.currentIndex = 0;
    }

    state.revealed = false;
    state.submittedAnswer = "";
    markSuggestedRating("");
    els.answerInput.value = "";
    transitionRender();
    els.answerInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function matchesQuestion(question, normalized) {
    return normalize(question.question).includes(normalized) ||
      normalize(question.id).includes(normalized) ||
      (question.tags || []).some((tag) => normalize(tag).includes(normalized));
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function revealAnswer() {
    if (!currentQuestion()) return;
    state.submittedAnswer = els.answerInput.value.trim();
    state.revealed = true;
    transitionRender();
  }

  function nextQuestion() {
    const list = currentList();
    state.currentIndex = list.length ? (state.currentIndex + 1) % list.length : 0;
    state.revealed = false;
    state.submittedAnswer = "";
    markSuggestedRating("");
    els.answerInput.value = "";
    transitionRender();
    els.answerInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function rateCurrent(rating) {
    const question = currentQuestion();
    if (!question) return;
    state.progress[question.id] = {
      rating,
      answeredAt: new Date().toISOString()
    };
    saveProgress();

    // Trigger reward animation if they got it right or almost right
    if (rating === "known" || rating === "almost") {
      spawnConfetti();
    }

    nextQuestion();
  }

  function resetProgress() {
    const confirmed = confirm("Är du säker på att du vill nollställa alla framsteg?");
    if (!confirmed) return;
    
    state.progress = {};
    localStorage.removeItem(storageKey);
    state.currentIndex = 0;
    state.revealed = false;
    state.submittedAnswer = "";
    state.searchQuery = "";
    if (els.sidebarSearch) els.sidebarSearch.value = "";
    markSuggestedRating("");
    els.answerInput.value = "";
    transitionRender();
    els.answerInput.focus();
  }

  function selfCheckText(question, hasRubric) {
    if (hasRubric) {
      return "Använd den rekommenderade nivån som stöd, men justera själv om du anser att appens kontroll missade en giltig synonym.";
    }
    if (question.mode === "samband") {
      return "Frågan saknar automatisk kontroll. Godkänn om du täckte båda begreppen samt sambandet.";
    }
    if (question.mode === "case") {
      return "Frågan saknar automatisk kontroll. Godkänn om ditt svar använde rätt bolagsdata och rimliga slutsatser.";
    }
    return "Frågan saknar automatisk kontroll. Välj nivå efter hur väl du matchade facit.";
  }

  /* ==========================================================================
     ASSESSMENT AUTOMATION (Rubrics Matcher)
     ========================================================================== */
  function assessAnswer(question, rawAnswer) {
    const rubric = rubrics[question.id];
    if (!rubric) {
      return {
        hasRubric: false,
        matched: ["Facit visas nedan för manuell bedömning."],
        missing: ["Denna fråga saknar kriterie-rubriker."],
        scoreText: "Manuell kontroll",
        suggestedRating: "",
        summary: "Frågan saknar automatisk kontroll. Jämför ditt svar mot facit och välj nivå själv."
      };
    }

    const answer = normalize(rawAnswer);
    const evaluation = evaluateRubric(rubric, answer);
    const ratingLabel = ratingText(evaluation.rating);

    if (!answer) {
      return {
        hasRubric: true,
        matched: ["Inget svar angivet."],
        missing: evaluation.missing,
        scoreText: "Träna igen",
        suggestedRating: "again",
        summary: "Bedömning: Träna igen. Skriv alltid en gissning innan du visar facit!"
      };
    }

    return {
      hasRubric: true,
      matched: evaluation.matched,
      missing: evaluation.missing,
      scoreText: ratingLabel,
      suggestedRating: evaluation.rating,
      summary: `${ratingLabel}. ${evaluation.explanation}`
    };
  }

  function evaluateRubric(rubric, normalizedAnswer) {
    const criterionHits = new Set();
    const matched = [];
    const missing = [];

    rubric.criteria.forEach((criterion) => {
      const hit = criterion.accepted.some((phrase) => normalizedAnswer.includes(normalize(phrase)));
      if (hit) {
        criterionHits.add(criterion.key);
        matched.push(criterion.label);
      } else {
        missing.push(criterion.label);
      }
    });

    (rubric.compound || []).forEach((compound) => {
      const count = compound.from.reduce((sum, key) => sum + (criterionHits.has(key) ? 1 : 0), 0);
      if (count >= compound.minMatches) criterionHits.add(compound.key);
    });

    const correct = rubric.correctRequires.every((key) => criterionHits.has(key));
    const almost = rubric.almostRequiresAny.some((key) => criterionHits.has(key));
    const rating = correct ? "known" : almost ? "almost" : "again";
    const mistake = findRelevantMistake(rubric, rating);

    return {
      rating,
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
    if (rating === "almost") {
      return `Ditt svar täckte en del men missade viktiga detaljer.${mistake ? ` Vanligt misstag: "${mistake}"` : ""}`;
    }
    return `Ditt svar missade de centrala nyckelfraserna i facit.${mistake ? ` Vanligt misstag: "${mistake}"` : ""}`;
  }

  function ratingText(rating) {
    if (rating === "known") return "Bedömning: Rätt";
    if (rating === "almost") return "Bedömning: Nästan";
    return "Bedömning: Träna igen";
  }

  /* ==========================================================================
     EVENT LISTENERS & BINDINGS
     ========================================================================== */
  
  // 1. Sidebar toggler on mobile
  if (els.openSidebarBtn) {
    els.openSidebarBtn.addEventListener("click", () => {
      els.appSidebar.classList.add("open");
      els.sidebarOverlay.classList.add("active");
    });
  }

  if (els.closeSidebarBtn) {
    els.closeSidebarBtn.addEventListener("click", () => {
      els.appSidebar.classList.remove("open");
      els.sidebarOverlay.classList.remove("active");
    });
  }

  if (els.sidebarOverlay) {
    els.sidebarOverlay.addEventListener("click", () => {
      els.appSidebar.classList.remove("open");
      els.sidebarOverlay.classList.remove("active");
    });
  }

  // 2. Real-time Search input
  if (els.sidebarSearch) {
    els.sidebarSearch.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      renderSidebarStatsAndList();
    });
  }

  // 3. Bind standard controls
  els.modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  els.revealButton.addEventListener("click", revealAnswer);
  els.skipButton.addEventListener("click", nextQuestion);
  els.nextButton.addEventListener("click", nextQuestion);
  
  if (els.resetButton) {
    els.resetButton.addEventListener("click", resetProgress);
  }

  els.feedbackButtons.forEach((button) => {
    button.addEventListener("click", () => rateCurrent(button.dataset.rating));
  });

  // 4. Keyboard binding logic
  document.addEventListener("keydown", (event) => {
    // Reveal: Cmd/Ctrl + Enter
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      if (!state.revealed) {
        revealAnswer();
      }
      return;
    }

    if (!state.revealed) return;
    
    // Rating shortcuts: 1, 2, 3
    if (event.key === "1") {
      event.preventDefault();
      rateCurrent("known");
    } else if (event.key === "2") {
      event.preventDefault();
      rateCurrent("almost");
    } else if (event.key === "3") {
      event.preventDefault();
      rateCurrent("again");
    }
  });

  // 5. Initial setup
  render();
  els.answerInput.focus();
})();

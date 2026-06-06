(function () {
  const VERDICTS = {
    correct: {
      title: "Rätt",
      body: "Svaret räcker.",
      suggestedRating: "known",
      scoreInternal: 100
    },
    almost: {
      title: "Nästan",
      body: "Du är nära. Jämför med facit och fyll på det centrala.",
      suggestedRating: "almost",
      scoreInternal: 65
    },
    too_vague: {
      title: "Nästan",
      body: "Svaret är på rätt område men för allmänt. Jämför med facit.",
      suggestedRating: "almost",
      scoreInternal: 45
    },
    confused_with: {
      title: "Jämför med facit",
      body: "Det här låter som ett annat begrepp. Rätt svar står i facit nedan.",
      suggestedRating: "again",
      scoreInternal: 20
    },
    wrong: {
      title: "Jämför med facit",
      body: "Rätt svar står i facit nedan.",
      suggestedRating: "again",
      scoreInternal: 10
    },
    nonsense: {
      title: "Jämför med facit",
      body: "Rätt svar står i facit nedan.",
      suggestedRating: "again",
      scoreInternal: 0
    },
    uncertain: {
      title: "Jämför med facit",
      body: "Jämför ditt svar med facit och välj nivå själv.",
      suggestedRating: "",
      scoreInternal: 0
    }
  };

  const NEGATION_WORDS = new Set(["inte", "ej", "aldrig", "utan"]);
  const OBVIOUS_NOISE = new Set(["gris", "banan", "stol", "asdf", "qwerty", "test"]);

  function normalize(value) {
    return String(value || "").toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s/-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function words(normalized) {
    return normalized ? normalized.split(/\s+/).filter(Boolean) : [];
  }

  function unique(items) {
    return Array.from(new Set(items.filter(Boolean)));
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function conceptList(rubric) {
    const explicit = asArray(rubric.concepts);
    if (explicit.length) return explicit.map(concept => ({
      key: concept.key,
      label: concept.label || concept.key,
      accepted: unique([
        ...asArray(concept.accepted),
        ...asArray(concept.aliases),
        ...asArray(concept.signals)
      ])
    }));

    return asArray(rubric.criteria).map(criterion => ({
      key: criterion.key,
      label: criterion.label || criterion.key,
      accepted: asArray(criterion.accepted)
    }));
  }

  function labelForKey(rubric, key) {
    const concept = conceptList(rubric).find(item => item.key === key);
    if (concept) return concept.label;
    const compound = asArray(rubric.compound).find(item => item.key === key);
    return compound?.label || key;
  }

  function phraseMatches(normalizedAnswer, rawAnswer, phrase, conceptKey) {
    const normalizedPhrase = normalize(phrase);
    if (!normalizedPhrase) return false;
    if (normalizedAnswer.includes(normalizedPhrase)) return true;

    if (conceptKey === "relation") {
      const lowerRaw = String(rawAnswer || "").toLowerCase();
      const hasRelationSymbol = /\/|÷/.test(lowerRaw);
      const hasRelationWord = /\b(andel|del|delat|dividerat|relation|forhallande|finansierad|finansierade)\b/.test(normalizedAnswer);
      const hasEquity = /\b(eget kapital|agarnas kapital|agarnas pengar|agarkapital)\b/.test(normalizedAnswer);
      const hasAssets = /\b(tillgangar|totala tillgangar|balansomslutning)\b/.test(normalizedAnswer);
      return hasEquity && (hasAssets || hasRelationSymbol || hasRelationWord);
    }

    return false;
  }

  function evaluateConcepts(rubric, normalizedAnswer, rawAnswer) {
    const hits = new Set();
    const hitLabels = [];
    const concepts = conceptList(rubric);

    concepts.forEach(concept => {
      const hit = concept.accepted.some(phrase =>
        phraseMatches(normalizedAnswer, rawAnswer, phrase, concept.key)
      );
      if (hit) {
        hits.add(concept.key);
        hitLabels.push(concept.label);
      }
    });

    asArray(rubric.compound).forEach(compound => {
      const count = asArray(compound.from).reduce((sum, key) => sum + (hits.has(key) ? 1 : 0), 0);
      if (count >= compound.minMatches) hits.add(compound.key);
    });

    const required = asArray(rubric.requiredConcepts).length
      ? asArray(rubric.requiredConcepts)
      : asArray(rubric.correctRequires);
    const supporting = asArray(rubric.supportingConcepts).length
      ? asArray(rubric.supportingConcepts)
      : concepts.map(item => item.key).filter(key => !required.includes(key));

    const requiredHits = required.filter(key => hits.has(key));
    const missingRequired = required.filter(key => !hits.has(key));
    const supportingHits = supporting.filter(key => hits.has(key));
    const missingSupporting = supporting.filter(key => !hits.has(key));

    return {
      hits,
      matched: unique(hitLabels),
      required,
      supporting,
      requiredHits,
      missingRequired,
      supportingHits,
      missingSupporting
    };
  }

  function evaluateMisconceptions(rubric, normalizedAnswer) {
    return asArray(rubric.misconceptions).filter(item => {
      const signals = unique([...asArray(item.signals), ...asArray(item.examples)]);
      return signals.some(signal => normalize(signal) && normalizedAnswer.includes(normalize(signal)));
    });
  }

  function hasNegation(normalizedAnswer) {
    return words(normalizedAnswer).some(word => NEGATION_WORDS.has(word));
  }

  function isNonsense(normalizedAnswer, conceptHits, misconceptionHits) {
    const answerWords = words(normalizedAnswer);
    if (!answerWords.length) return true;
    if (answerWords.length === 1 && OBVIOUS_NOISE.has(answerWords[0])) return true;
    if (answerWords.length <= 2 && conceptHits.length === 0 && misconceptionHits.length === 0) return true;
    if (/^(.)\1{3,}$/.test(normalizedAnswer.replace(/\s/g, ""))) return true;
    return false;
  }

  function fillTemplate(template, data) {
    return String(template || "").replace(/\{(\w+)\}/g, (_, key) => data[key] || "");
  }

  function fallbackFeedback(verdict, rubric, data) {
    const base = VERDICTS[verdict] || VERDICTS.uncertain;
    const templates = rubric?.feedbackTemplates || {};
    const bodyTemplate = templates[verdict];
    const titleTemplate = templates[`${verdict}Title`];

    return {
      title: fillTemplate(titleTemplate || base.title, data),
      body: fillTemplate(bodyTemplate || base.body, data),
      memoryRule: rubric?.memoryRule || "",
      contrast: data.contrast || ""
    };
  }

  function missingLabels(rubric, keys) {
    return unique(keys.map(key => labelForKey(rubric, key)));
  }

  function buildAssessment(question, rawAnswer, rubric, verdict, conceptResult, misconceptions, options = {}) {
    const base = VERDICTS[verdict] || VERDICTS.uncertain;
    const confused = misconceptions[0] || null;
    const missingRequiredLabels = missingLabels(rubric, conceptResult?.missingRequired || []);
    const missingSupportingLabels = missingLabels(rubric, conceptResult?.missingSupporting || []);
    const missing = verdict === "correct"
      ? ["Inga centrala delar saknas."]
      : unique([...missingRequiredLabels, ...missingSupportingLabels]).slice(0, 4);
    const matched = conceptResult?.matched?.length
      ? conceptResult.matched
      : ["Inget tydligt kursbegrepp fångat."];

    const core = question?.answer || "facit";
    const missingText = missing.length ? missing.join(", ") : "den centrala kopplingen";
    const misconceptionLabel = confused?.label || "";
    const contrast = confused?.explanation || options.contrast || "";
    const feedback = fallbackFeedback(verdict, rubric, {
      core,
      missing: missingText,
      misconception: misconceptionLabel,
      contrast
    });

    return {
      hasRubric: Boolean(rubric),
      verdict,
      suggestedRating: options.suggestedRating ?? base.suggestedRating,
      scoreInternal: options.scoreInternal ?? base.scoreInternal,
      score: options.scoreInternal ?? base.scoreInternal,
      matched,
      missing,
      confusedWith: confused ? {
        id: confused.id,
        label: confused.label,
        explanation: confused.explanation || ""
      } : null,
      feedback,
      memoryRule: feedback.memoryRule,
      summary: feedback.body,
      signals: {
        conceptHits: conceptResult ? Array.from(conceptResult.hits) : [],
        missingConcepts: conceptResult ? conceptResult.missingRequired : [],
        misconceptionHits: misconceptions.map(item => item.id),
        answerLength: words(normalize(rawAnswer)).length
      }
    };
  }

  function manualAssessment(question, rawAnswer) {
    const normalizedAnswer = normalize(rawAnswer);
    const verdict = normalizedAnswer ? "uncertain" : "nonsense";
    return {
      hasRubric: false,
      verdict,
      suggestedRating: "",
      scoreInternal: 0,
      score: 0,
      matched: ["Facit visas nedan för manuell jämförelse."],
      missing: ["Denna fråga saknar coach-regler än."],
      confusedWith: null,
      feedback: {
        title: normalizedAnswer ? "Jämför själv" : "Inget svar",
        body: normalizedAnswer
          ? "Jämför ditt svar med facit och välj nivå själv."
          : "Skriv gärna en gissning först nästa gång. Jämför nu med facit och välj nivå själv.",
        memoryRule: question?.answer ? "Använd facit som huvudsignal här." : "",
        contrast: ""
      },
      memoryRule: question?.answer ? "Använd facit som huvudsignal här." : "",
      summary: "Jämför ditt svar med facit och välj nivå själv.",
      signals: {
        conceptHits: [],
        missingConcepts: [],
        misconceptionHits: [],
        answerLength: words(normalizedAnswer).length
      }
    };
  }

  function gradeAnswer(question, rawAnswer, rubric) {
    if (!rubric) return manualAssessment(question, rawAnswer);

    const normalizedAnswer = normalize(rawAnswer);
    const conceptResult = evaluateConcepts(rubric, normalizedAnswer, rawAnswer);
    const misconceptions = evaluateMisconceptions(rubric, normalizedAnswer);
    const conceptHits = Array.from(conceptResult.hits);
    const misconceptionHits = misconceptions.map(item => item.id);
    const answerHasNegation = hasNegation(normalizedAnswer);

    if (isNonsense(normalizedAnswer, conceptHits, misconceptionHits)) {
      return buildAssessment(question, rawAnswer, rubric, "nonsense", conceptResult, misconceptions);
    }

    const requiredComplete = conceptResult.required.length
      ? conceptResult.required.every(key => conceptResult.hits.has(key))
      : conceptHits.length > 0;
    const hasRequiredHit = conceptResult.requiredHits.length > 0;
    const hasSupportingHit = conceptResult.supportingHits.length > 0;
    const hasOnlySupportingHit = !hasRequiredHit && hasSupportingHit;

    if (misconceptions.length && !requiredComplete) {
      return buildAssessment(question, rawAnswer, rubric, "confused_with", conceptResult, misconceptions, {
        scoreInternal: 20
      });
    }

    if (misconceptions.length && requiredComplete) {
      return buildAssessment(question, rawAnswer, rubric, "uncertain", conceptResult, misconceptions);
    }

    if (requiredComplete) {
      if (answerHasNegation) {
        return buildAssessment(question, rawAnswer, rubric, "almost", conceptResult, misconceptions, {
          scoreInternal: 70
        });
      }
      return buildAssessment(question, rawAnswer, rubric, "correct", conceptResult, misconceptions);
    }

    if (hasOnlySupportingHit) {
      return buildAssessment(question, rawAnswer, rubric, "too_vague", conceptResult, misconceptions);
    }

    if (hasRequiredHit || conceptHits.length >= 2) {
      return buildAssessment(question, rawAnswer, rubric, "almost", conceptResult, misconceptions);
    }

    if (conceptHits.length === 1) {
      return buildAssessment(question, rawAnswer, rubric, "too_vague", conceptResult, misconceptions);
    }

    return buildAssessment(question, rawAnswer, rubric, "wrong", conceptResult, misconceptions);
  }

  window.FOKUS_GRADER = { gradeAnswer };
})();

import { FOKUS_QUESTIONS } from '../src/logic/questions';
import { ECONOMY_TERM_QUESTIONS } from '../src/logic/economy-terms';
import { FOKUS_RUBRICS } from '../src/logic/rubrics';
import { TERM_RUBRICS } from '../src/logic/term-rubrics';

const FOCUS_ESSAY_COUNT = 30;
const MIN_ESSAY_ANSWER_LENGTH = 120;
const MIN_TERM_ANSWER_LENGTH = 60;
const MIN_WHY_LENGTH = 40;
const MIN_EXAMPLE_LENGTH = 40;

interface Issue {
  id: string;
  level: 'error' | 'warn';
  message: string;
}

const issues: Issue[] = [];

function push(id: string, level: Issue['level'], message: string) {
  issues.push({ id, level, message });
}

function validateOpenQuestion(
  q: { id: string; answer?: string; why?: string; example?: string },
  rubrics: Record<string, unknown>,
  minAnswerLength: number,
  rubricLabel: string
) {
  if (!q.answer?.trim()) {
    push(q.id, 'error', 'Saknar answer (facit)');
  } else if (q.answer.trim().length < minAnswerLength) {
    push(q.id, 'warn', `answer är kort (${q.answer.trim().length} tecken, mål ≥${minAnswerLength})`);
  }

  if (!q.why?.trim()) {
    push(q.id, 'warn', 'Saknar why');
  } else if (q.why.trim().length < MIN_WHY_LENGTH) {
    push(q.id, 'warn', `why är kort (${q.why.trim().length} tecken)`);
  }

  if (!q.example?.trim()) {
    push(q.id, 'warn', 'Saknar example');
  } else if (q.example.trim().length < MIN_EXAMPLE_LENGTH) {
    push(q.id, 'warn', `example är kort (${q.example.trim().length} tecken)`);
  }

  if (!rubrics[q.id]) {
    push(q.id, 'error', `Saknar matchande rubric i ${rubricLabel}`);
  }
}

function validateMcQuestion(q: {
  id: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
}) {
  if (!q.options || q.options.length < 2) {
    push(q.id, 'error', 'MC saknar minst två alternativ');
    return;
  }

  const emptyOption = q.options.findIndex(opt => !opt?.trim());
  if (emptyOption !== -1) {
    push(q.id, 'error', `MC-alternativ ${emptyOption + 1} är tomt`);
  }

  if (q.correctIndex === undefined || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
    push(q.id, 'error', 'MC har ogiltigt correctIndex');
  }

  if (!q.explanation?.trim()) {
    push(q.id, 'warn', 'MC saknar explanation');
  }
}

// --- Essay (FOKUS_QUESTIONS) ---
for (const q of FOKUS_QUESTIONS) {
  if (q.type !== 'open') continue;
  validateOpenQuestion(q, FOKUS_RUBRICS, MIN_ESSAY_ANSWER_LENGTH, 'FOKUS_RUBRICS');
}

const focusQuestions = FOKUS_QUESTIONS.filter(q => q.type === 'open').slice(0, FOCUS_ESSAY_COUNT);

// --- Ekonomibegrepp ---
for (const q of ECONOMY_TERM_QUESTIONS) {
  if (q.type === 'open') {
    validateOpenQuestion(q, TERM_RUBRICS, MIN_TERM_ANSWER_LENGTH, 'TERM_RUBRICS');
  } else if (q.type === 'mc') {
    validateMcQuestion(q);
  }
}

// Warn on orphan rubrics (rubric without question)
for (const rubricId of Object.keys(TERM_RUBRICS)) {
  if (!ECONOMY_TERM_QUESTIONS.some(q => q.id === rubricId)) {
    push(rubricId, 'warn', 'Rubric i TERM_RUBRICS saknar matchande fråga i ECONOMY_TERM_QUESTIONS');
  }
}

const termOpenQuestions = ECONOMY_TERM_QUESTIONS.filter(q => q.type === 'open');
const termMcQuestions = ECONOMY_TERM_QUESTIONS.filter(q => q.type === 'mc');

const errors = issues.filter(i => i.level === 'error');
const warnings = issues.filter(i => i.level === 'warn');

console.log('\n=== Affärsmannaskap — innehållsvalidering ===\n');
console.log(`Essä (öppna): ${FOKUS_QUESTIONS.filter(q => q.type === 'open').length}`);
console.log(`Fokus (tentamen, första ${FOCUS_ESSAY_COUNT}): ${focusQuestions.length}`);
console.log(`Ekonomibegrepp totalt: ${ECONOMY_TERM_QUESTIONS.length} (${termOpenQuestions.length} öppna, ${termMcQuestions.length} MC)\n`);

console.log('--- Fokusfrågor (facit-längd) ---\n');
for (const q of focusQuestions) {
  const len = q.answer?.trim().length ?? 0;
  const rubric = FOKUS_RUBRICS[q.id] ? '✓' : '✗';
  const flag = len < MIN_ESSAY_ANSWER_LENGTH ? ' ⚠' : '';
  const preview = q.question.slice(0, 55).replace(/\n/g, ' ');
  console.log(`${rubric} [${len.toString().padStart(3)}] ${q.id}${flag}`);
  console.log(`     ${preview}…\n`);
}

console.log('--- Ekonomibegrepp (öppna) ---\n');
for (const q of termOpenQuestions) {
  const len = q.answer?.trim().length ?? 0;
  const rubric = TERM_RUBRICS[q.id] ? '✓' : '✗';
  const flag = len < MIN_TERM_ANSWER_LENGTH ? ' ⚠' : '';
  const preview = q.question.slice(0, 55).replace(/\n/g, ' ');
  console.log(`${rubric} [${len.toString().padStart(3)}] ${q.id}${flag}`);
  console.log(`     ${preview}…\n`);
}

console.log('--- Ekonomibegrepp (MC) ---\n');
for (const q of termMcQuestions) {
  const ok = q.options && q.correctIndex !== undefined && q.correctIndex >= 0 && q.correctIndex < q.options.length;
  const expl = q.explanation?.trim() ? '✓' : '⚠';
  const preview = q.question.slice(0, 55).replace(/\n/g, ' ');
  console.log(`${ok ? '✓' : '✗'} ${expl} ${q.id}`);
  console.log(`     ${preview}…\n`);
}

if (warnings.length > 0) {
  console.log('--- Varningar ---\n');
  for (const w of warnings) {
    console.log(`  WARN  ${w.id}: ${w.message}`);
  }
  console.log('');
}

if (errors.length > 0) {
  console.log('--- Fel ---\n');
  for (const e of errors) {
    console.log(`  ERROR ${e.id}: ${e.message}`);
  }
  console.log('');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log(`${warnings.length} varning(ar), 0 fel. Bygget kan fortsätta.\n`);
} else {
  console.log('Alla kontroller OK.\n');
}
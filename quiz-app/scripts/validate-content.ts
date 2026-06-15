import { FOKUS_QUESTIONS } from '../src/logic/questions';
import { FOKUS_RUBRICS } from '../src/logic/rubrics';

const FOCUS_ESSAY_COUNT = 30;
const MIN_ANSWER_LENGTH = 120;
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

const focusQuestions = FOKUS_QUESTIONS.filter(q => q.type === 'open').slice(0, FOCUS_ESSAY_COUNT);

for (const q of FOKUS_QUESTIONS) {
  if (q.type !== 'open') continue;

  if (!q.answer?.trim()) {
    push(q.id, 'error', 'Saknar answer (facit)');
  } else if (q.answer.trim().length < MIN_ANSWER_LENGTH) {
    push(q.id, 'warn', `answer är kort (${q.answer.trim().length} tecken, mål ≥${MIN_ANSWER_LENGTH})`);
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

  if (!FOKUS_RUBRICS[q.id]) {
    push(q.id, 'error', 'Saknar matchande rubric i FOKUS_RUBRICS');
  }
}

const errors = issues.filter(i => i.level === 'error');
const warnings = issues.filter(i => i.level === 'warn');

console.log('\n=== Affärsmannaskap — innehållsvalidering ===\n');
console.log(`Öppna frågor totalt: ${FOKUS_QUESTIONS.filter(q => q.type === 'open').length}`);
console.log(`Fokus (tentamen, första ${FOCUS_ESSAY_COUNT}): ${focusQuestions.length}\n`);

console.log('--- Fokusfrågor (facit-längd) ---\n');
for (const q of focusQuestions) {
  const len = q.answer?.trim().length ?? 0;
  const rubric = FOKUS_RUBRICS[q.id] ? '✓' : '✗';
  const flag = len < MIN_ANSWER_LENGTH ? ' ⚠' : '';
  const preview = q.question.slice(0, 55).replace(/\n/g, ' ');
  console.log(`${rubric} [${len.toString().padStart(3)}] ${q.id}${flag}`);
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
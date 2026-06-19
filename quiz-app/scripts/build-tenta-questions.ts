/**
 * Generates src/logic/tenta-questions.ts from repo markdown sources.
 * Run: npx tsx scripts/build-tenta-questions.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const SOURCE_MD = resolve(REPO_ROOT, 'instuderingsfragor-affarsmannaskap.md');
const PRIO_MD = resolve(REPO_ROOT, 'tentaprio-25.md');
const OUTPUT = resolve(__dirname, '../src/logic/tenta-questions.ts');

type ExamArea = 1 | 2 | 3;
type PriorityLevel = 'high' | 'medium' | 'low';

const EXAM_AREA_MAP: Record<number, ExamArea> = {
  1: 1, 2: 2, 3: 2, 4: 3, 5: 1, 6: 2, 7: 1, 8: 2, 9: 1, 10: 2,
  11: 2, 12: 1, 13: 3, 14: 1, 15: 2, 16: 1, 17: 2, 18: 1, 19: 3, 20: 2,
  21: 1, 22: 3, 23: 2, 24: 1, 25: 2, 26: 2, 27: 2, 28: 1, 29: 1, 30: 2,
  31: 3, 32: 3, 33: 3, 34: 1, 35: 1, 36: 3, 37: 1, 38: 3, 39: 2, 40: 1,
  41: 3, 42: 2, 43: 1, 44: 1, 45: 1, 46: 3, 47: 2, 48: 1, 49: 3, 50: 3,
  51: 3, 52: 3, 53: 3, 54: 2, 55: 1, 56: 1, 57: 1, 58: 1, 59: 1, 60: 1, 61: 2,
};

const AREA_LABELS: Record<ExamArea, string> = {
  1: 'Företagsekonomi & avtalsrätt',
  2: 'Kundbearbetning & kundrelation',
  3: 'Försäljning & förhandlingsteknik',
};

interface ParsedQuestion {
  number: number;
  question: string;
  answer: string;
  source: string;
  hint?: string;
}

interface PriorityMeta {
  prioOrder: number;
  originalNumber: number;
  level: PriorityLevel;
}

function escapeTemplate(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function parseQuestions(md: string): ParsedQuestion[] {
  const sections = md.split(/\n(?=## \d+\. )/);
  const questions: ParsedQuestion[] = [];

  for (const section of sections) {
    const headerMatch = section.match(/^## (\d+)\. (.+?)(?:\n|$)/);
    if (!headerMatch) continue;

    const number = Number(headerMatch[1]);
    const question = headerMatch[2].trim();
    const body = section.slice(headerMatch[0].length).trim();

    const sourceMatch = body.match(/\*\*Källstöd:\*\*\s*(.+?)(?:\n|$)/);
    const source = sourceMatch?.[1]?.trim() ?? 'Handkurerat facit';

    const hintMatch = body.match(/\*\*Kursnotering:\*\*\s*(.+?)(?:\n\n|\n\*\*|$)/s);
    const hint = hintMatch?.[1]?.trim();

    let answer = body;
    if (sourceMatch) {
      answer = answer.replace(/\*\*Källstöd:\*\*.+?(?:\n|$)/, '').trim();
    }
    if (hintMatch) {
      answer = answer.replace(/\*\*Kursnotering:\*\*.+?(?:\n\n|\n\*\*|$)/s, '').trim();
    }

    questions.push({ number, question, answer, source, hint });
  }

  return questions.sort((a, b) => a.number - b.number);
}

function parsePriority(md: string): PriorityMeta[] {
  const sections = md.split(/\n(?=## \d+\. )/);
  const items: PriorityMeta[] = [];

  for (const section of sections) {
    const headerMatch = section.match(/^## (\d+)\. /);
    if (!headerMatch) continue;

    const prioOrder = Number(headerMatch[1]);
    const origMatch = section.match(/urspr\.\s*fr\.\s*(\d+)/i);
    if (!origMatch) continue;

    let level: PriorityLevel = 'medium';
    if (section.includes('★★★')) level = 'high';
    else if (section.includes('★ Buffert') || section.match(/\*\*Prioritet:\*\* ★ /)) {
      level = 'low';
    }

    items.push({
      prioOrder,
      originalNumber: Number(origMatch[1]),
      level,
    });
  }

  return items.sort((a, b) => a.prioOrder - b.prioOrder);
}

function priorityStars(level: PriorityLevel): string {
  if (level === 'high') return '★★★';
  if (level === 'medium') return '★★';
  return '★';
}

function buildOutput(questions: ParsedQuestion[], priorities: PriorityMeta[]): string {
  const prioByOrig = new Map(priorities.map(p => [p.originalNumber, p]));
  const priorityNumbers = new Set(priorities.map(p => p.originalNumber));

  const orderedNumbers = [
    ...priorities.map(p => p.originalNumber),
    ...questions.map(q => q.number).filter(n => !priorityNumbers.has(n)),
  ];

  const byNumber = new Map(questions.map(q => [q.number, q]));

  const blocks = orderedNumbers.map((num) => {
    const q = byNumber.get(num);
    if (!q) throw new Error(`Missing question ${num}`);

    const area = EXAM_AREA_MAP[num];
    const prio = prioByOrig.get(num);
    const tags = [
      AREA_LABELS[area],
      ...(prio ? [`Tentaprio ${priorityStars(prio.level)}`, `Prio ${prio.prioOrder}`] : []),
    ];

    const fields = [
      `    id: "tenta-${num}",`,
      `    mode: "tenta",`,
      `    type: "open",`,
      `    category: "${AREA_LABELS[area]}",`,
      `    source: ${JSON.stringify(q.source)},`,
      `    question: ${JSON.stringify(q.question)},`,
      `    tags: ${JSON.stringify(tags)},`,
      `    answer: \`${escapeTemplate(q.answer)}\`,`,
      `    originalNumber: ${num},`,
      `    examArea: ${area},`,
      `    isPriority: ${prio ? 'true' : 'false'},`,
      ...(prio ? [
        `    priorityOrder: ${prio.prioOrder},`,
        `    priorityLevel: "${prio.level}",`,
      ] : []),
      ...(q.hint ? [`    hint: ${JSON.stringify(q.hint)},`] : []),
    ];

    return `  {\n${fields.join('\n')}\n  }`;
  });

  return `// AUTO-GENERATED by scripts/build-tenta-questions.ts — do not edit by hand.
// Sources: instuderingsfragor-affarsmannaskap.md, tentaprio-25.md
// Generated: ${new Date().toISOString()}

import type { TentaQuestion } from './questions';

export const TENTA_EXAM_INFO = {
  areas: [
    { id: 1 as const, label: "Företagsekonomi & avtalsrätt", questionsOnExam: 6, passAt: 4 },
    { id: 2 as const, label: "Kundbearbetning & kundrelation", questionsOnExam: 6, passAt: 4 },
    { id: 3 as const, label: "Försäljning & förhandlingsteknik", questionsOnExam: 8, passAt: 5 },
  ],
  answerGuide: [
    "Förklara vad begreppet eller modellen betyder",
    "Redogör för hur det används eller varför det är viktigt",
    "Sätt svaret i ett affärsmässigt sammanhang",
    "Ge ett relevant exempel när frågan efterfrågar det",
  ],
  priorityCount: ${priorities.length},
  totalCount: ${questions.length},
} as const;

export const TENTA_QUESTIONS: TentaQuestion[] = [
${blocks.join(',\n')}
];
`;
}

const sourceMd = readFileSync(SOURCE_MD, 'utf-8');
const prioMd = readFileSync(PRIO_MD, 'utf-8');

const questions = parseQuestions(sourceMd);
const priorities = parsePriority(prioMd);

if (questions.length !== 61) {
  throw new Error(`Expected 61 questions, got ${questions.length}`);
}
if (priorities.length !== 25) {
  throw new Error(`Expected 25 priority questions, got ${priorities.length}`);
}

writeFileSync(OUTPUT, buildOutput(questions, priorities), 'utf-8');
console.log(`Wrote ${questions.length} tenta questions (${priorities.length} priority) → ${OUTPUT}`);
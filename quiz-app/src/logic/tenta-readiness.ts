import type { ExamAreaQuestion } from './questions';
import type { CardProgress } from './sm2';
import { TENTA_EXAM_INFO } from './tenta-questions';

export type ReadinessStatus = 'pass' | 'at_risk' | 'fail';

export interface BlockReadiness {
  areaId: 1 | 2 | 3;
  label: string;
  passAt: number;
  questionsOnExam: number;
  totalInPool: number;
  knownCount: number;
  almostCount: number;
  againCount: number;
  unseenCount: number;
  status: ReadinessStatus;
}

export interface TentaReadiness {
  blocks: BlockReadiness[];
  overallStatus: ReadinessStatus;
  passedBlocks: number;
  priorityKnown: number;
  priorityTotal: number;
}

function getRatingCounts(
  questions: Pick<ExamAreaQuestion, 'id'>[],
  progresses: Record<string, CardProgress>
) {
  let known = 0;
  let almost = 0;
  let again = 0;
  let unseen = 0;

  for (const q of questions) {
    const rating = progresses[q.id]?.rating;
    if (rating === 'known') known += 1;
    else if (rating === 'almost') almost += 1;
    else if (rating === 'again') again += 1;
    else unseen += 1;
  }

  return { known, almost, again, unseen };
}

function blockStatus(knownCount: number, passAt: number): ReadinessStatus {
  if (knownCount >= passAt) return 'pass';
  if (knownCount > 0) return 'at_risk';
  return 'fail';
}

function overallStatus(blocks: BlockReadiness[]): ReadinessStatus {
  const allPass = blocks.every(b => b.status === 'pass');
  if (allPass) return 'pass';

  const anyProgress = blocks.some(b => b.knownCount > 0 || b.almostCount > 0);
  if (anyProgress) return 'at_risk';

  return 'fail';
}

export function computeTentaReadiness(
  questions: Array<Pick<ExamAreaQuestion, 'id' | 'examArea' | 'isPriority'>>,
  progresses: Record<string, CardProgress>
): TentaReadiness {
  const blocks = TENTA_EXAM_INFO.areas.map(area => {
    const pool = questions.filter(q => q.examArea === area.id);
    const counts = getRatingCounts(pool, progresses);

    return {
      areaId: area.id,
      label: area.label,
      passAt: area.passAt,
      questionsOnExam: area.questionsOnExam,
      totalInPool: pool.length,
      knownCount: counts.known,
      almostCount: counts.almost,
      againCount: counts.again,
      unseenCount: counts.unseen,
      status: blockStatus(counts.known, area.passAt),
    };
  });

  const priorityPool = questions.filter(q => q.isPriority);
  const priorityCounts = getRatingCounts(
    priorityPool.length > 0 ? priorityPool : questions,
    progresses
  );

  return {
    blocks,
    overallStatus: overallStatus(blocks),
    passedBlocks: blocks.filter(b => b.status === 'pass').length,
    priorityKnown: priorityCounts.known,
    priorityTotal: priorityPool.length > 0 ? priorityPool.length : questions.length,
  };
}

export const READINESS_LABELS: Record<ReadinessStatus, string> = {
  pass: 'Godkänt',
  at_risk: 'På väg',
  fail: 'Inte redo',
};
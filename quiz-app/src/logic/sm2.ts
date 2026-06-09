export interface CardProgress {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview?: string;
  rating?: 'known' | 'almost' | 'again' | '';
  history?: Array<{ rating: string; date: string; score: number }>;
}

export function calculateSM2(
  cardProgress: Partial<CardProgress>,
  qualityRating: 'known' | 'almost' | 'again' | ''
): { easeFactor: number; interval: number; repetitions: number; nextReview: string } {
  const qualityMap = { known: 5, almost: 3, again: 1, '': 1 };
  const quality = qualityMap[qualityRating] || 1;

  let easeFactor = cardProgress.easeFactor ?? 2.5;
  let interval = cardProgress.interval ?? 0;
  let repetitions = cardProgress.repetitions ?? 0;

  if (quality >= 3) {
    repetitions++;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
  } else {
    repetitions = 0;
    interval = 0;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReview = new Date(Date.now() + interval * 86400000).toISOString();

  return { easeFactor, interval, repetitions, nextReview };
}

export function isDue(cardProgress: CardProgress | undefined): boolean {
  if (!cardProgress || !cardProgress.nextReview) return true; // Never seen = due
  return new Date(cardProgress.nextReview) <= new Date();
}

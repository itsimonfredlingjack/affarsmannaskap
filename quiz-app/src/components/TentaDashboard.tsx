import type { JSX } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { TentaReadiness, ReadinessStatus } from '../logic/tenta-readiness';
import { READINESS_LABELS } from '../logic/tenta-readiness';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface TentaDashboardProps {
  readiness: TentaReadiness;
}

const STATUS_ICON: Record<ReadinessStatus, typeof CheckCircle2> = {
  pass: CheckCircle2,
  at_risk: AlertTriangle,
  fail: XCircle,
};

const STATUS_TONE: Record<ReadinessStatus, string> = {
  pass: 'text-success border-success/30 bg-success-muted/15',
  at_risk: 'text-warning border-warning/30 bg-warning-muted/15',
  fail: 'text-danger border-danger/30 bg-danger-muted/15',
};

const BAR_COLOR: Record<ReadinessStatus, string> = {
  pass: 'bg-success',
  at_risk: 'bg-warning',
  fail: 'bg-danger',
};

export function TentaDashboard({ readiness }: TentaDashboardProps): JSX.Element {
  const OverallIcon = STATUS_ICON[readiness.overallStatus];

  return (
    <Card className="mb-6 border-accent/20">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-1">
            Tentastatus
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Varje block kräver minst lika många &quot;Kan&quot; som godkäntgränsen.
          </p>
        </div>
        <Badge
          variant={
            readiness.overallStatus === 'pass'
              ? 'success'
              : readiness.overallStatus === 'at_risk'
              ? 'warning'
              : 'danger'
          }
          className="shrink-0"
        >
          <OverallIcon size={12} className="inline mr-1" />
          {READINESS_LABELS[readiness.overallStatus]}
        </Badge>
      </div>

      <div className="grid gap-3">
        {readiness.blocks.map(block => {
          const Icon = STATUS_ICON[block.status];
          const progressPercent = Math.min(
            100,
            Math.round((block.knownCount / block.passAt) * 100)
          );

          return (
            <div
              key={block.areaId}
              className={`rounded-xl border p-4 ${STATUS_TONE[block.status]}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary leading-snug">
                    Block {String.fromCharCode(64 + block.areaId)} — {block.label}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {block.questionsOnExam} frågor på provet · minst {block.passAt} rätt
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold">
                  <Icon size={14} />
                  {READINESS_LABELS[block.status]}
                </div>
              </div>

              <div className="h-2 rounded-full bg-surface/80 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${BAR_COLOR[block.status]}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="text-xs text-text-secondary">
                <span className="font-semibold text-text-primary">{block.knownCount}</span>
                {' '}av {block.passAt} krävs markerade som Kan
                <span className="text-text-muted">
                  {' '}({block.totalInPool} i övningspoolen)
                </span>
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-text-muted mt-4 pt-3 border-t border-border-subtle">
        Tentaprio: {readiness.priorityKnown} / {readiness.priorityTotal} markerade som Kan ·{' '}
        {readiness.passedBlocks} / 3 block godkända i övningen
      </p>
    </Card>
  );
}
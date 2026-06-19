import type { JSX } from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { TentaReadiness, ReadinessStatus } from '../logic/tenta-readiness';
import { READINESS_LABELS } from '../logic/tenta-readiness';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface TentaDashboardProps {
  readiness: TentaReadiness;
  compact?: boolean;
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

const BLOCK_SHORT: Record<1 | 2 | 3, string> = {
  1: 'Ekonomi & avtal',
  2: 'Kundrelation',
  3: 'Sälj & förhandling',
};

export function TentaDashboard({ readiness, compact = false }: TentaDashboardProps): JSX.Element {
  const OverallIcon = STATUS_ICON[readiness.overallStatus];

  return (
    <Card className="h-full border-accent/20 flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-1">
            Tentastatus
          </p>
          <p className="text-sm text-text-secondary leading-relaxed max-w-prose">
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

      <div className={`grid gap-4 flex-1 ${compact ? 'sm:grid-cols-3' : 'md:grid-cols-3'}`}>
        {readiness.blocks.map(block => {
          const Icon = STATUS_ICON[block.status];
          const progressPercent = Math.min(
            100,
            Math.round((block.knownCount / block.passAt) * 100)
          );

          return (
            <div
              key={block.areaId}
              className={`rounded-xl border p-4 flex flex-col min-h-[168px] ${STATUS_TONE[block.status]}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">
                    Block {String.fromCharCode(64 + block.areaId)}
                  </p>
                  <p className="text-sm font-semibold text-text-primary leading-snug">
                    {BLOCK_SHORT[block.areaId]}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-xs font-semibold">
                  <Icon size={14} />
                  <span className="hidden sm:inline">{READINESS_LABELS[block.status]}</span>
                </div>
              </div>

              <div className="h-2 rounded-full bg-surface/80 overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 motion-reduce:transition-none ${BAR_COLOR[block.status]}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-auto space-y-1">
                <p className="text-lg font-display font-bold text-text-primary tabular-nums">
                  {block.knownCount}
                  <span className="text-sm font-normal text-text-muted"> / {block.passAt} Kan</span>
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {block.questionsOnExam} på provet · {block.totalInPool} i poolen
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
        <span>
          Tentaprio:{' '}
          <span className="font-semibold text-text-primary tabular-nums">
            {readiness.priorityKnown}/{readiness.priorityTotal}
          </span>{' '}
          Kan
        </span>
        <span>
          Block godkända:{' '}
          <span className="font-semibold text-text-primary tabular-nums">
            {readiness.passedBlocks}/3
          </span>
        </span>
      </div>
    </Card>
  );
}
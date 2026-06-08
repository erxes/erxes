import type { QueueStat } from '../../types';
import { fmtDur, fmtNum, fmtPct } from '../../utils';

interface QueueCardProps {
  stat: QueueStat;
  /** Human-readable label for this queue. */
  label?: string;
}

/** Single-queue summary card with key metrics. */
export function QueueCard({ stat, label }: QueueCardProps) {
  const answerRate = stat.answeredRate ?? 0;

  return (
    <div
      className="rounded-xl border bg-card p-4"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <p className="mb-3 text-sm font-semibold truncate">
        {label || stat.queue}
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        <Metric label="Total" value={fmtNum(stat.totalCalls)} />
        <Metric
          label="Answer rate"
          value={fmtPct(answerRate)}
          valueClass={
            answerRate >= 80
              ? 'text-[var(--pos)]'
              : answerRate >= 60
                ? 'text-[var(--warn)]'
                : 'text-[var(--neg)]'
          }
        />
        <Metric
          label="Answered"
          value={fmtNum(stat.answeredCalls)}
          valueClass="text-[var(--pos)]"
        />
        <Metric
          label="Abandoned"
          value={fmtNum(stat.abandonedCalls)}
          valueClass="text-[var(--neg)]"
        />
        <Metric label="Avg wait" value={fmtDur(stat.averageWaitTime)} />
        <Metric label="Avg talk" value={fmtDur(stat.averageTalkTime)} />
      </div>

      {/* Answer-rate progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[var(--pos)] transition-all"
          style={{ width: `${Math.min(answerRate, 100)}%` }}
        />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  valueClass = 'text-foreground',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <span className="text-muted-foreground">{label}</span>
      <span className={`ml-1.5 font-semibold tabular-nums ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

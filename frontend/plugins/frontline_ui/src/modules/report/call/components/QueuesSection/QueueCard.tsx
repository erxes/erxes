import type { QueueStat } from '../../types';
import { fmtDur, fmtNum, fmtPct } from '../../utils';
import { useTranslation } from 'react-i18next';

interface QueueCardProps {
  stat: QueueStat;

  label?: string;
  hint?: string;
}

export function QueueCard({ stat, label, hint }: QueueCardProps) {
  const { t } = useTranslation('frontline');
  const answerRate = stat.answeredRate ?? 0;

  return (
    <div
      className="rounded-xl border bg-card p-4"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <p className="text-sm font-semibold truncate">{label || stat.queue}</p>
      {hint ? (
        <p className="mb-3 mt-0.5 text-xs text-muted-foreground truncate">
          {hint}
        </p>
      ) : (
        <div className="mb-3" />
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        <Metric label={t('total')} value={fmtNum(stat.totalCalls)} />
        <Metric
          label={t('answer-rate')}
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
          label={t('answered')}
          value={fmtNum(stat.answeredCalls)}
          valueClass="text-[var(--pos)]"
        />
        <Metric
          label={t('abandoned')}
          value={fmtNum(stat.abandonedCalls)}
          valueClass="text-[var(--neg)]"
        />
        <Metric label="Avg wait" value={fmtDur(stat.averageWaitTime)} />
        <Metric label="Avg talk" value={fmtDur(stat.averageTalkTime)} />
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
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

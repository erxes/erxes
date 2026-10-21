import {
  getErrorRate,
  useAutomationStatsTraceColumns,
} from '@/automations/components/builder/stats/hooks/useAutomationStatsTraceColumns';
import { TAutomationStatsActivity } from '@/automations/components/builder/stats/hooks/useAutomationStatsActivity';
import { cn, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const CELL_CLASS = {
  complete: 'bg-success',
  waiting: 'bg-warning',
  error: 'bg-destructive',
  empty: 'bg-muted',
};

export const AutomationStatsTraces = ({
  traces,
  formatBucket,
}: Pick<TAutomationStatsActivity, 'traces' | 'formatBucket'>) => {
  const { t } = useTranslation('automations');
  const { columns, errorSegments } = useAutomationStatsTraceColumns(traces);

  return (
    <Tooltip.Provider delayDuration={0}>
      <div className="relative flex h-48 items-stretch gap-[3px]">
        {columns.map(({ bucket, cells }) => (
          <Tooltip key={bucket.start}>
            <Tooltip.Trigger asChild>
              <div className="flex min-w-0 flex-1 flex-col-reverse gap-[3px]">
                {cells.map((cell, index) => (
                  <div
                    key={index}
                    className={cn(
                      'min-h-0 flex-1 rounded-[2px]',
                      CELL_CLASS[cell],
                    )}
                  />
                ))}
              </div>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <div className="flex flex-col gap-0.5 text-xs">
                <span className="font-medium">
                  {formatBucket(bucket.start)}
                </span>
                <span>
                  {t('stats-runs')}: {bucket.total}
                </span>
                {bucket.complete > 0 && (
                  <span>
                    {t('stats-complete')}: {bucket.complete}
                  </span>
                )}
                {bucket.waiting > 0 && (
                  <span>
                    {t('stats-waiting')}: {bucket.waiting}
                  </span>
                )}
                {bucket.error > 0 && (
                  <span>
                    {t('error')}: {bucket.error}
                  </span>
                )}
                {bucket.total > 0 && (
                  <span>
                    {t('stats-error-rate')}: {getErrorRate(bucket)}%
                  </span>
                )}
              </div>
            </Tooltip.Content>
          </Tooltip>
        ))}
        <svg
          viewBox={`0 0 ${columns.length} 100`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
          aria-hidden
        >
          {errorSegments.map((points) => (
            <g key={points}>
              <polyline
                points={points}
                fill="none"
                stroke="var(--background)"
                strokeWidth={5}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points={points}
                fill="none"
                stroke="var(--destructive)"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex justify-between border-t border-dashed pt-2 text-xs text-muted-foreground">
        <span>{traces[0] && formatBucket(traces[0].start)}</span>
        <span>{t('stats-now')}</span>
      </div>
    </Tooltip.Provider>
  );
};

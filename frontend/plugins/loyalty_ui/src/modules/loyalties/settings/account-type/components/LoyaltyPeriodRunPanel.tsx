import { IconClockPlay, IconHistory } from '@tabler/icons-react';
import { format } from 'date-fns';
import { Badge, Button, Popover, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TLoyaltyPeriodRun,
  useLoyaltyPeriodRunStatus,
} from '../hooks/useLoyaltyPeriodRunStatus';

const formatAt = (value: string | Date) =>
  format(new Date(value), 'yyyy-MM-dd HH:mm');

const RUN_BADGE = {
  done: 'success',
  running: 'secondary',
  failed: 'destructive',
} as const;

const PeriodRunRow = ({ run }: { run: TLoyaltyPeriodRun }) => {
  const { t } = useTranslation('loyalty');
  return (
    <div className="flex flex-col gap-1 border-b py-2 last:border-b-0">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{formatAt(run.startedAt)}</span>
        {run.seconds != null && (
          <span className="text-xs text-muted-foreground">{run.seconds}s</span>
        )}
        <Badge variant={RUN_BADGE[run.status]} className="ml-auto">
          {t(`period-run-status-${run.status}`)}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('period-run-counts', {
          released: run.released,
          expired: run.expired,
          reset: run.reset,
          failed: run.failed,
        })}
      </p>
      {run.error && <p className="text-xs text-destructive">{run.error}</p>}
    </div>
  );
};

/**
 * When the wallets' time settings next move points, what that run will do,
 * and how the last runs went; otherwise all of it lives only in the queue.
 */
export const LoyaltyPeriodRunPanel = () => {
  const { t } = useTranslation('loyalty');
  const {
    loading,
    error,
    nextRunAt,
    timeZone,
    preview,
    resetsLabel,
    runs,
    lastRun,
  } = useLoyaltyPeriodRunStatus();

  if (loading) {
    return <Skeleton className="h-12 m-3 mb-0" />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 m-3 mb-0 text-sm">
        <IconClockPlay className="size-5 shrink-0 text-destructive" />
        <span>{t('period-run-error', { message: error.message })}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border px-4 py-3 m-3 mb-0">
      <IconClockPlay className="size-5 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
        {nextRunAt ? (
          <>
            <span className="font-medium">
              {t('period-run-next', { at: formatAt(nextRunAt), timeZone })}
            </span>
            <span className="text-xs text-muted-foreground">
              {t('period-run-preview', {
                releasing: preview?.releasing || 0,
                expiring: preview?.expiring || 0,
              })}
              {resetsLabel &&
                ` · ${t('period-run-resets', { resets: resetsLabel })}`}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">{t('period-run-none')}</span>
        )}
        {lastRun && (
          <span className="text-xs text-muted-foreground">
            {t('period-run-last', { at: formatAt(lastRun.startedAt) })} ·{' '}
            {t(`period-run-status-${lastRun.status}`)}
          </span>
        )}
      </div>
      <Popover>
        <Popover.Trigger asChild>
          <Button variant="ghost" size="sm">
            <IconHistory />
            {t('period-run-history')}
          </Button>
        </Popover.Trigger>
        <Popover.Content align="end" className="w-96 max-h-96 overflow-auto">
          {runs.map((run) => (
            <PeriodRunRow key={run._id} run={run} />
          ))}
          {!runs.length && (
            <p className="py-2 text-sm text-muted-foreground">
              {nextRunAt
                ? t('period-run-history-empty-next', {
                    at: formatAt(nextRunAt),
                  })
                : t('period-run-history-empty')}
            </p>
          )}
        </Popover.Content>
      </Popover>
    </div>
  );
};

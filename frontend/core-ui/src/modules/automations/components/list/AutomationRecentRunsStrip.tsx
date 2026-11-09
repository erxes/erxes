import { useAutomationRecentRunsStrip } from '@/automations/hooks/useAutomationRecentRunsStrip';
import { TAutomationRecentRun } from '@/automations/types';
import { cn, Tooltip } from 'erxes-ui';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const RUN_BAR_CLASS: Record<string, string> = {
  complete: 'bg-success',
  error: 'bg-destructive',
};

const RunBar = ({
  run,
  statusLabel,
  actionLabel,
  onOpen,
}: {
  run: TAutomationRecentRun;
  statusLabel: string;
  actionLabel?: string;
  onOpen: () => void;
}) => (
  <Tooltip>
    <Tooltip.Trigger asChild>
      <button
        type="button"
        aria-label={statusLabel}
        className={cn(
          'h-5 w-1.5 shrink-0 cursor-pointer rounded-[2px] transition-opacity hover:opacity-70',
          RUN_BAR_CLASS[run.status || ''] || 'bg-muted-foreground/30',
        )}
        onClick={(event) => {
          // Rows and cards open the builder on click; a bar opens its run
          event.stopPropagation();
          event.preventDefault();
          onOpen();
        }}
      />
    </Tooltip.Trigger>
    <Tooltip.Content className="space-y-0.5 text-xs">
      <p className="font-medium">{statusLabel}</p>
      {run.createdAt && <p>{format(new Date(run.createdAt), 'PPpp')}</p>}
      {actionLabel && <p>{actionLabel}</p>}
      {run.errorCode && (
        <p className="font-mono text-muted-foreground">{run.errorCode}</p>
      )}
    </Tooltip.Content>
  </Tooltip>
);

/** The latest runs as a pass/fail bar each, with the pass rate beside them. */
export const AutomationRecentRunsStrip = ({
  automationId,
  hideWhenEmpty,
}: {
  automationId: string;
  hideWhenEmpty?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const { isLoaded, timeline, health, openRun, statusLabel, actionLabel } =
    useAutomationRecentRunsStrip(automationId);

  if (!isLoaded || !timeline.length) {
    return hideWhenEmpty ? null : (
      <span className="text-muted-foreground">—</span>
    );
  }

  return (
    <Tooltip.Provider delayDuration={150}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {timeline.map((run) => (
            <RunBar
              key={run._id}
              run={run}
              statusLabel={statusLabel(run.status)}
              actionLabel={
                run.status === 'error'
                  ? actionLabel(run.failedActionType)
                  : undefined
              }
              onOpen={() => openRun(run._id)}
            />
          ))}
        </div>
        {health.passRate !== null && (
          <span
            className={cn(
              'text-xs tabular-nums',
              health.level === 'failing'
                ? 'text-destructive'
                : 'text-muted-foreground',
            )}
            title={t('history-pass-rate')}
          >
            {health.passRate}%
          </span>
        )}
      </div>
    </Tooltip.Provider>
  );
};

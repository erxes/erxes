import { useAutomationRunHealth } from '@/automations/hooks/useAutomationRunHealth';
import { useAutomationRunLabels } from '@/automations/hooks/useAutomationRunLabels';
import { AutomationBuilderTabsType } from '@/automations/types';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Button, cn, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const useAutomationRunHealthBanner = () => {
  const health = useAutomationRunHealth();
  const { actionLabel } = useAutomationRunLabels();
  const [, setQueries] = useMultiQueryState<{
    activeTab: AutomationBuilderTabsType;
    status: string;
  }>(['activeTab', 'status']);

  return {
    health,
    failedActionLabel: actionLabel(health.lastFailure?.failedActionType),
    openFailedRuns: () =>
      setQueries({
        activeTab: AutomationBuilderTabsType.History,
        status: 'error',
      }),
  };
};

/** Says on the canvas that recent runs are failing, without opening history. */
export const AutomationRunHealthBanner = () => {
  const { t } = useTranslation('automations');
  const { health, failedActionLabel, openFailedRuns } =
    useAutomationRunHealthBanner();

  if (!health.level) {
    return null;
  }

  const isFailing = health.level === 'failing';

  return (
    <div
      role="alert"
      className={cn(
        'absolute left-1/2 top-3 z-10 flex max-w-[min(40rem,calc(100%-2rem))] -translate-x-1/2 items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm shadow-sm',
        isFailing
          ? 'border-destructive/40 text-destructive'
          : 'border-warning/40 text-warning',
      )}
    >
      <IconAlertTriangle className="size-4 shrink-0" />
      <span className="truncate">
        {t(isFailing ? 'run-health-failing' : 'run-health-degraded', {
          failed: health.failed,
          count: health.checked,
        })}
        {failedActionLabel &&
          ` · ${t('run-health-failed-at', { action: failedActionLabel })}`}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 shrink-0 px-2 text-xs"
        onClick={openFailedRuns}
      >
        {t('run-health-view-failed-runs')}
      </Button>
    </div>
  );
};

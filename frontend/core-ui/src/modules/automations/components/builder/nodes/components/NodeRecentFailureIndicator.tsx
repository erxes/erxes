import { useAutomationRunHealth } from '@/automations/hooks/useAutomationRunHealth';
import { IconAlertOctagon } from '@tabler/icons-react';
import { Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** Where recent runs stopped, so a failing automation points at its node. */
export const NodeRecentFailureIndicator = ({ nodeId }: { nodeId: string }) => {
  const { t } = useTranslation('automations');
  const { failedActionCounts, checked } = useAutomationRunHealth({
    cacheOnly: true,
  });
  const failed = failedActionCounts[nodeId];

  if (!failed) {
    return null;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span className="flex items-center gap-0.5 text-xs font-medium text-destructive">
            <IconAlertOctagon className="size-4" />
            {failed}/{checked}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Content className="text-xs">
          {t('run-health-node-failed', { failed, count: checked })}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

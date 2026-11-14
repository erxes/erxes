import { useAutomationRunHealth } from '@/automations/hooks/useAutomationRunHealth';
import { useAutomationRunLabels } from '@/automations/hooks/useAutomationRunLabels';
import { AutomationBuilderTabsType } from '@/automations/types';
import { useMultiQueryState } from 'erxes-ui';

/** The canvas banner's numbers, and the jump to the failed runs in history. */
export const useAutomationRunHealthBanner = () => {
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

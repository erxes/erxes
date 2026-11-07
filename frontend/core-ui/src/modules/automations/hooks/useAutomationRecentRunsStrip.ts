import { useAutomationRunLabels } from '@/automations/hooks/useAutomationRunLabels';
import { automationRecentRunsAtomFamily } from '@/automations/states/automationRecentRunsState';
import { automationHistoryViewModeState } from '@/automations/states/automationState';
import { getModulePanelPath } from '@/side-panel/states/modulePanelState';
import { AUTOMATION_HISTORY_PANEL } from '@/automations/components/builder/history/historyPanel';
import {
  AutomationBuilderTabsType,
  AutomationHistoryViewMode,
} from '@/automations/types';
import { getAutomationRunHealth } from '@/automations/utils/automationRunHealth';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAutomationRecentRunsStrip = (automationId: string) => {
  const runs = useAtomValue(automationRecentRunsAtomFamily(automationId));
  const viewMode = useAtomValue(automationHistoryViewModeState);
  const navigate = useNavigate();
  const labels = useAutomationRunLabels();

  const health = useMemo(() => getAutomationRunHealth(runs), [runs]);

  // Oldest on the left, so the strip reads like a timeline
  const timeline = useMemo(() => [...(runs || [])].reverse(), [runs]);

  const openRun = (executionId: string) => {
    const params = new URLSearchParams({
      activeTab: AutomationBuilderTabsType.History,
      executionId,
    });
    if (viewMode !== AutomationHistoryViewMode.Split)
      params.set('panel', getModulePanelPath(AUTOMATION_HISTORY_PANEL));
    navigate(`/automations/edit/${encodeURIComponent(automationId)}?${params}`);
  };

  return {
    isLoaded: runs !== undefined,
    timeline,
    health,
    openRun,
    ...labels,
  };
};

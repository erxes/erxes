import { AUTOMATION_HISTORY_PANEL } from '@/automations/components/builder/history/historyPanel';
import { automationHistoryViewModeState } from '@/automations/states/automationState';
import {
  AutomationBuilderTabsType,
  AutomationHistoryViewMode,
} from '@/automations/types';
import { getModulePanelPath } from '@/side-panel/states/modulePanelState';
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/** Opens one run through the URL-backed history selection and current view mode. */
export const useOpenAutomationRun = (): ((
  automationId: string,
  executionId: string,
) => void) => {
  const viewMode = useAtomValue(automationHistoryViewModeState);
  const navigate = useNavigate();
  return useCallback(
    (automationId: string, executionId: string) => {
      const params = new URLSearchParams({
        activeTab: AutomationBuilderTabsType.History,
        executionId,
      });
      if (viewMode !== AutomationHistoryViewMode.Split)
        params.set('panel', getModulePanelPath(AUTOMATION_HISTORY_PANEL));
      navigate(
        `/automations/edit/${encodeURIComponent(automationId)}?${params}`,
      );
    },
    [viewMode, navigate],
  );
};

import { automationHistorySelectedExecutionState } from '@/automations/states/automationState';
import { AutomationBuilderTabsType } from '@/automations/types';
import { useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/** Opens one run in its automation's History tab. */
export const useOpenAutomationRun = () => {
  const setSelectedExecution = useSetAtom(
    automationHistorySelectedExecutionState,
  );
  const navigate = useNavigate();

  return useCallback(
    (automationId: string, executionId: string) => {
      setSelectedExecution({ automationId, executionId });
      navigate(
        `/automations/edit/${automationId}?activeTab=${AutomationBuilderTabsType.History}`,
      );
    },
    [setSelectedExecution, navigate],
  );
};

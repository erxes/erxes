import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { getActionResultErrorText } from '@/automations/utils/automationHistoryUtils/executionResultPreview';

export const getBranchesResultPreview: TActionResultPreview = (action) => {
  if (action.result?.error) {
    return getActionResultErrorText(action.result.error);
  }

  return action.result?.condition
    ? `Condition: ${action.result.condition}`
    : 'No condition matched';
};

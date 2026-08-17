import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { getActionResultErrorText } from '@/automations/utils/automationHistoryUtils/executionResultPreview';

export const getTransformResultPreview: TActionResultPreview = (action) => {
  if (action.result?.error) {
    return getActionResultErrorText(action.result.error);
  }

  const total = Object.keys(action.result?.data || {}).length;

  return total ? `${total} field${total > 1 ? 's' : ''} produced` : 'No output';
};

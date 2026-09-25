import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { getActionResultErrorText } from '@/automations/utils/automationHistoryUtils/executionResultPreview';

export const getSendEmailResultPreview: TActionResultPreview = (action) => {
  const error = action.result?.response?.error;

  return error ? getActionResultErrorText(error) : 'Sent successfully';
};

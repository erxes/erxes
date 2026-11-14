import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import {
  getActionErrorMessage,
  toSingleLine,
} from '@/automations/utils/automationHistoryUtils/actionResultShape';

export const getSendEmailResultPreview: TActionResultPreview = (action) => {
  const error = action.result?.response?.error;

  return error
    ? toSingleLine(getActionErrorMessage(error))
    : 'Sent successfully';
};

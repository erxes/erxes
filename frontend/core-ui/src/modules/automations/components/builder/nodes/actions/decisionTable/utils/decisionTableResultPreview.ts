import { TActionResultPreview } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { getActionResultErrorText } from '@/automations/utils/automationHistoryUtils/executionResultPreview';

export type TDecisionTableActionResult = {
  data?: Record<string, unknown>;
  matched?: boolean;
  usedDefault?: boolean;
  matchedRow?: number | null;
  inputs?: Record<string, unknown>;
  emptyInputs?: string[];
  error?: unknown;
};

export const getDecisionTableResultPreview: TActionResultPreview = (action) => {
  const result: TDecisionTableActionResult | undefined = action.result;

  if (result?.error) {
    return getActionResultErrorText(result.error);
  }

  return result?.matched
    ? `Row ${result.matchedRow} matched`
    : 'No row matched; default used';
};

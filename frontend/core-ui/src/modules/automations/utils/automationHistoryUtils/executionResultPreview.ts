import {
  getActionErrorMessage,
  toSingleLine,
} from '@/automations/utils/automationHistoryUtils/actionResultShape';
import {
  EXECUTION_STATUS_LABEL_KEYS,
  getExecutionActionStatus,
  TExecutionStatus,
} from '@/automations/utils/automationHistoryUtils/executionFormat';
import { TFunction } from 'i18next';
import { IAutomationHistoryAction } from 'ui-modules';

export type TActionStatusView = {
  status: Exclude<TExecutionStatus, 'success'>;
  message?: string;
  code?: string;
  details?: unknown;
};

/**
 * Every outcome but success is the engine's, so it reads the same for every
 * action; an action's own renderer is only asked to lay out a success.
 */
export const readActionStatus = (
  action: IAutomationHistoryAction,
): TActionStatusView | null => {
  const status = getExecutionActionStatus(action);

  if (status === 'success') {
    return null;
  }

  if (status === 'error') {
    return {
      status,
      message: getActionErrorMessage(action.result?.error),
      code: action.errorCode,
      details: action.result?.result,
    };
  }

  if (status === 'skipped') {
    const reason = action.skipReason ?? action.result?.reason;

    return {
      status,
      message: typeof reason === 'string' ? reason : undefined,
      details: action.result,
    };
  }

  return { status, details: action.result };
};

export const getActionStatusPreview = (
  { status, message }: TActionStatusView,
  t: TFunction,
) => {
  if (status === 'error' && message) {
    return toSingleLine(message);
  }

  const label = t(EXECUTION_STATUS_LABEL_KEYS[status]);

  return message ? `${label} · ${toSingleLine(message)}` : label;
};

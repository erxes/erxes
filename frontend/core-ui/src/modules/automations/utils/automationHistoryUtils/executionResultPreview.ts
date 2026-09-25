import { stringifyAutomationHistoryValue } from '@/automations/components/builder/history/components/AutomationHistoryPopoverValue';
import { IAutomationHistoryAction } from 'ui-modules';

const PREVIEW_MAX_LENGTH = 120;

const toSingleLine = (text: string) =>
  text.replace(/\s+/g, ' ').trim().slice(0, PREVIEW_MAX_LENGTH);

export const getActionResultErrorText = (value: unknown) =>
  toSingleLine(stringifyAutomationHistoryValue(value)) || 'Action failed';

/**
 * Used when an action registers no preview of its own — every action gets a
 * readable cell without the history table having to know about it.
 */
export const getGenericActionResultPreview = (
  action: IAutomationHistoryAction,
) => {
  if (!action.result) {
    return action.status === 'waiting'
      ? 'Waiting'
      : 'Result has not been recorded yet';
  }

  if (action.result.error) {
    return getActionResultErrorText(action.result.error);
  }

  return (
    toSingleLine(stringifyAutomationHistoryValue(action.result)) || 'Completed'
  );
};

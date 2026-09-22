import { getCoreActionResultPreview } from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { getGenericActionResultPreview } from '@/automations/utils/automationHistoryUtils/executionResultPreview';
import { IAutomationHistoryAction } from 'ui-modules';

/**
 * The single line shown in a history table row. Actions register a plain
 * function beside their result component; everything else — including plugin
 * actions — falls back to the generic one-liner.
 */
export const getActionResultPreview = (action: IAutomationHistoryAction) => {
  const preview = getCoreActionResultPreview(action.actionType);

  return preview ? preview(action) : getGenericActionResultPreview(action);
};

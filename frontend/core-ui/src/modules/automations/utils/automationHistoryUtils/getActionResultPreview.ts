import { getCoreActionResultPreview } from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { getResultShapePreview } from '@/automations/utils/automationHistoryUtils/actionResultShape';
import {
  getActionStatusPreview,
  readActionStatus,
} from '@/automations/utils/automationHistoryUtils/executionResultPreview';
import { TFunction } from 'i18next';
import { IAutomationHistoryAction } from 'ui-modules';

/**
 * The single line shown in a history table row. The engine's outcome comes
 * first; a success is described by the action's own preview, or by the shape
 * of what it returned.
 */
export const getActionResultPreview = (
  action: IAutomationHistoryAction,
  t: TFunction,
) => {
  const preview = getCoreActionResultPreview(action.actionType);
  const statusView = readActionStatus(action);

  // Waiting is what delay and wait-event exist to do; they describe it best
  if (statusView && !(statusView.status === 'waiting' && preview)) {
    return getActionStatusPreview(statusView, t);
  }

  return preview ? preview(action) : getResultShapePreview(action.result);
};

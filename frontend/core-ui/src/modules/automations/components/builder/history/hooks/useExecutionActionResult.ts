import {
  getCoreAutomationActionComponent,
  isCoreAutomationActionType,
} from '@/automations/components/builder/nodes/actions/coreAutomationActions';
import { TAutomationActionComponent } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { readActionStatus } from '@/automations/utils/automationHistoryUtils/executionResultPreview';
import { IAutomationHistoryAction } from 'ui-modules';

export const useExecutionActionResult = (action: IAutomationHistoryAction) => {
  const CoreActionResult = isCoreAutomationActionType(
    action.actionType,
    TAutomationActionComponent.ActionResult,
  )
    ? getCoreAutomationActionComponent(
        action.actionType,
        TAutomationActionComponent.ActionResult,
      )
    : null;
  const statusView = readActionStatus(action);

  // Waiting is what delay and wait-event exist to do; they describe it best
  const engineOutcome =
    statusView && !(statusView.status === 'waiting' && CoreActionResult)
      ? statusView
      : null;

  return { CoreActionResult, engineOutcome };
};

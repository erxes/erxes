import {
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_EXECUTION_STATUS,
} from 'erxes-api-shared/core-modules';
import { claimWaitEvent } from './resolveWaitEvent';
import { IModels } from '../connectionResolver';
import { debugError } from '../debugger';
import { executeActions } from './executeActions';
import { IAutomationWaitingActionDocument } from '../mongo/waitingActionsToExecute';
import { getExecutionActionsMap } from '../utils/utils';

export const executeWaitingAction = async (
  subdomain: string,
  models: IModels,
  waitingAction: IAutomationWaitingActionDocument,
) => {
  const automation = await models.Automations.findOne({
    _id: waitingAction.automationId,
  });
  if (!automation) {
    throw new Error('Automation not found');
  }
  const waitingExecution = await models.Executions.findOne({
    _id: waitingAction.executionId,
  });

  if (!waitingExecution) {
    throw new Error('Execution not found');
  }

  // Child executions wait on workflow member actions, so the lookup must go
  // through the execution-aware map instead of the root actions list.
  const actionsMap = await getExecutionActionsMap(automation, waitingExecution);
  const currentAction = actionsMap[waitingAction.currentActionId];

  if (!currentAction) {
    waitingExecution.status = AUTOMATION_EXECUTION_STATUS.MISSID;
    waitingExecution.save();
    throw new Error('Automation waiting action not found');
  }

  const { responseActionId } = waitingAction || {};

  // A wait event may also time out: whichever comes first resumes the run.
  if (currentAction.type === AUTOMATION_CORE_ACTIONS.WAIT_EVENT) {
    const claimed = await claimWaitEvent(models, {
      executionId: waitingExecution._id,
      actionId: currentAction.id,
      outcome: 'met',
    });

    if (!claimed) {
      await models.WaitingActions.deleteOne({ _id: waitingAction._id });
      return;
    }

    return await executeActions(
      subdomain,
      claimed.triggerType,
      claimed,
      actionsMap,
      responseActionId,
    );
  }

  return await executeActions(
    subdomain,
    waitingExecution.triggerType,
    waitingExecution,
    actionsMap,
    responseActionId,
  )
    .then(async () => {
      await models.WaitingActions.deleteOne({ _id: waitingAction._id });
    })
    .catch((err) => {
      debugError(`Error executing actions: ${err.message}`);
      throw err;
    });
};

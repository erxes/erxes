import { AUTOMATION_EXECUTION_STATUS } from 'erxes-api-shared/core-modules';
import { IModels } from '@/connectionResolver';
import { debugError } from '@/debuuger';
import { executeActions } from '@/executions/executeActions';
import { IAutomationWaitingActionDocument } from '@/mongo/waitingActionsToExecute';
import { getActionsMap } from '@/utils';

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

  const currentAction = automation.actions.find(
    (action) => action.id === waitingAction.currentActionId,
  );

  if (!currentAction) {
    waitingExecution.status = AUTOMATION_EXECUTION_STATUS.MISSID;
    waitingExecution.save();
    throw new Error('Automation waiting action not found');
  }

  const { responseActionId } = waitingAction || {};

  return await executeActions(
    subdomain,
    waitingExecution.triggerType,
    waitingExecution,
    await getActionsMap(automation.actions || []),
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

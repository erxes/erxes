import { IModels } from '../connectionResolver';
import { getExecutionActionsMap } from '../utils/utils';
import { executeActions } from './executeActions';
import {
  AUTOMATION_EXECUTION_STATUS,
  AUTOMATION_STATUSES,
} from 'erxes-api-shared/core-modules';

export const repeatActionExecution = async (
  subdomain: string,
  models: IModels,
  repeatOptions: {
    executionId: string;
    actionId: string;
    optionalConnectId?: string;
  },
) => {
  const { executionId, actionId, optionalConnectId } = repeatOptions;
  const execution = await models.Executions.findOne({ _id: executionId });
  if (!execution) {
    throw new Error('Execution not found');
  }

  const automation = await models.Automations.findOne({
    _id: execution.automationId,
    status: AUTOMATION_STATUSES.ACTIVE,
  });
  if (!automation) {
    throw new Error('Automation not found');
  }

  const actionsMap = await getExecutionActionsMap(automation, execution);
  const currentAction = actionsMap[actionId];

  if (!currentAction) {
    throw new Error('Action not found');
  }

  // Positional "next" fallback comes from the execution's own action scope:
  // workflow members for child executions, root actions otherwise
  const scopedActions = execution.workflowId
    ? (automation.workflows || []).find(({ id }) => id === execution.workflowId)
        ?.actions || []
    : automation.actions || [];
  const actionIndex = scopedActions.findIndex(
    (action) => action.id === actionId,
  );
  const nextExecutedAction =
    actionIndex === -1 ? undefined : scopedActions[actionIndex + 1];

  let nextExecutedActionId = nextExecutedAction?.id;

  if (optionalConnectId) {
    const { optionalConnects = [] } = currentAction.config || {};
    const optionalConnect = optionalConnects.find(
      (connect) => connect.optionalConnectId === optionalConnectId,
    );
    if (optionalConnect) {
      nextExecutedActionId = optionalConnect.actionId;
    }
  }

  if (nextExecutedActionId) {
    execution.status = AUTOMATION_EXECUTION_STATUS.WAITING;
    await execution.save();
    await executeActions(
      subdomain,
      execution.triggerType,
      execution,
      actionsMap,
      nextExecutedActionId,
    );
  }

  // Lets the caller exclude this automation from fresh trigger processing
  // of the same event
  return automation._id;
};

import { IModels } from '@/connectionResolver';
import { getActionsMap } from '@/utils/utils';
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
  console.log({ executionId, actionId, optionalConnectId });
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

  const { actions = [] } = automation || {};

  const actionsMap = await getActionsMap(actions || []);

  const actionIndex = actions.findIndex((action) => action.id === actionId);

  if (actionIndex === -1) {
    throw new Error('Action not found');
  }
  const nextExecutedAction = actions[actionIndex + 1];

  let nextExecutedActionId = nextExecutedAction?.id;
  console.log({ nextExecutedActionId });

  if (optionalConnectId) {
    const { optionalConnects = [] } = nextExecutedAction?.config || {};
    console.log({ optionalConnects });
    const optionalConnect = optionalConnects.find(
      (connect) => connect.optionalConnectId === optionalConnectId,
    );
    console.log({ optionalConnect });
    if (optionalConnect) {
      nextExecutedActionId = optionalConnect.actionId;
      console.log({ nextExecutedActionId });
    }
  }

  if (nextExecutedAction) {
    console.log({ nextExecutedActionId });
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
};

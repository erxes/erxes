import { IModels, generateModels } from '../connectionResolver';
import { ACTIONS } from '../constants';
import { getActionsMap } from '../helpers';
import { IAction } from '../models/definitions/automaions';
import { EXECUTION_STATUS } from '../models/definitions/executions';
import { executeActions } from '../utils';

export const playWait = async (models: IModels, subdomain: string, data) => {
  const { type, actionType, targets } = data;

  let filter: any = {
    waitingActionId: { $ne: null },
    startWaitingDate: { $ne: null }
  };

  if (type) {
    filter = { ...filter, 'actions.actionType': type };
  }

  const waitingExecutions = await models.Executions.find(filter);

  for (let exec of waitingExecutions) {
    const automation = await models.Automations.findOne({
      _id: exec.automationId
    }).lean();

    if (!automation) {
      continue;
    }

    const currentAction: IAction | undefined = automation.actions.find(
      a => a.type === ACTIONS.WAIT && a.id === exec.waitingActionId
    );

    if (!currentAction) {
      // waiting action is deleted or changed type from interface
      exec.waitingActionId = undefined;
      exec.startWaitingDate = undefined;
      exec.status = EXECUTION_STATUS.MISSID;
      exec.save();
      continue;
    }

    if (actionType !== 'delay') {
      return handleOptionalConnect(exec, currentAction, targets);
    }
    return await handleDelay(subdomain, automation, exec, currentAction);
  }
};

const handleOptionalConnect = (exec, currentAction, targets = []) => {
  if (!currentAction?.config?.optionalConnects?.length) {
    return;
  }

  const optionalConnections = currentAction.config.optionalConnects;

  for (const target of targets) {
    const { objToCheck } = exec;
    const { propertyName, general } = objToCheck;

    for (const [key, value] of Object.entries(general)) {
      // if()
    }
  }
};

const handleDelay = async (subdomain, automation, exec, currentAction) => {
  if (
    !exec.startWaitingDate ||
    !currentAction.config ||
    !currentAction.config.value
  ) {
    return;
  }

  const finalWaitHour =
    currentAction.config.type === 'hour'
      ? currentAction.config.value
      : currentAction.config.value * 24;
  const performDate = new Date(
    exec.startWaitingDate.getTime() + (finalWaitHour || 0) * 60 * 60 * 1000
  );

  if (performDate > new Date()) {
    return;
  }

  exec.waitingActionId = undefined;
  exec.startWaitingDate = undefined;
  exec.save();

  await executeActions(
    subdomain,
    exec.triggerType,
    exec,
    await getActionsMap(automation.actions || []),
    currentAction.nextActionId
  );
};

export const setActionWait = async (subdomain: string, data) => {
  const { waitActionId, objToCheck, execution } = data;

  const models = await generateModels(subdomain);

  await models.Executions.createExecution({
    ...execution,
    status: EXECUTION_STATUS.WAITING,
    // waitingActionId: waitActionId,
    startWaitingDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
    objToCheck
  });
  return 'success';
};

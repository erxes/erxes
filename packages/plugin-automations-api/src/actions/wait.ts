import { IModels, generateModels } from '../connectionResolver';
import { ACTIONS } from '../constants';
import { getActionsMap } from '../helpers';
import { IAction, IAutomation } from '../models/definitions/automaions';
import {
  EXECUTION_STATUS,
  IExecAction,
  IExecutionDocument
} from '../models/definitions/executions';
import { executeActions, receiveTrigger } from '../utils';

export const playWait = async (models: IModels, subdomain: string, data) => {
  const waitingExecutions = await models.Executions.find({
    waitingActionId: { $ne: null },
    startWaitingDate: { $ne: null }
  });

  for (const exec of waitingExecutions) {
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

    if (
      !exec.startWaitingDate ||
      !currentAction.config ||
      !currentAction.config.value
    ) {
      continue;
    }

    const finalWaitHour =
      currentAction.config.type === 'hour'
        ? currentAction.config.value
        : currentAction.config.value * 24;
    const performDate = new Date(
      exec.startWaitingDate.getTime() + (finalWaitHour || 0) * 60 * 60 * 1000
    );

    if (performDate > new Date()) {
      continue;
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
  }
};

export const doWaitingResponseAction = async (
  models: IModels,
  subdomain,
  data
) => {
  const { type, targets } = data;

  const waitingExecutions = await models.Executions.find({
    status: EXECUTION_STATUS.WAITING,
    $and: [
      { objToCheck: { $exists: true } },
      { objToCheck: { $ne: null } },
      { waitingActionId: { $exists: true } },
      { waitingActionId: { $ne: null } }
    ]
  });

  for (const exec of waitingExecutions) {
    console.log(exec);
    const automation = await models.Automations.findOne({
      _id: exec.automationId
    }).lean();

    if (!automation) {
      continue;
    }

    const currentAction = automation.actions.find(
      action => action.id === exec.waitingActionId
    );

    if (!currentAction) {
      // waiting action is deleted or changed type from interface
      exec.waitingActionId = undefined;
      exec.startWaitingDate = undefined;
      exec.status = EXECUTION_STATUS.MISSID;
      exec.objToCheck = undefined;
      exec.save();
      continue;
    }

    if (!currentAction?.config?.optionalConnects?.length) {
      exec.objToCheck = undefined;
      exec.waitingActionId = undefined;
      exec.startWaitingDate = undefined;
      exec.save();
    }

    const optionalConnects = currentAction.config.optionalConnects;
    const { objToCheck } = exec;
    const { propertyName, general } = objToCheck;

    const generalKeys = Object.keys(general);

    function accessNestedObject(obj, keys) {
      return keys.reduce((acc, key) => acc && acc[key], obj);
    }

    for (const target of targets) {
      if (generalKeys.every(key => target[key] === general[key])) {
        console.log({ target, propertyNames: propertyName.split('.') });
        const propertyValue = accessNestedObject(
          target,
          propertyName.split('.')
        );
        if (propertyValue) {
          const optionalConnection = optionalConnects.find(
            ({ optionalConnectId }) =>
              optionalConnectId === String(propertyValue)
          );

          console.log({ optionalConnection, optionalConnects, propertyName });
          if (optionalConnection) {
            exec.waitingActionId = undefined;
            exec.startWaitingDate = undefined;
            exec.objToCheck = undefined;
            exec.save();

            await executeActions(
              subdomain,
              exec.triggerType,
              exec,
              await getActionsMap(automation.actions || []),
              optionalConnection.actionId
            );
          }
        }
      }
    }
  }

  return 'success';
};

export const setActionWait = async (subdomain: string, data) => {
  const { objToCheck, execution, action, result } = data;

  const execAction: IExecAction = {
    actionId: action.id,
    actionType: action.type,
    actionConfig: action.config,
    nextActionId: action.nextActionId,
    result
  };

  execution.waitingActionId = action.id;

  execution.actions = [...(execution.actions || []), execAction];
  execution.objToCheck = objToCheck;
  execution.status = EXECUTION_STATUS.WAITING;
  await execution.save();

  return 'paused';
};

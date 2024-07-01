import { debugError } from '@erxes/api-utils/src/debuggers';
import { IModels } from '../connectionResolver';
import { getActionsMap } from '../helpers';
import { IAction } from '../models/definitions/automaions';
import {
  EXECUTION_STATUS,
  IExecAction,
  IExecutionDocument
} from '../models/definitions/executions';
import { executeActions } from '../utils';
import * as moment from 'moment';

function accessNestedObject(obj, keys) {
  return keys.reduce((acc, key) => acc && acc[key], obj) || '';
}

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
      a => a.id === exec.waitingActionId
    );

    if (!currentAction) {
      // waiting action is deleted or changed type from interface
      exec.waitingActionId = undefined;
      exec.startWaitingDate = undefined;
      exec.status = EXECUTION_STATUS.MISSID;
      exec.save();
      continue;
    }

    if (!exec.startWaitingDate) {
      continue;
    }

    if (
      currentAction.type === 'delay' &&
      (!currentAction.config || !currentAction.config.value)
    ) {
      continue;
    }

    let performDate = new Date(exec.startWaitingDate);
    let nextActionId = exec.waitingActionId;

    if (currentAction.type === 'delay') {
      const { value, type } = currentAction.config;
      performDate = new Date(
        moment(performDate).add(value, type).toISOString()
      );
      nextActionId = currentAction.nextActionId;
    }

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
      nextActionId
    );
  }
};

export const doWaitingResponseAction = async (
  models: IModels,
  subdomain: string,
  data,
  waitingExecution: IExecutionDocument
) => {
  const { type, targets } = data;

  const clearExecution = (exec: IExecutionDocument, status?: string) => {
    exec.responseActionId = undefined;
    exec.startWaitingDate = undefined;
    exec.objToCheck = undefined;

    if (status) {
      exec.status = status;
    }

    exec.save().catch(err => {
      debugError(`Error saving execution: ${err.message}`);
    });
  };

  const { automationId, responseActionId, objToCheck, triggerType } =
    waitingExecution;

  const automation = await models.Automations.findOne({
    _id: automationId
  })
    .lean()
    .catch(err => {
      debugError(`Error finding automation: ${err.message}`);
      throw new Error('Automation not found');
    });

  if (!automation) {
    throw new Error('Automation not found');
  }

  const currentAction = automation.actions.find(
    action => action.id === responseActionId
  );

  if (!currentAction) {
    clearExecution(waitingExecution, EXECUTION_STATUS.MISSID);
    throw new Error('Automation waiting action not found');
  }

  const { config } = currentAction;

  if (!config?.optionalConnects?.length) {
    clearExecution(waitingExecution, EXECUTION_STATUS.ERROR);
    throw new Error('There are no optional connections');
  }

  const optionalConnects = config.optionalConnects;
  const { propertyName, general } = objToCheck;

  for (const target of targets) {
    const generalKeys = Object.keys(general);
    const propertyValue = accessNestedObject(target, propertyName.split('.'));
    const optionalConnection = optionalConnects.find(
      ({ optionalConnectId }) => optionalConnectId === String(propertyValue)
    );
    if (!optionalConnection || !optionalConnection.actionId) {
      continue;
    }

    if (generalKeys.every(key => target[key] === general[key])) {
      waitingExecution.responseActionId = undefined;
      waitingExecution.startWaitingDate = undefined;
      waitingExecution.objToCheck = undefined;

      return await executeActions(
        subdomain,
        triggerType,
        waitingExecution,
        await getActionsMap(automation.actions || []),
        optionalConnection.actionId
      ).catch(err => {
        debugError(`Error executing actions: ${err.message}`);
        throw err;
      });
    }
  }

  return 'success';
};

export const setActionWait = async data => {
  const {
    objToCheck,
    startWaitingDate,
    waitingActionId,
    execution,
    action,
    result
  } = data;

  const execAction: IExecAction = {
    actionId: action.id,
    actionType: action.type,
    actionConfig: action.config,
    nextActionId: action.nextActionId,
    result
  };

  execution.waitingActionId = waitingActionId;
  execution.responseActionId = action.id;

  execution.startWaitingDate = startWaitingDate;

  execution.actions = [...(execution.actions || []), execAction];
  execution.objToCheck = objToCheck;
  execution.status = EXECUTION_STATUS.WAITING;
  await execution.save();

  return 'paused';
};

export const checkWaitingResponseAction = async (
  models: IModels,
  type: string,
  actionType: string,
  targets: any[]
) => {
  if (actionType) {
    false;
  }

  const waitingResponseExecution = await models.Executions.find({
    triggerType: type,
    status: EXECUTION_STATUS.WAITING,
    objToCheck: { $exists: true, $ne: null },
    responseActionId: { $exists: true }
  }).sort({ createdAt: -1 });

  for (const waitingExecution of waitingResponseExecution) {
    const { objToCheck, actions = [] } = waitingExecution;
    const { general, propertyName } = objToCheck;

    const generalKeys = Object.keys(general);
    for (const target of targets) {
      const valueToCheck = accessNestedObject(target, propertyName.split('.'));

      if (generalKeys.every(key => target[key] === general[key])) {
        for (const { actionConfig } of actions) {
          if (
            (actionConfig?.optionalConnects || []).some(
              ({ optionalConnectId }) => optionalConnectId == valueToCheck
            )
          ) {
            return waitingExecution;
          }
        }
      }
    }
  }
};

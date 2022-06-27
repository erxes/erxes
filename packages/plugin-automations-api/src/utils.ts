import {
  IActionsMap,
  ITrigger,
  TriggerType
} from './models/definitions/automaions';

import { ACTIONS } from './constants';
import {
  EXECUTION_STATUS,
  IExecAction,
  IExecutionDocument
} from './models/definitions/executions';

import { getActionsMap } from './helpers';
import { sendCommonMessage, sendSegmentsMessage } from './messageBroker';

import { debugBase } from '@erxes/api-utils/src/debuggers';
import { IModels } from './connectionResolver';

export const getEnv = ({
  name,
  defaultValue
}: {
  name: string;
  defaultValue?: string;
}): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (!value) {
    debugBase(`Missing environment variable configuration for ${name}`);
  }

  return value || '';
};

export const isInSegment = async (
  subdomain: string,
  segmentId: string,
  targetId: string
) => {
  const response = await sendSegmentsMessage({
    subdomain,
    action: 'isInSegment',
    data: { segmentId, idToCheck: targetId },
    isRPC: true
  });

  return response;
};

export const executeActions = async (
  subdomain: string,
  triggerType: string,
  execution: IExecutionDocument,
  actionsMap: IActionsMap,
  currentActionId?: string
): Promise<string | null | undefined> => {
  if (!currentActionId) {
    execution.status = EXECUTION_STATUS.COMPLETE;
    await execution.save();

    return 'finished';
  }

  const action = actionsMap[currentActionId];
  if (!action) {
    execution.status = EXECUTION_STATUS.MISSID;
    await execution.save();

    return 'missed action';
  }

  execution.status = EXECUTION_STATUS.ACTIVE;

  const execAction: IExecAction = {
    actionId: currentActionId,
    actionType: action.type,
    actionConfig: action.config,
    nextActionId: action.nextActionId
  };

  let actionResponse: any = null;

  try {
    if (action.type === ACTIONS.WAIT) {
      execution.waitingActionId = action.id;
      execution.startWaitingDate = new Date();
      execution.status = EXECUTION_STATUS.WAITING;
      execution.actions = [...(execution.actions || []), execAction];
      await execution.save();
      return 'paused';
    }

    if (action.type === ACTIONS.IF) {
      let ifActionId;

      const isIn = await isInSegment(
        subdomain,
        action.config.contentId,
        execution.targetId
      );
      if (isIn) {
        ifActionId = action.config.yes;
      } else {
        ifActionId = action.config.no;
      }

      execAction.nextActionId = ifActionId;
      execAction.result = { condition: isIn };
      execution.actions = [...(execution.actions || []), execAction];
      execution = await execution.save();

      return executeActions(
        subdomain,
        triggerType,
        execution,
        actionsMap,
        ifActionId
      );
    }

    if (action.type === ACTIONS.SET_PROPERTY) {
      const { module } = action.config;
      const [serviceName, collectionType] = module.split(':');

      actionResponse = await sendCommonMessage({
        subdomain,
        serviceName,
        action: 'automations.receiveActions',
        data: {
          triggerType,
          actionType: 'set-property',
          action,
          execution,
          collectionType
        }
      });
    }

    if (action.type.includes('create')) {
      const [serviceName, type] = action.type.split(':');

      actionResponse = await sendCommonMessage({
        subdomain,
        serviceName,
        action: 'automations.receiveActions',
        data: {
          actionType: 'create',
          action,
          execution,
          collectionType: type.replace('.create', '')
        },
        isRPC: true
      });

      if (actionResponse.error) {
        throw new Error(actionResponse.error);
      }
    }
  } catch (e) {
    execAction.result = { error: e.message, result: e.result };
    execution.actions = [...(execution.actions || []), execAction];
    execution.status = EXECUTION_STATUS.ERROR;
    execution.description = `An error occurred while working action: ${action.type}`;
    await execution.save();
    return;
  }

  execAction.result = actionResponse;
  execution.actions = [...(execution.actions || []), execAction];
  execution = await execution.save();

  return executeActions(
    subdomain,
    triggerType,
    execution,
    actionsMap,
    action.nextActionId
  );
};

const isDiffValue = (latest, target, field) => {
  if (field.includes('customFieldsData') || field.includes('trackedData')) {
    const [ct, fieldId] = field.split('.');
    const latestFoundItem = latest[ct].find(i => i.field === fieldId);
    const targetFoundItem = target[ct].find(i => i.field === fieldId);

    if (latestFoundItem && targetFoundItem) {
      return latestFoundItem.value !== targetFoundItem.value;
    }

    return false;
  }

  const getValue = (obj, attr) => {
    try {
      return obj[attr];
    } catch (e) {
      return undefined;
    }
  };

  const extractFields = field.split('.');

  let latestValue = latest;
  let targetValue = target;

  for (const f of extractFields) {
    latestValue = getValue(latestValue, f);
    targetValue = getValue(targetValue, f);
  }

  if (targetValue !== latestValue) {
    return true;
  }

  return false;
};

export const calculateExecution = async ({
  models,
  subdomain,
  automationId,
  trigger,
  target
}: {
  models: IModels;
  subdomain: string;
  automationId: string;
  trigger: ITrigger;
  target: any;
}): Promise<IExecutionDocument | null | undefined> => {
  const { id, type, config } = trigger;
  const { reEnrollment, reEnrollmentRules, contentId } = config;

  try {
    if (!(await isInSegment(subdomain, contentId, target._id))) {
      return;
    }
  } catch (e) {
    await models.Executions.createExecution({
      automationId,
      triggerId: id,
      triggerType: type,
      triggerConfig: config,
      targetId: target._id,
      target,
      status: EXECUTION_STATUS.ERROR,
      description: `An error occurred while checking the is in segment: "${e.message}"`
    });
    return;
  }

  const executions = await models.Executions.find({
    automationId,
    triggerId: id,
    targetId: target._id
  })
    .sort({ createdAt: -1 })
    .limit(1)
    .lean();

  const latestExecution: IExecutionDocument =
    executions.length && executions[0];

  if (latestExecution) {
    if (!reEnrollment || !reEnrollmentRules.length) {
      return;
    }

    let isChanged = false;

    for (const reEnrollmentRule of reEnrollmentRules) {
      if (isDiffValue(latestExecution.target, target, reEnrollmentRule)) {
        isChanged = true;
        break;
      }
    }

    if (!isChanged) {
      return;
    }
  }

  return models.Executions.createExecution({
    automationId,
    triggerId: id,
    triggerType: type,
    triggerConfig: config,
    targetId: target._id,
    target,
    status: EXECUTION_STATUS.ACTIVE,
    description: `Met enrollement criteria`
  });
};

/*
 * target is one of the TriggerType objects
 */
export const receiveTrigger = async ({
  models,
  subdomain,
  type,
  targets
}: {
  models: IModels;
  subdomain: string;
  type: TriggerType;
  targets: any[];
}) => {
  const automations = await models.Automations.find({
    status: 'active',
    'triggers.type': { $in: [type] }
  }).lean();

  if (!automations.length) {
    return;
  }

  for (const target of targets) {
    for (const automation of automations) {
      for (const trigger of automation.triggers) {
        if (trigger.type !== type) {
          continue;
        }

        const execution = await calculateExecution({
          models,
          subdomain,
          automationId: automation._id,
          trigger,
          target
        });

        if (execution) {
          await executeActions(
            subdomain,
            trigger.type,
            execution,
            await getActionsMap(automation.actions),
            trigger.actionId
          );
        }
      }
    }
  }
};

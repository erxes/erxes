import { addBoardItem } from './actions';
import { ACTIONS } from './constants';
import { debugBase } from './debuggers';
import { getActionsMap } from './helpers';
import Automations, { IActionsMap, ReEnrollmentRule, TriggerType } from './models/Automations';
import { Executions, IExecutionDocument } from './models/Executions';

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

export const isTargetInSegment = async (segmentId: string, targetId: string) => {
  return segmentId && targetId.includes('1');
}

export let tags: any[] = [];
export let tasks: any[] = [];
export let deals: any[] = [];
export let customers: any[] = [];

export const reset = () => {
  tags = [];
  tasks = [];
  deals = [];
  customers = [];
}

export const executeActions = async (execution: IExecutionDocument, actionsMap: IActionsMap, currentActionId?: string): Promise<string> => {
  if (!currentActionId) {
    execution.waitingActionId = null;
    execution.lastCheckedWaitDate = null;

    await execution.save();

    return 'finished';
  }

  const action = actionsMap[currentActionId];

  if (action.type === ACTIONS.WAIT) {
    execution.waitingActionId = action.id;
    execution.lastCheckedWaitDate = new Date();
    await execution.save();

    return 'paused';
  }

  if (action.type === ACTIONS.IF) {
    if (await isTargetInSegment(action.config.segmentId, execution.targetId)) {
      return executeActions(execution, actionsMap, action.config.yes);
    } else {
      return executeActions(execution, actionsMap, action.config.no);
    }
  }

  if (action.type === ACTIONS.GO_TO) {
    return executeActions(execution, actionsMap, action.config.toId);
  }

  if (action.type === ACTIONS.ADD_TAGS) {
    tags = [...tags, ...action.config.names];
  }

  if (action.type === ACTIONS.REMOVE_TAGS) {
    tags = tags.filter(t => !action.config.names.includes(t));
  }

  if (action.type === ACTIONS.CREATE_TASK) {
    const result = await addBoardItem({ action, execution, type: 'task' });
    execution.actionsData.push({ actionId: currentActionId, data: result })
  }

  if (action.type === ACTIONS.CREATE_TICKET) {
    const result = await addBoardItem({ action, execution, type: 'ticket' });
    execution.actionsData.push({ actionId: currentActionId, data: result })
  }

  if (action.type === ACTIONS.CREATE_DEAL) {
    const result = await addBoardItem({ action, execution, type: 'deal' });
    execution.actionsData.push({ actionId: currentActionId, data: result })
  }

  if (action.type === ACTIONS.REMOVE_DEAL) {
    deals = deals.filter(t => !action.config.names.includes(t));
  }

  await execution.save();

  return executeActions(execution, actionsMap, action.nextActionId);
}

export const calculateExecution = async ({ automationId, triggerId, reEnrollmentRules, target }: { automationId: string, triggerId: string, reEnrollmentRules: ReEnrollmentRule[], target: any }): Promise<IExecutionDocument> => {
  const executions = await Executions.find({ automationId, triggerId, targetId: target._id });

  const latestExecution = executions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).pop();

  if (latestExecution) {
    let isChanged = false;

    for (const reEnrollmentRule of reEnrollmentRules) {
      const { property } = reEnrollmentRule;

      if (latestExecution.target[property] !== target[property]) {
        isChanged = true;
        break;
      }
    }

    if (!isChanged) {
      return;
    }
  }

  return Executions.createExecution({
    automationId,
    triggerId,
    targetId: target._id,
    target,
  });
}

/*
 * target is one of the TriggerType objects
 */
export const receiveTrigger = async ({ type, target }: {  type: TriggerType, target: any }) => {
  const automations = await Automations.find({ status: 'active', 'triggers.type': { $in: [type] }});

  if (!automations.length) {
    return;
  }

  for (const automation of automations) {
    for (const trigger of automation.triggers) {
      if (trigger.type !== type) {
        continue;
      }

      const execution = await calculateExecution({ automationId: automation._id, triggerId: trigger.id, reEnrollmentRules: trigger.config.reEnrollmentRules, target });

      if (execution) {
        await executeActions(execution, await getActionsMap(automation.actions), trigger.actionId);
      }
    }
  }
}
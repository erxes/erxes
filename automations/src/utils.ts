import { ACTIONS } from './constants';
import { debugBase } from './debuggers';
import Automations, { IAction, IAutomationDocument } from './models/Automations';
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

type IActionsMap = { [key: string]: IAction };

export let tags: string[] = [];

export const resetTags = () => tags = [];

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
    if (await isTargetInSegment(action.data.segmentId, execution.targetId)) {
      return executeActions(execution, actionsMap, action.data.yes);
    } else {
      return executeActions(execution, actionsMap, action.data.no);
    }
  }

  if (action.type === ACTIONS.GO_TO) {
    return executeActions(execution, actionsMap, action.data.toId);
  }

  if (action.type === ACTIONS.ADD_TAGS) {
    tags = [...tags, ...action.data.names];
  }

  if (action.type === ACTIONS.REMOVE_TAGS) {
    tags = tags.filter(t => !action.data.names.includes(t));
  }

  return executeActions(execution, actionsMap, action.nextActionId);
}

export const executeAutomation = async ({ automation, triggerType, targetId, triggerData }: { automation: IAutomationDocument, triggerType: string, targetId: string, triggerData?: any }) => {
  const execution = await Executions.create({ automationId: automation._id, triggerType, triggerData, targetId });
  const actionsMap: IActionsMap = {};

  let firstActionId: string;

  for (const action of automation.actions) {
    actionsMap[action.id] = action;

    if (!action.prevActionId) {
      firstActionId = action.id;
    }
  }

  await executeActions(execution, actionsMap, firstActionId);
}

export const receiveTrigger = async ({ triggerType, targetId, data }: { triggerType: string, targetId: string, data?: any }) => {
  const automations = await Automations.find({ 'triggers.type': { $in: [triggerType] } });

  const executions = await Executions.find({
    automationId: { $in: automations.map(a => a._id) },
    triggerType,
    targetId,
    waitingActionId: { $ne: null }
  });

  if (executions.length === 0) {
    for (const automation of automations) {
      await executeAutomation({ automation, triggerType, targetId, triggerData: data });
    }
  }
}
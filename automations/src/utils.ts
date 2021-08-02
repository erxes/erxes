import { addBoardItem, addDeal, addTask, addTicket } from './actions';
import { ACTIONS, TRIGGERS } from './constants';
import { debugBase } from './debuggers';
import { getActionsMap } from './helpers';
import Automations, { IActionsMap, IAutomationDocument, ITrigger } from './models/Automations';
import { Executions, IExecutionDocument } from './models/Executions';
import { cronjob, dealCreate, formSubmit, websiteVisited } from './triggers';

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
    // tasks.push(replacePlaceHolders({ actionData: action.config, triggerData: execution.triggerData }));
  }

  if (action.type === ACTIONS.ADD_TICKET) {
    const result = await addBoardItem({ action, execution, type: 'ticket' });
    execution.actionsData.push({ actionId: currentActionId, data: result })
    // tasks.push(replacePlaceHolders({ actionData: action.config, triggerData: execution.triggerData }));
  }

  if (action.type === ACTIONS.ADD_DEAL) {
    const result = await addBoardItem({ action, execution, type: 'deal' });
    execution.actionsData.push({ actionId: currentActionId, data: result })
  }

  if (action.type === ACTIONS.REMOVE_DEAL) {
    deals = deals.filter(t => !action.config.names.includes(t));
  }

  await execution.save();

  return executeActions(execution, actionsMap, action.nextActionId);
}

export const executeAutomation = async ({ automation, trigger, targetId, triggerData }: { automation: IAutomationDocument, trigger: ITrigger, targetId: string, triggerData?: any }) => {
  const execution = await Executions.create({ automationId: automation._id, triggerId: trigger.id, triggerData, targetId });

  await executeActions(execution, await getActionsMap(automation), trigger.actionId);
}

export const checkTrigger = async ({ trigger, data, targetId }: { trigger: ITrigger, data: any, targetId: string }) => {
  if (trigger.type === TRIGGERS.FORM_SUBMIT) {
    return formSubmit({ trigger, data, targetId });
  }

  if (trigger.type === TRIGGERS.WEBSITE_VISITED) {
    return websiteVisited({ trigger, data, targetId });
  }

  if (trigger.type === TRIGGERS.CRONJOB) {
    return cronjob({ trigger, data, targetId });
  }

  if (trigger.type === TRIGGERS.DEAL_CREATE) {
    return dealCreate({ trigger, data, targetId })
  }

  return false;
}

export const receiveTrigger = async ({ triggerType, targetId, data }: { triggerType: string, targetId: string, data?: any }) => {
  const automations = await Automations.find({ status: 'active', 'triggers.type': { $in: [triggerType] } }).lean();

  if (!automations.length) {
    return;
  }

  for (const automation of automations) {
    for (const trigger of automation.triggers) {
      if (trigger.type !== triggerType) {
        continue;
      }

      if (!await checkTrigger({ trigger, data, targetId })) {
        continue;
      }

      await executeAutomation({ automation, trigger, targetId, triggerData: data });
    }
  }
}
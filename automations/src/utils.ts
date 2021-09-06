import { addBoardItem } from './actions';
import { setProperty } from './actions/setProperty';
import { ACTIONS } from './constants';
import { debugBase } from './debuggers';
import { getActionsMap } from './helpers';
import { sendRPCMessage } from './messageBroker';
import Automations, {
  IActionsMap,
  ITrigger,
  TriggerType
} from './models/Automations';
import AutomationHistories from './models/Histories';
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

export const isInSegment = async (segmentId: string, targetId: string) => {
  const response = await sendRPCMessage('isInSegment', { segmentId, targetId });
  return response.check;
};

export let tags: any[] = [];
export let tasks: any[] = [];
export let deals: any[] = [];
export let customers: any[] = [];

export const reset = () => {
  tags = [];
  tasks = [];
  deals = [];
  customers = [];
};

export const executeActions = async (
  triggerType: string,
  execution: IExecutionDocument,
  actionsMap: IActionsMap,
  currentActionId?: string
): Promise<string> => {
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
    let ifActionId;

    if (await isInSegment(action.config.contentId, execution.targetId)) {
      ifActionId = action.config.yes;
    } else {
      ifActionId = action.config.no;
    }

    await AutomationHistories.createHistory({
      actionId: currentActionId,
      actionType: action.type,
      triggerType,
      description: `Continuing on the ${action.config.yes}`,
      automationId: execution.automationId,
      target: execution.target
    });

    return executeActions(triggerType, execution, actionsMap, ifActionId);
  }

  if (action.type === ACTIONS.GO_TO) {
    return executeActions(
      triggerType,
      execution,
      actionsMap,
      action.config.toId
    );
  }

  if (action.type === ACTIONS.SET_PROPERTY) {
    await setProperty({
      triggerType,
      actionConfig: action.config,
      target: execution.target
    });

    await AutomationHistories.createHistory({
      actionId: currentActionId,
      actionType: action.type,
      triggerType,
      description: 'Set property',
      automationId: execution.automationId,
      target: execution.target
    });
  }

  if (action.type === ACTIONS.ADD_TAGS) {
    tags = [...tags, ...action.config.names];
  }

  if (action.type === ACTIONS.REMOVE_TAGS) {
    tags = tags.filter(t => !action.config.names.includes(t));
  }

  if (
    action.type === ACTIONS.CREATE_TASK ||
    action.type === ACTIONS.CREATE_TICKET ||
    action.type === ACTIONS.CREATE_DEAL
  ) {
    const type = action.type.substring(6).toLocaleLowerCase();

    await addBoardItem({ action, execution, type });

    await AutomationHistories.createHistory({
      actionId: currentActionId,
      actionType: action.type,
      triggerType,
      description: `Created a ${type}`,
      automationId: execution.automationId,
      target: execution.target
    });
  }

  if (action.type === ACTIONS.REMOVE_DEAL) {
    deals = deals.filter(t => !action.config.names.includes(t));
  }

  await execution.save();

  return executeActions(
    triggerType,
    execution,
    actionsMap,
    action.nextActionId
  );
};

export const calculateExecution = async ({
  automationId,
  trigger,
  target
}: {
  automationId: string;
  trigger: ITrigger;
  target: any;
}): Promise<IExecutionDocument> => {
  const { id, type, config } = trigger;
  const { reEnrollment, reEnrollmentRules, contentId } = config;

  if (!await isInSegment(contentId, target._id)) {
    return;
  }

  const executions = await Executions.find({
    automationId,
    triggerId: id,
    targetId: target._id
  });

  const latestExecution = executions
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .pop();

  if (latestExecution) {
    if (!reEnrollment || !reEnrollmentRules.length) {
      return;
    }

    let isChanged = false;

    for (const reEnrollmentRule of reEnrollmentRules) {
      if (latestExecution.target[reEnrollmentRule] !== target[reEnrollmentRule]) {
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
    triggerId: id,
    triggerType: type,
    targetId: target._id,
    target
  });
};

/*
 * target is one of the TriggerType objects
 */
export const receiveTrigger = async ({
  type,
  targets
}: {
  type: TriggerType;
  targets: any[];
}) => {
  for (const target of targets) {
    const automations = await Automations.find({
      status: 'active',
      'triggers.type': { $in: [type] }
    });

    if (!automations.length) {
      return;
    }

    for (const automation of automations) {
      for (const trigger of automation.triggers) {
        if (trigger.type !== type) {
          continue;
        }

        const execution = await calculateExecution({
          automationId: automation._id,
          trigger,
          target
        });

        if (execution) {
          await AutomationHistories.createHistory({
            triggerId: trigger.id,
            triggerType: trigger.type,
            description: 'Met enrollement criteria',
            automationId: automation._id,
            target
          });

          await executeActions(
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

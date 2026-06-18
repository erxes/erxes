import {
  replaceOutputPlaceholders,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { ITask } from '@/task/@types/task';
import {
  getAutomationUserId,
  getNumber,
  getString,
  parseDate,
  toRecord,
  toStringList,
} from '~/modules/automations/utils';

type TReceiveActionInput =
  TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS];

type TCreateTaskActionParams = {
  models: IModels;
  subdomain: string;
  action: TReceiveActionInput['action'];
  execution: TReceiveActionInput['execution'];
};

const getOptionalStringList = (value: unknown): string[] | undefined => {
  const values = toStringList(value);

  return values.length ? values : undefined;
};

const buildTaskDoc = (data: Record<string, unknown>): ITask => {
  const name = getString(data, 'name');
  const teamId = getString(data, 'teamId');
  const status = getString(data, 'status');

  if (!name) {
    throw new Error('Task name is required');
  }

  if (!teamId) {
    throw new Error('Task team is required');
  }

  if (!status) {
    throw new Error('Task status is required');
  }

  return {
    name,
    teamId,
    status,
    description: getString(data, 'description'),
    priority: getNumber(data, 'priority'),
    labelIds: getOptionalStringList(data.labelIds),
    tagIds: getOptionalStringList(data.tagIds),
    assigneeId: getString(data, 'assigneeId'),
    createdBy: getString(data, 'createdBy'),
    cycleId: getString(data, 'cycleId'),
    milestoneId: getString(data, 'milestoneId'),
    projectId: getString(data, 'projectId'),
    estimatePoint: getNumber(data, 'estimatePoint'),
    startDate: parseDate(data.startDate),
    targetDate: parseDate(data.targetDate),
  };
};

export const createTaskAction = async ({
  models,
  subdomain,
  action,
  execution,
}: TCreateTaskActionParams) => {
  const resolvedConfig = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: toRecord(action.config),
    defaultValue: '',
  });
  const target = toRecord(execution.target);
  const userId = getAutomationUserId(resolvedConfig, target);

  if (!userId) {
    throw new Error('Task automation requires a user to create task');
  }

  const task = await models.Task.createTask({
    doc: buildTaskDoc(resolvedConfig),
    userId,
    subdomain,
  });

  graphqlPubsub.publish(`operationTaskChanged:${task._id}`, {
    operationTaskChanged: {
      type: 'create',
      task,
    },
  });

  graphqlPubsub.publish('operationTaskListChanged', {
    operationTaskListChanged: {
      type: 'create',
      task,
    },
  });

  const taskRecord = toRecord(task);

  return {
    targetId: task._id,
    name: task.name,
    number: getNumber(taskRecord, 'number'),
    teamId: task.teamId,
    status: task.status,
    statusType: task.statusType,
    projectId: task.projectId,
    milestoneId: task.milestoneId,
    assigneeId: task.assigneeId,
  };
};

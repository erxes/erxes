import {
  getContactConnectionUpdate,
  prependContactRecord,
} from './contactConnection';
import type {
  GetTaskQuery,
  GetTasksQuery,
  UpdateTaskMutationVariables,
} from '~/gql/graphql';

export const TASK_CONNECTION_CONTENT_TYPE = 'operation:taskConnection';
export const CONTACT_TASK_RECORDS_LIMIT = 50;

type TaskListItem = NonNullable<
  NonNullable<NonNullable<GetTasksQuery['getTasks']>['list']>[number]
>;

export const withConnectedTask = (
  previous: GetTasksQuery | null,
  task: TaskListItem,
  incrementCount = true,
): GetTasksQuery | null => {
  const page = previous?.getTasks;
  if (!page) return null;
  return {
    ...previous,
    getTasks: prependContactRecord(page, task, incrementCount),
  };
};

type TaskContact = Pick<
  NonNullable<GetTaskQuery['getTask']>,
  '_id' | 'customerId' | 'companyId'
>;

export const getTaskContactUpdate = (
  task: TaskContact,
  contact: { contentType: string; contentId: string },
): UpdateTaskMutationVariables | null => {
  if (contact.contentType === 'core:customer') {
    return getContactConnectionUpdate(task, { customerId: contact.contentId });
  }
  if (contact.contentType === 'core:company') {
    return getContactConnectionUpdate(task, { companyId: contact.contentId });
  }
  return null;
};

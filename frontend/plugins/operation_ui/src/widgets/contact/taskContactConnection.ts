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
  const alreadyListed = page.list?.some((item) => item?._id === task._id);
  const list = [
    task,
    ...(page.list ?? []).filter((item) => item && item._id !== task._id),
  ];
  return {
    ...previous,
    getTasks: {
      ...page,
      list,
      totalCount: Math.max(
        (page.totalCount ?? 0) + (incrementCount && !alreadyListed ? 1 : 0),
        list.length,
      ),
      pageInfo: page.pageInfo ?? null,
    },
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
  if (!contact.contentId) return null;

  if (contact.contentType === 'core:customer' && !task.customerId) {
    return { _id: task._id, customerId: contact.contentId };
  }

  if (contact.contentType === 'core:company' && !task.companyId) {
    return { _id: task._id, companyId: contact.contentId };
  }

  return null;
};

export const finishTaskContactConnection = async (
  refreshTasks: () => Promise<unknown>,
  showConnectedTask: () => void,
): Promise<boolean> => {
  try {
    await refreshTasks();
    return true;
  } catch {
    return false;
  } finally {
    showConnectedTask();
  }
};

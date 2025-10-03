import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TASKS } from '@/task/graphql/queries/getTasks';
import { ITask } from '@/task/types';
import {
  mergeCursorData,
  validateFetchMore,
  EnumCursorDirection,
  ICursorListResponse,
  useToast,
  isUndefinedOrNull,
  useNonNullMultiQueryState,
} from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';

const TASKS_PER_PAGE = 30;

interface ITaskChanged {
  operationTaskListChanged: {
    type: string;
    task: ITask;
  };
}

export const useTasksVariables = (
  variables?: QueryHookOptions<ICursorListResponse<ITask>>['variables'],
) => {
  const { teamId } = useParams();
  const { searchValue, assignee, team, priority, status } =
    useNonNullMultiQueryState<{
      searchValue: string;
      assignee: string;
      team: string;
      priority: string;
      status: string;
    }>(['searchValue', 'assignee', 'team', 'priority', 'status']);
  const currentUser = useAtomValue(currentUserState);

  return {
    cursor: '',
    limit: TASKS_PER_PAGE,
    orderBy: {
      updatedAt: -1,
    },
    direction: 'forward',
    name: searchValue,
    assigneeId: assignee,
    teamId: teamId || team,
    priority: priority,
    status: teamId ? status : undefined,
    statusType: teamId ? undefined : status,
    ...variables,
    ...(!variables?.teamId &&
      !variables?.userId &&
      !assignee &&
      currentUser?._id && {
        userId: currentUser._id,
      }),
  };
};

export const useTasks = (
  options?: QueryHookOptions<ICursorListResponse<ITask>>,
) => {
  const variables = useTasksVariables(options?.variables);
  const { toast } = useToast();
  const { data, loading, fetchMore, subscribeToMore } = useQuery<
    ICursorListResponse<ITask>
  >(GET_TASKS, {
    ...options,
    variables: { filter: variables },
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    fetchPolicy: 'cache-and-network',
    onError: (e) => {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const { list: tasks, pageInfo, totalCount } = data?.getTasks || {};

  useEffect(() => {
    const unsubscribe = subscribeToMore<ITaskChanged>({
      document: TASK_LIST_CHANGED,
      variables: { filter: variables },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const { type, task } = subscriptionData.data.operationTaskListChanged;
        const currentList = prev.getTasks.list;

        let updatedList = currentList;

        if (type === 'create') {
          const exists = currentList.some(
            (item: ITask) => item._id === task._id,
          );
          if (!exists) {
            updatedList = [task, ...currentList];
          }
        }

        if (type === 'update') {
          updatedList = currentList.map((item: ITask) =>
            item._id === task._id ? { ...item, ...task } : item,
          );
        }

        if (type === 'remove') {
          updatedList = currentList.filter(
            (item: ITask) => item._id !== task._id,
          );
        }

        return {
          ...prev,
          getTasks: {
            ...prev.getTasks,
            list: updatedList,
            pageInfo: prev.getTasks.pageInfo,
            totalCount:
              type === 'create'
                ? prev.getTasks.totalCount + 1
                : type === 'remove'
                ? prev.getTasks.totalCount - 1
                : prev.getTasks.totalCount,
          },
        };
      },
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variables]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        filter: {
          ...variables,
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          limit: TASKS_PER_PAGE,
          direction:
            direction === EnumCursorDirection.FORWARD ? 'forward' : 'backward',
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          getTasks: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.getTasks,
            prevResult: prev.getTasks,
          }),
        });
      },
    });
  };

  return {
    loading,
    tasks,
    handleFetchMore,
    pageInfo,
    totalCount,
  };
};

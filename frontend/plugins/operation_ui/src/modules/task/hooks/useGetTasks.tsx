import { GET_TASKS } from '@/task/graphql/queries/getTasks';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/operation/utils/cursorList';
import { QueryHookOptions, useQuery, useSubscription } from '@apollo/client';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  useNonNullMultiQueryState,
  useToast,
  validateFetchMore,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { currentUserState } from 'ui-modules';
import type {
  CycleFilterType,
  GetTasksQuery,
  GetTasksQueryVariables,
  ITaskFilter,
} from '~/gql/graphql';

const TASKS_PER_PAGE = 30;

export const useTasksVariables = (variables?: ITaskFilter): ITaskFilter => {
  const { teamId } = useParams();
  const {
    searchValue,
    assignee,
    team,
    priority,
    status,
    milestone,
    tags,
    cycleFilter,
    createdBy,
    estimatePoint,
    targetDate,
    createdDate,
    updatedDate,
    startDate,
    completedDate,
    project,
    projectStatus,
    projectPriority,
    projectLeadId,
    projectMilestoneName,
  } = useNonNullMultiQueryState<{
    searchValue: string;
    assignee: string;
    createdBy: string;
    team: string;
    priority: number;
    status: string | number;
    milestone: string;
    tags: string[];
    cycleFilter: CycleFilterType;
    estimatePoint: number;
    targetDate: string;
    createdDate: string;
    updatedDate: string;
    startDate: string;
    completedDate: string;
    project: string;
    projectStatus: number;
    projectPriority: number;
    projectLeadId: string;
    projectMilestoneName: string;
  }>([
    'searchValue',
    'assignee',
    'team',
    'priority',
    'status',
    'milestone',
    'tags',
    'cycleFilter',
    'createdBy',
    'estimatePoint',
    'targetDate',
    'createdDate',
    'updatedDate',
    'startDate',
    'completedDate',
    'project',
    'projectStatus',
    'projectPriority',
    'projectLeadId',
    'projectMilestoneName',
  ]);
  const currentUser = useAtomValue(currentUserState);

  return {
    cursor: '',
    limit: TASKS_PER_PAGE,
    direction: 'forward',
    name: searchValue,
    assigneeId: assignee,
    createdBy: createdBy,
    teamId: teamId || team,
    priority: priority,
    status: teamId && typeof status === 'string' ? status : undefined,
    statusType: !teamId && typeof status === 'number' ? status : undefined,
    milestoneId: milestone,
    tagIds: tags,
    cycleFilter: cycleFilter,
    estimatePoint: estimatePoint,
    targetDate: targetDate,
    createdDate: createdDate,
    updatedDate: updatedDate,
    startDate: startDate,
    completedDate: completedDate,
    projectId: project,
    projectStatus: projectStatus,
    projectPriority: projectPriority,
    projectLeadId: projectLeadId,
    projectMilestoneName: projectMilestoneName,
    ...variables,
    ...(!variables?.teamId &&
      !variables?.userId &&
      !variables?.createdBy &&
      !assignee &&
      currentUser?._id && {
        userId: currentUser._id,
      }),
  };
};

export const useTasks = (
  options?: QueryHookOptions<GetTasksQuery, GetTasksQueryVariables> & {
    variables?: ITaskFilter;
  },
) => {
  const { t } = useTranslation('operation');
  const rawVariables = useTasksVariables(options?.variables);

  const variables = useMemo(
    () => rawVariables,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(rawVariables)],
  );
  const { toast } = useToast();
  const { data, loading, fetchMore } = useQuery(GET_TASKS, {
    ...options,
    variables: { filter: variables },
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    fetchPolicy: 'cache-and-network',
    onError: (e) => {
      toast({
        title: t('error'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const tasks = data?.getTasks?.list
    ? compactList(data.getTasks.list)
    : undefined;
  const pageInfo = toCursorPageInfo(data?.getTasks?.pageInfo);
  const totalCount = data?.getTasks?.totalCount;

  useSubscription(TASK_LIST_CHANGED, {
    variables: { filter: variables },
    ignoreResults: true,
    onData: ({ client, data: subData }) => {
      const event = subData.data?.operationTaskListChanged;
      const task = event?.task;
      if (!task) return;

      if (event?.type === 'delete') {
        const cacheId = client.cache.identify(task);
        if (cacheId) {
          client.cache.evict({ id: cacheId });
          client.cache.gc();
        }
        client.cache.updateQuery(
          { query: GET_TASKS, variables: { filter: variables } },
          (prev) => {
            const getTasks = prev?.getTasks;
            if (!getTasks) return;
            return {
              ...prev,
              getTasks: {
                ...getTasks,
                totalCount: (getTasks.totalCount ?? 0) - 1,
              },
            };
          },
        );
        return;
      }

      if (event?.type === 'create') {
        client.cache.updateQuery(
          { query: GET_TASKS, variables: { filter: variables } },
          (prev) => {
            const getTasks = prev?.getTasks;
            if (!getTasks?.list) return;
            if (getTasks.list.some((item) => item?._id === task._id)) {
              return prev;
            }
            return {
              ...prev,
              getTasks: {
                ...getTasks,
                list: [task, ...getTasks.list],
                totalCount: (getTasks.totalCount ?? 0) + 1,
              },
            };
          },
        );
      }
    },
  });

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
        if (!fetchMoreResult.getTasks || !prev.getTasks) return prev;

        return {
          ...prev,
          getTasks: mergeCursorList(
            direction,
            prev.getTasks,
            fetchMoreResult.getTasks,
          ),
        };
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

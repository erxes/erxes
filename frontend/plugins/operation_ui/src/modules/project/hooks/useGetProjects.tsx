import { PROJECTS_CURSOR_SESSION_KEY } from '@/project/constants/ProjectSessionKey';
import {
  GET_PROJECTS,
  GET_PROJECTS_INLINE,
} from '@/project/graphql/queries/getProjects';
import { PROJECT_LIST_CHANGED } from '@/project/graphql/subscriptions/projectListChanged';
import { projectTotalCountAtom } from '@/project/states/projectsTotalCount';
import { IProject } from '@/project/types';
import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  isUndefinedOrNull,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  useToast,
  validateFetchMore,
} from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { currentUserState } from 'ui-modules';

interface IProjectChanged {
  operationProjectListChanged: {
    type: string;
    project: IProject;
  };
}

const PROJECTS_PER_PAGE = 30;

export const useProjectsVariables = (
  variables?: QueryHookOptions<ICursorListResponse<IProject>>['variables'],
) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: PROJECTS_CURSOR_SESSION_KEY,
  });
  const [{ name, team, priority, status, lead }] = useMultiQueryState<{
    name: string;
    team: string;
    priority: string;
    status: string;
    lead: string;
  }>(['name', 'team', 'priority', 'status', 'lead']);
  const currentUser = useAtomValue(currentUserState);

  return {
    limit: PROJECTS_PER_PAGE,
    orderBy: {
      status: 1,
    },
    cursor,
    name: name || undefined,

    priority: priority || undefined,
    status: status || undefined,
    leadId: lead || undefined,
    ...variables,
    ...(variables?.teamIds || variables?.userId || !currentUser?._id
      ? {}
      : { userId: currentUser._id }),
    teamIds: team ? [team] : variables?.teamIds,
  };
};

export const useProjects = (
  options?: QueryHookOptions<ICursorListResponse<IProject>>,
) => {
  const setProjectTotalCount = useSetAtom(projectTotalCountAtom);
  const { toast } = useToast();
  const variables = useProjectsVariables(options?.variables);

  const { data, loading, fetchMore, subscribeToMore } = useQuery<
    ICursorListResponse<IProject>
  >(GET_PROJECTS, {
    ...options,
    variables: { filter: variables },
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    onError: (e) => {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const { list: projects, pageInfo, totalCount } = data?.getProjects || {};

  useEffect(() => {
    const unsubscribe = subscribeToMore<IProjectChanged>({
      document: PROJECT_LIST_CHANGED,
      variables: { filter: variables },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const { type, project } =
          subscriptionData.data.operationProjectListChanged;
        const currentList = prev.getProjects.list;

        let updatedList = currentList;

        if (type === 'create') {
          const exists = currentList.some(
            (item: IProject) => item._id === project._id,
          );
          if (!exists) {
            updatedList = [project, ...currentList];
          }
        }

        if (type === 'update') {
          updatedList = currentList.map((item: IProject) =>
            item._id === project._id ? { ...item, ...project } : item,
          );
        }

        if (type === 'remove') {
          updatedList = currentList.filter(
            (item: IProject) => item._id !== project._id,
          );
        }

        return {
          ...prev,
          getProjects: {
            ...prev.getProjects,
            list: updatedList,
            pageInfo: prev.getProjects.pageInfo,
            totalCount:
              type === 'create'
                ? prev.getProjects.totalCount + 1
                : type === 'remove'
                ? prev.getProjects.totalCount - 1
                : prev.getProjects.totalCount,
          },
        };
      },
    });

    return () => unsubscribe();
  }, [subscribeToMore, variables]);

  useEffect(() => {
    if (isUndefinedOrNull(totalCount)) return;
    setProjectTotalCount(totalCount);
  }, [totalCount, setProjectTotalCount]);

  const handleFetchMore = ({
    direction = EnumCursorDirection.FORWARD,
  }: {
    direction?: EnumCursorDirection;
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
          limit: PROJECTS_PER_PAGE,
          direction,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          getProjects: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.getProjects,
            prevResult: prev.getProjects,
          }),
        });
      },
    });
  };

  return {
    loading,
    projects,
    handleFetchMore,
    pageInfo,
    totalCount,
  };
};
export const useProjectsInline = (
  options?: QueryHookOptions<
    ICursorListResponse<{
      _id: string;
      name: string;
      status: number;
    }>
  >,
) => {
  const variables = useProjectsVariables(options?.variables);

  const { data, loading, fetchMore } = useQuery<
    ICursorListResponse<{
      _id: string;
      name: string;
      status: number;
    }>
  >(GET_PROJECTS_INLINE, {
    ...options,
    variables: { filter: variables },
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
  });

  const handleFetchMore = (
    direction: EnumCursorDirection = EnumCursorDirection.FORWARD,
  ) => {
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
          limit: PROJECTS_PER_PAGE,
          direction,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          getProjects: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.getProjects,
            prevResult: prev.getProjects,
          }),
        });
      },
    });
  };

  const { list: projects, pageInfo, totalCount } = data?.getProjects || {};

  return {
    loading,
    projects,
    handleFetchMore,
    pageInfo,
    totalCount,
  };
};

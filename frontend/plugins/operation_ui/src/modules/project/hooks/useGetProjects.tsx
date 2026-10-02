import { PROJECTS_CURSOR_SESSION_KEY } from '@/project/constants/ProjectSessionKey';
import {
  GET_PROJECTS,
  GET_PROJECTS_INLINE,
} from '@/project/graphql/queries/getProjects';
import { PROJECT_LIST_CHANGED } from '@/project/graphql/subscriptions/projectListChanged';
import { projectTotalCountAtom } from '@/project/states/projectsTotalCount';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/operation/utils/cursorList';
import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  useMultiQueryState,
  useRecordTableCursor,
  useToast,
  validateFetchMore,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { currentUserState } from 'ui-modules';
import type {
  GetProjectsInlineQuery,
  GetProjectsQuery,
  GetProjectsQueryVariables,
  IProjectFilter,
} from '~/gql/graphql';

const PROJECTS_PER_PAGE = 30;

export const useProjectsVariables = (
  variables?: IProjectFilter,
): IProjectFilter => {
  const { cursor } = useRecordTableCursor({
    sessionKey: PROJECTS_CURSOR_SESSION_KEY,
  });
  const [{ name, team, priority, status, lead, tags }] = useMultiQueryState<{
    name: string;
    team: string;
    priority: string;
    status: string;
    lead: string;
    tags: string[];
  }>(['name', 'team', 'priority', 'status', 'lead', 'tags']);
  const currentUser = useAtomValue(currentUserState);

  return {
    limit: PROJECTS_PER_PAGE,
    orderBy: {
      status: 1,
    },
    cursor,
    name: name || undefined,

    priority: priority ? Number(priority) : undefined,
    status: status ? Number(status) : undefined,
    leadId: lead || undefined,
    tagIds: tags || undefined,
    ...variables,
    ...(variables?.teamIds || variables?.memberId || !currentUser?._id
      ? {}
      : { memberId: currentUser._id }),
    teamIds: team ? [team] : variables?.teamIds,
  };
};

export const useProjects = (
  options?: QueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables> & {
    variables?: IProjectFilter;
  },
) => {
  const { t } = useTranslation('operation');
  const setProjectTotalCount = useSetAtom(projectTotalCountAtom);
  const { toast } = useToast();
  const variables = useProjectsVariables(options?.variables);

  const { data, loading, fetchMore, subscribeToMore } = useQuery(GET_PROJECTS, {
    ...options,
    variables: { filter: variables },
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    onError: (e) => {
      toast({
        title: t('error'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const projects = data?.getProjects?.list
    ? compactList(data.getProjects.list)
    : undefined;
  const pageInfo = toCursorPageInfo(data?.getProjects?.pageInfo);
  const totalCount = data?.getProjects?.totalCount;

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: PROJECT_LIST_CHANGED,
      variables: { filter: variables },
      updateQuery: (prev, { subscriptionData }) => {
        const event = subscriptionData.data?.operationProjectListChanged;
        const project = event?.project;
        if (!prev.getProjects || !project) return prev;

        const currentList = compactList(prev.getProjects.list ?? []);

        let updatedList = currentList;

        if (event.type === 'create') {
          const exists = currentList.some((item) => item._id === project._id);
          if (!exists) {
            updatedList = [project, ...currentList];
          }
        }

        if (event.type === 'update') {
          updatedList = currentList.map((item) =>
            item._id === project._id ? { ...item, ...project } : item,
          );
        }

        if (event.type === 'remove') {
          updatedList = currentList.filter((item) => item._id !== project._id);
        }

        return {
          ...prev,
          getProjects: {
            ...prev.getProjects,
            list: updatedList,
            totalCount:
              event.type === 'create'
                ? (prev.getProjects.totalCount ?? 0) + 1
                : event.type === 'remove'
                  ? (prev.getProjects.totalCount ?? 0) - 1
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
          direction:
            direction === EnumCursorDirection.FORWARD ? 'forward' : 'backward',
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.getProjects || !prev.getProjects) return prev;

        return {
          ...prev,
          getProjects: mergeCursorList(
            direction,
            prev.getProjects,
            fetchMoreResult.getProjects,
          ),
        };
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
  options?: QueryHookOptions<GetProjectsInlineQuery> & {
    variables?: IProjectFilter;
  },
) => {
  const variables = useProjectsVariables(options?.variables);

  const { data, loading, fetchMore } = useQuery(GET_PROJECTS_INLINE, {
    ...options,
    variables: { filter: variables },
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
  });

  const projects = data?.getProjects?.list
    ? compactList(data.getProjects.list)
    : undefined;
  const pageInfo = toCursorPageInfo(data?.getProjects?.pageInfo);
  const totalCount = data?.getProjects?.totalCount;

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
          direction:
            direction === EnumCursorDirection.FORWARD ? 'forward' : 'backward',
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.getProjects || !prev.getProjects) return prev;

        return {
          ...prev,
          getProjects: mergeCursorList(
            direction,
            prev.getProjects,
            fetchMoreResult.getProjects,
          ),
        };
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

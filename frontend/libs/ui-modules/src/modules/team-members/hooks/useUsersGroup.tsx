import { useQuery, OperationVariables, QueryHookOptions } from '@apollo/client';
import { GET_USERS_GROUP } from '../graphql/queries/userQueries';
import { EnumCursorDirection, ICursorListResponse } from 'erxes-ui';
import { IUserGroup } from 'ui-modules/modules/team-members/types/TeamMembers';

const USERS_GROUPS_PER_PAGE = 30;

export const useUsersGroup = (
  options?: QueryHookOptions<ICursorListResponse<IUserGroup>>,
) => {
  const { data, loading, fetchMore, error } = useQuery<
    ICursorListResponse<IUserGroup>
  >(GET_USERS_GROUP, {
    ...options,
    variables: {
      limit: USERS_GROUPS_PER_PAGE,
      ...options?.variables,
    },
  });

  const { list = [], totalCount = 0, pageInfo } = data?.usersGroups || {};

  const handleFetchMore = () => {
    if (totalCount <= list.length) return;

    fetchMore({
      variables: {
        ...options?.variables,
        direction: EnumCursorDirection.FORWARD,
        cursor: pageInfo?.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          ...prev,
          usersGroups: {
            ...prev.usersGroups,
            list: [
              ...(prev.usersGroups.list || []),
              ...fetchMoreResult.usersGroups.list,
            ],
            totalCount: fetchMoreResult.usersGroups.totalCount,
            pageInfo: fetchMoreResult.usersGroups.pageInfo,
          },
        };
      },
    });
  };

  return {
    usersGroups: list,
    loading,
    error,
    handleFetchMore,
    totalCount,
    pageInfo,
  };
};

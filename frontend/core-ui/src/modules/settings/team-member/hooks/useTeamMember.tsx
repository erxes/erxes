import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';

import queries from '../graphql/usersQueries'; 
import { TEAM_MEMBER_CURSOR_SESSION_KEY } from '../constants/teamMemberCursorSessionKey';
import type { IUser } from '../types';

export const TEAM_MEMBERS_PER_PAGE = 30;

type UsersResponse = {
  users: {
    list: IUser[];
    totalCount: number;
    pageInfo: IRecordTableCursorPageInfo;
  };
};

export const useTeamMemberVariables = (
  variables?: QueryHookOptions<any>['variables'],
) => {
  const [
    {
      searchValue,
      brandIds,
      branchIds,
      departmentIds,
      unitId,
      isActive,
      status,
      segment,
      excludeIds,
    },
  ] = useMultiQueryState<{
    searchValue: string;
    brandIds: string[];
    branchIds: string[];
    departmentIds: string[];
    unitId: string;

    // query string values:
    isActive: string;
    status: string;
    segment: string;
    excludeIds: string;
  }>([
    'searchValue',
    'brandIds',
    'branchIds',
    'departmentIds',
    'unitId',
    'isActive',
    'status',
    'segment',
    'excludeIds',
  ]);

  const parsedIsActive =
    isActive === 'true' ? true : isActive === 'false' ? false : undefined;

   const parsedExcludeIds = excludeIds
     ? excludeIds.split(',').filter(Boolean)
     : undefined;

  return {
    limit: TEAM_MEMBERS_PER_PAGE,
    cursor: variables?.cursor,

    searchValue: searchValue || undefined,
    brandIds: brandIds?.length ? brandIds : undefined,
    branchIds: branchIds?.length ? branchIds : undefined,
    departmentIds: departmentIds?.length ? departmentIds : undefined,
    unitId: unitId || undefined,

    // optional filters supported by your query
    status: status || undefined,
    segment: segment || undefined,
    isActive: parsedIsActive,
    excludeIds: parsedExcludeIds?.length ? parsedExcludeIds : undefined,

    ...variables,
  };
};

export const useTeamMember = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: TEAM_MEMBER_CURSOR_SESSION_KEY,
  });

  const teamMemberQueryVariables = useTeamMemberVariables({
    ...options?.variables,
    limit: TEAM_MEMBERS_PER_PAGE,
    cursor,
  });

  const { data, loading, fetchMore, error, refetch } = useQuery<UsersResponse>(
    queries.GET_USERS_QUERY,
    {
      ...options,
      skip: options?.skip || isUndefinedOrNull(teamMemberQueryVariables.cursor),
      variables: teamMemberQueryVariables,
    },
  );

  const { list: teamMembers, totalCount, pageInfo } = data?.users || {};

  const handleFetchMore = ({ direction }: { direction: EnumCursorDirection }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: TEAM_MEMBERS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          users: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.users,
            prevResult: prev.users,
          }),
        });
      },
    });
  };

  return {
    loading,
    error,
    refetch,
    teamMembers: teamMembers || [],
    totalCount: totalCount || 0,
    pageInfo,
    handleFetchMore,
    teamMemberQueryVariables,
  };
};

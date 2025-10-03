import { QueryHookOptions, useQuery } from '@apollo/client';
import { queries } from '@/settings/team-member/graphql';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { IUser, IDetailsType } from '../types';
import { TEAM_MEMBER_CURSOR_SESSION_KEY } from '../constants/teamMemberCursorSessionKey';

export const USERS_PER_PAGE = 30;

type IUsersQuery = ICursorListResponse<
  IUser & { details?: IDetailsType & { __typename?: string } }
>;

const useUsers = (options?: QueryHookOptions<IUsersQuery>) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: TEAM_MEMBER_CURSOR_SESSION_KEY,
  });
  const [
    { branchIds, departmentIds, unitId, searchValue, isActive, brandIds },
  ] = useMultiQueryState([
    'branchIds',
    'departmentIds',
    'unitId',
    'searchValue',
    'isActive',
    'brandIds',
  ]);

  const { data, loading, error, fetchMore } = useQuery<IUsersQuery>(
    queries.GET_USERS_QUERY,
    {
      ...options,
      variables: {
        branchIds: branchIds ?? undefined,
        departmentIds: departmentIds ?? undefined,
        unitId: unitId ?? undefined,
        limit: USERS_PER_PAGE,
        cursor,
        searchValue: searchValue ?? undefined,
        isActive: isActive ?? undefined,
        brandIds: brandIds ?? undefined,
        ...options?.variables,
      },
      onError(error) {
        console.error('An error occoured on fetch', error.message);
      },
    },
  );

  const { list = [], totalCount = 0, pageInfo } = data?.users || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: USERS_PER_PAGE,
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
    users: list?.map(({ details, ...user }) => {
      const { __typename, ...detailData } = details || {};
      return {
        ...user,
        details: detailData,
      };
    }),
    error,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};

export { useUsers };

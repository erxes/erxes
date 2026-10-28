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
import { IUser, IUserDetailsType } from '../types';
import { TEAM_MEMBER_CURSOR_SESSION_KEY } from '../constants/teamMemberCursorSessionKey';

export const USERS_PER_PAGE = 30;

type IUsersQuery = ICursorListResponse<
  IUser & { details?: IUserDetailsType & { __typename?: string } }
>;

const useUsers = (options?: QueryHookOptions<IUsersQuery>) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: TEAM_MEMBER_CURSOR_SESSION_KEY,
  });
  const [{ entityIds, searchValue, isActive, brandIds }] = useMultiQueryState<{
    entityIds: string[];
    searchValue: string;
    isActive: boolean;
    brandIds: string[];
  }>(['entityIds', 'searchValue', 'isActive', 'brandIds']);

  const { data, loading, error, fetchMore } = useQuery<IUsersQuery>(
    queries.GET_USERS_QUERY,
    {
      ...options,
      variables: {
        entityIds: entityIds ?? undefined,
        limit: USERS_PER_PAGE,
        cursor,
        searchValue: searchValue ?? undefined,
        isActive: isActive ?? undefined,
        brandIds: brandIds ?? undefined,
        ...options?.variables,
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

import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { GET_CLIENT_PORTAL_USERS } from '@/contacts/client-portal-users/graphql/getClientPortalUsers';
import { ICPUser, ICPUserListResponse } from '@/contacts/client-portal-users/types/cpUser';
import { CP_USERS_CURSOR_SESSION_KEY } from '@/contacts/client-portal-users/constants/cpUsersCursorSessionKey';
import { cpUserTotalCountAtom } from '@/contacts/client-portal-users/states/cpUserCounts';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';

const CP_USERS_PER_PAGE = 30;

export const useClientPortalUsers = (
  options?: QueryHookOptions<{ getClientPortalUsers: ICPUserListResponse }>,
) => {
  const setCPUserTotalCount = useSetAtom(cpUserTotalCountAtom);
  const [queries] = useMultiQueryState<{
    searchValue: string;
    type: string;
    isVerified: string;
    clientPortalId: string;
  }>(['searchValue', 'type', 'isVerified', 'clientPortalId']);

  const { cursor } = useRecordTableCursor({
    sessionKey: CP_USERS_CURSOR_SESSION_KEY,
  });

  const filter = {
    limit: CP_USERS_PER_PAGE,
    cursor: cursor ?? undefined,
    direction: 'forward' as const,
    orderBy: { createdAt: -1 },
    searchValue: queries?.searchValue || undefined,
    type: queries?.type === 'customer' || queries?.type === 'company' ? queries.type : undefined,
    isVerified:
      queries?.isVerified === 'true'
        ? true
        : queries?.isVerified === 'false'
          ? false
          : undefined,
    clientPortalId: queries?.clientPortalId || undefined,
  };

  const { data, loading, error, fetchMore } = useQuery<{
    getClientPortalUsers: ICPUserListResponse;
  }>(GET_CLIENT_PORTAL_USERS, {
    ...options,
    variables: { filter },
  });

  const { list, totalCount, pageInfo } =
    data?.getClientPortalUsers || {};

  useEffect(() => {
    if (totalCount != null) {
      setCPUserTotalCount(totalCount);
    }
  }, [totalCount, setCPUserTotalCount]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;

    fetchMore({
      variables: {
        filter: {
          ...filter,
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          limit: CP_USERS_PER_PAGE,
          direction,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          getClientPortalUsers: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.getClientPortalUsers,
            prevResult: prev.getClientPortalUsers,
          }),
        });
      },
    });
  };

  return {
    list: list || [],
    totalCount: totalCount ?? 0,
    pageInfo,
    loading,
    error,
    handleFetchMore,
    hasNextPage: pageInfo?.hasNextPage ?? false,
    hasPreviousPage: pageInfo?.hasPreviousPage ?? false,
  };
};

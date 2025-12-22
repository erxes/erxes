import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { IUser } from 'ui-modules';
import { GET_BROADCAST_MEMBERS } from '../graphql/queries';

const USERS_LIMIT = 30;

export const useBroadcastMembers = (
  options?: QueryHookOptions<ICursorListResponse<IUser>>,
) => {
  const { data, loading, fetchMore, error } = useQuery<
    ICursorListResponse<IUser>
  >(GET_BROADCAST_MEMBERS, {
    ...options,
    variables: {
      limit: USERS_LIMIT,
      ...options?.variables,
    },
  });

  const { list = [], totalCount = 0, pageInfo } = data?.engageMembers || {};

  const handleFetchMore = () => {
    if (
      !validateFetchMore({ direction: EnumCursorDirection.FORWARD, pageInfo })
    )
      return;

    fetchMore({
      variables: {
        direction: EnumCursorDirection.FORWARD,
        cursor: pageInfo?.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          engageMembers: mergeCursorData({
            direction: EnumCursorDirection.FORWARD,
            fetchMoreResult: fetchMoreResult.engageMembers,
            prevResult: prev.engageMembers,
          }),
        });
      },
    });
  };

  return {
    members: list,
    loading,
    handleFetchMore,
    error,
    totalCount,
    pageInfo,
  };
};

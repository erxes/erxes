import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { GET_ASSIGNED_MEMBER, GET_USERS } from '../graphql/queries/userQueries';
import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';

import { IUser } from '../types/TeamMembers';

const USERS_LIMIT = 30;

export const useUsers = (
  options?: QueryHookOptions<ICursorListResponse<IUser>>,
) => {
  const { data, loading, fetchMore, error } = useQuery<
    ICursorListResponse<IUser>
  >(GET_USERS, {
    ...options,
    variables: {
      limit: USERS_LIMIT,
      ...options?.variables,
    },
  });

  const { list = [], totalCount = 0, pageInfo } = data?.users || {};

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
          users: mergeCursorData({
            direction: EnumCursorDirection.FORWARD,
            fetchMoreResult: fetchMoreResult.users,
            prevResult: prev.users,
          }),
        });
      },
    });
  };

  return {
    users: list,
    loading,
    handleFetchMore,
    error,
    totalCount,
    pageInfo,
  };
};

export const useAssignedMember = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery(GET_ASSIGNED_MEMBER, options);
  return { details: data?.userDetail?.details, loading, error };
};

export interface IUserInlineData {
  userDetail: IUser;
}

export const useMemberInline = (
  options?: QueryHookOptions<IUserInlineData>,
) => {
  const { data, loading, error } = useQuery<IUserInlineData>(
    GET_ASSIGNED_MEMBER,
    options,
  );
  const { userDetail } = data || {};
  return { userDetail, loading, error };
};

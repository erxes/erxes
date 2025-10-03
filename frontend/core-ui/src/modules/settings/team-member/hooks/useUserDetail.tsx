import { OperationVariables, useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { queries } from '@/settings/team-member/graphql';
import { IDetailsType, IUserDetail } from '@/settings/team-member/types';
import { useSetAtom } from 'jotai';
import { renderingTeamMemberDetailAtom } from '@/settings/team-member/states/teamMemberDetailStates';

interface IUseUserDetailResponseData {
  userDetail: IUserDetail & { details: IDetailsType & { __typename?: string } };
}

export const useUserDetail = (options?: OperationVariables) => {
  const [_id] = useQueryState('user_id');
  const setRendering = useSetAtom(renderingTeamMemberDetailAtom);
  const { data, error, loading } = useQuery<IUseUserDetailResponseData>(
    queries.GET_USER,
    {
      ...options,
      variables: {
        _id,
      },
      skip: !_id,
      onCompleted: (data) => {
        setRendering(false);
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        setRendering(false);
        options?.onError?.(error);
      },
    },
  );
  const userDetail = data?.userDetail;

  return {
    userDetail,
    loading,
    error,
  };
};

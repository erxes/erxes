import { OperationVariables, useQuery } from '@apollo/client';
import { queries } from '@/settings/team-member/graphql';
import { IUserDetailsType, IUserDetail } from '@/settings/team-member/types';
import { useSetAtom } from 'jotai';
import { renderingTeamMemberDetailAtom } from '@/settings/team-member/states/teamMemberDetailStates';
import { USER_CONTENT_TYPE } from '@/settings/team-member/constants/teamMemberRoutes';
import { useSidePanel } from 'ui-modules';

interface IUseUserDetailResponseData {
  userDetail: IUserDetail & { details: IUserDetailsType & { __typename?: string } };
}

export const useUserDetail = (options?: OperationVariables) => {
  const { record } = useSidePanel();
  const _id =
    record?.contentType === USER_CONTENT_TYPE ? record.contentId : null;
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

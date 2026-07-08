import { QueryHookOptions, useQuery } from '@apollo/client';
import { APPROVAL_LOCK_STATE } from '../graphql/queries';
import { ApprovalLockState, ApprovalLockVariables } from '../types';

type ApprovalLockStateResponse = {
  approvalLockState: ApprovalLockState;
};

export const useApprovalLockState = (
  variables: ApprovalLockVariables,
  options?: QueryHookOptions<ApprovalLockStateResponse>,
) => {
  const { data, loading, error, refetch } = useQuery<ApprovalLockStateResponse>(
    APPROVAL_LOCK_STATE,
    {
      fetchPolicy: 'cache-and-network',
      ...options,
      variables: {
        ...variables,
        ...options?.variables,
      },
      skip: options?.skip || !variables.contentType || !variables.contentId,
    },
  );

  return {
    state: data?.approvalLockState,
    loading,
    error,
    refetch,
  };
};

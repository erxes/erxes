import { QueryHookOptions, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { APPROVAL_LOCK_STATES } from '../graphql/queries';
import { ApprovalLockState } from '../types';

type ApprovalLockStatesResponse = {
  approvalLockStates: ApprovalLockState[];
};

type ApprovalLockStatesVariables = {
  contentType: string;
  contentIds: string[];
  ownerIdsByContentId?: Record<string, string>;
  action?: string;
};

export const useApprovalLockStates = (
  variables: ApprovalLockStatesVariables,
  options?: QueryHookOptions<ApprovalLockStatesResponse>,
) => {
  const { data, loading, error, refetch } =
    useQuery<ApprovalLockStatesResponse>(APPROVAL_LOCK_STATES, {
      fetchPolicy: 'cache-and-network',
      ...options,
      variables: {
        ...variables,
        ...options?.variables,
      },
      skip:
        options?.skip ||
        !variables.contentType ||
        variables.contentIds.length === 0,
    });

  const states = data?.approvalLockStates || [];
  const statesByContentId = useMemo(
    () =>
      Object.fromEntries(
        states.map((state) => [state.contentId, state]),
      ) as Record<string, ApprovalLockState>,
    [states],
  );

  return {
    states,
    statesByContentId,
    loading,
    error,
    refetch,
  };
};

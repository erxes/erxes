import { ReactNode } from 'react';
import { Spinner } from 'erxes-ui';
import { ApprovalLockVariables } from '../types';
import { useApprovalLockState } from '../hooks';
import { ApprovalLockScreen } from './ApprovalLockScreen';

type ApprovalLockGuardProps = ApprovalLockVariables & {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
};

export const ApprovalLockGuard = ({
  children,
  fallback,
  loadingFallback,
  ...variables
}: ApprovalLockGuardProps) => {
  const { state, loading, refetch } = useApprovalLockState(variables);

  if (loading && !state) {
    return loadingFallback || <Spinner />;
  }

  if (!state || !state.locked || state.hasAccess) {
    return children;
  }

  return (
    fallback || (
      <ApprovalLockScreen state={state} onRequestCompleted={() => refetch()} />
    )
  );
};

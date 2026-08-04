import { useMutation } from '@apollo/client';
import {
  APPROVAL_LOCK_CREATE,
  APPROVAL_LOCK_RELEASE,
  APPROVAL_REQUEST_APPROVE,
  APPROVAL_REQUEST_CANCEL,
  APPROVAL_REQUEST_CREATE,
  APPROVAL_REQUEST_REJECT,
} from '../graphql/mutations';
import {
  ApprovalApproverScope,
  ApprovalLock,
  ApprovalMode,
  ApprovalRequest,
} from '../types';

type LockCreateInput = {
  contentType: string;
  contentTypeId: string;
  ownerId: string;
  allowedUserIds?: string[];
  scope?: ApprovalApproverScope;
  mode?: ApprovalMode;
};

type RequestCreateInput = {
  contentType: string;
  contentId: string;
  reason?: string;
};

export const useApprovalLockActions = () => {
  const [createLock, createLockState] = useMutation<{
    approvalLockCreate: ApprovalLock;
  }>(APPROVAL_LOCK_CREATE);
  const [releaseLock, releaseLockState] = useMutation<{
    approvalLockRelease: ApprovalLock;
  }>(APPROVAL_LOCK_RELEASE);
  const [createRequest, createRequestState] = useMutation<{
    approvalRequestCreate: ApprovalRequest;
  }>(APPROVAL_REQUEST_CREATE);
  const [approveRequest, approveRequestState] = useMutation<{
    approvalRequestApprove: ApprovalRequest;
  }>(APPROVAL_REQUEST_APPROVE);
  const [rejectRequest, rejectRequestState] = useMutation<{
    approvalRequestReject: ApprovalRequest;
  }>(APPROVAL_REQUEST_REJECT);
  const [cancelRequest, cancelRequestState] = useMutation<{
    approvalRequestCancel: ApprovalRequest;
  }>(APPROVAL_REQUEST_CANCEL);

  const loading =
    createLockState.loading ||
    releaseLockState.loading ||
    createRequestState.loading ||
    approveRequestState.loading ||
    rejectRequestState.loading ||
    cancelRequestState.loading;

  return {
    createLock: (input: LockCreateInput) =>
      createLock({ variables: { input } }),
    releaseLock: (id: string) => releaseLock({ variables: { id } }),
    createRequest: (input: RequestCreateInput) =>
      createRequest({ variables: { input } }),
    approveRequest: (id: string) => approveRequest({ variables: { id } }),
    rejectRequest: (id: string, reason?: string) =>
      rejectRequest({ variables: { id, reason } }),
    cancelRequest: (id: string) => cancelRequest({ variables: { id } }),
    loading,
  };
};

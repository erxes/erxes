import { IUser } from '../../team-members';

export type ApprovalApproverScope = 'lockerOnly' | 'lockerAndAllowedUsers';

export type ApprovalMode = 'firstWins' | 'unanimous';

export type ApprovalRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  /** Approved, but the change it carried could not be applied. */
  | 'applyFailed';

export type ApprovalRequestKind = 'access' | 'change';

/** The work a change request carries, in the words shown to its approver. */
export type ApprovalChange = {
  changeType: string;
  payload?: Record<string, unknown>;
  summary: string;
};

export type ApprovalDecisionValue = 'approved' | 'rejected';

export type ApprovalDecision = {
  userId: string;
  decision: ApprovalDecisionValue;
  reason?: string;
  at: string;
};

export type ApprovalContentMeta = {
  contentType: string;
  contentId: string;
  label?: string;
  ownerId?: string;
};

export type ApprovalLock = {
  _id: string;
  contentType: string;
  contentId: string;
  lockedBy: string;
  ownerIdSnapshot?: string;
  allowedUserIds: string[];
  approverScope: ApprovalApproverScope;
  approvalMode: ApprovalMode;
  status: 'active' | 'released';
  createdAt: string;
  releasedAt?: string;
  releasedBy?: string;
  releaseReason?: string;
};

export type ApprovalRequest = {
  _id: string;
  kind?: ApprovalRequestKind;
  change?: ApprovalChange;
  appliedAt?: string;
  applyError?: string;
  contentType: string;
  contentId: string;
  /** Access requests are about a lock; a change request has none. */
  lockId?: string;
  requesterId: string;
  reason?: string;
  status: ApprovalRequestStatus;
  requiredApproverIds: string[];
  decisions: ApprovalDecision[];
  notificationIds?: string[];
  createdAt: string;
  resolvedAt?: string;
  requester?: IUser;
  requiredApprovers?: IUser[];
  content?: ApprovalContentMeta;
};

export type ApprovalLockState = {
  contentType: string;
  contentId: string;
  action?: string;
  locked: boolean;
  hasAccess: boolean;
  reason?: string;
  content?: ApprovalContentMeta;
  lock?: ApprovalLock;
  pendingRequest?: ApprovalRequest;
};

export type ApprovalNotificationMetadata = {
  approvalRequestId: string;
  /** Absent when the request carries a change rather than asking for access. */
  lockId?: string;
  targetContentType: string;
  targetContentId: string;
  targetLabel?: string;
};

export type ApprovalLockVariables = {
  contentType: string;
  contentId: string;
  ownerId?: string;
  action?: string;
};

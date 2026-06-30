import {
  APPROVAL_APPROVER_SCOPES,
  APPROVAL_DECISIONS,
  APPROVAL_LOCK_STATUSES,
  APPROVAL_MODES,
  APPROVAL_REQUEST_STATUSES,
} from './constants';

export type ApprovalLockStatus =
  (typeof APPROVAL_LOCK_STATUSES)[keyof typeof APPROVAL_LOCK_STATUSES];

export type ApprovalApproverScope =
  (typeof APPROVAL_APPROVER_SCOPES)[keyof typeof APPROVAL_APPROVER_SCOPES];

export type ApprovalMode = (typeof APPROVAL_MODES)[keyof typeof APPROVAL_MODES];

export type ApprovalRequestStatus =
  (typeof APPROVAL_REQUEST_STATUSES)[keyof typeof APPROVAL_REQUEST_STATUSES];

export type ApprovalDecisionValue =
  (typeof APPROVAL_DECISIONS)[keyof typeof APPROVAL_DECISIONS];

export type ApprovalAction = 'view' | 'edit' | 'delete' | 'toggle' | string;

export type ApprovalDecision = {
  userId: string;
  decision: ApprovalDecisionValue;
  reason?: string;
  at: Date;
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
  status: ApprovalLockStatus;
  createdAt: Date;
  releasedAt?: Date;
  releasedBy?: string;
  releaseReason?: string;
};

export type ApprovalRequest = {
  _id: string;
  contentType: string;
  contentId: string;
  lockId: string;
  requesterId: string;
  reason?: string;
  status: ApprovalRequestStatus;
  requiredApproverIds: string[];
  decisions: ApprovalDecision[];
  notificationIds?: string[];
  createdAt: Date;
  resolvedAt?: Date;
};

export type ApprovalContentMeta = {
  contentType: string;
  contentId: string;
  label?: string;
  link?: string;
  ownerId?: string;
};

export type ApprovalLockState = {
  contentType: string;
  contentId: string;
  action?: ApprovalAction;
  locked: boolean;
  hasAccess: boolean;
  reason?: string;
  content?: ApprovalContentMeta;
  lock?: ApprovalLock;
  pendingRequest?: ApprovalRequest;
};

export type ApprovalLockCheckInput = {
  contentType: string;
  contentId: string;
  ownerId?: string;
  action?: ApprovalAction;
};

export type ApprovalLockStatesInput = {
  contentType: string;
  contentIds: string[];
  ownerIdsByContentId?: Record<string, string>;
  action?: ApprovalAction;
};

export type ApprovalRemoteLockCheckInput = ApprovalLockCheckInput & {
  subdomain: string;
  userId: string;
};

export type ApprovalRemoteLockStatesInput = ApprovalLockStatesInput & {
  subdomain: string;
  userId: string;
};

export type ApprovalLockAssertResponse = {
  allowed: boolean;
  message?: string;
  state: ApprovalLockState;
};

export type ApprovalLockCreateInput = {
  contentType: string;
  contentId: string;
  ownerId?: string;
  allowedUserIds?: string[];
  approverScope: ApprovalApproverScope;
  approvalMode: ApprovalMode;
};

export type ApprovalRequestCreateInput = {
  contentType: string;
  contentId: string;
  reason?: string;
};

export type ApprovalNotificationMetadata = {
  approvalRequestId: string;
  lockId: string;
  targetContentType: string;
  targetContentId: string;
  targetLabel?: string;
  targetLink?: string;
};

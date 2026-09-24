import {
  APPROVAL_APPROVER_SCOPES,
  APPROVAL_DECISIONS,
  APPROVAL_LOCK_STATUSES,
  APPROVAL_MODES,
  APPROVAL_REQUEST_KINDS,
  APPROVAL_REQUEST_STATUSES,
} from './constants';

export type ApprovalLockStatus =
  (typeof APPROVAL_LOCK_STATUSES)[keyof typeof APPROVAL_LOCK_STATUSES];

export type ApprovalApproverScope =
  (typeof APPROVAL_APPROVER_SCOPES)[keyof typeof APPROVAL_APPROVER_SCOPES];

export type ApprovalMode = (typeof APPROVAL_MODES)[keyof typeof APPROVAL_MODES];

export type ApprovalRequestStatus =
  (typeof APPROVAL_REQUEST_STATUSES)[keyof typeof APPROVAL_REQUEST_STATUSES];

export type ApprovalRequestKind =
  (typeof APPROVAL_REQUEST_KINDS)[keyof typeof APPROVAL_REQUEST_KINDS];

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

/**
 * The work a change request carries. The document says what kind of change it
 * is; the code registers how to apply that kind, so approval never has to know
 * what any module does.
 */
export type ApprovalChange = {
  changeType: string;
  payload?: Record<string, unknown>;
  summary: string;
};

export type ApprovalRequest = {
  _id: string;
  kind: ApprovalRequestKind;
  contentType: string;
  contentId: string;
  /** Access requests are always about a lock; change requests need none. */
  lockId?: string;
  requesterId: string;
  reason?: string;
  status: ApprovalRequestStatus;
  requiredApproverIds: string[];
  decisions: ApprovalDecision[];
  notificationIds?: string[];
  change?: ApprovalChange;
  /** When the carried change was performed, and why it was not. */
  appliedAt?: Date;
  applyError?: string;
  createdAt: Date;
  resolvedAt?: Date;
};

export type ApprovalContentMeta = {
  contentType: string;
  contentId: string;
  label?: string;
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
  contentTypeId: string;
  ownerId: string;
  allowedUserIds?: string[];
  scope?: ApprovalApproverScope;
  mode?: ApprovalMode;
};

export type ApprovalRequestCreateInput = {
  contentType: string;
  contentId: string;
  reason?: string;
  /** Present on a change request: what is being proposed. */
  change?: ApprovalChange;
  /** Who must agree to it. A change request names its own approvers. */
  approverIds?: string[];
};

export type ApprovalNotificationMetadata = {
  approvalRequestId: string;
  /** Absent when the request carries a change rather than asking for access. */
  lockId?: string;
  targetContentType: string;
  targetContentId: string;
  targetLabel?: string;
};

export enum TApprovalChangeProducers {
  APPLY = 'applyChange',
}

/**
 * Everything the owning plugin needs to carry out an approved change. The
 * request itself stays with approval; what crosses the wire is the work.
 */
export type TApprovalChangeApplyInput = {
  requestId: string;
  changeType: string;
  payload?: Record<string, unknown>;
  contentType: string;
  contentId: string;
  requesterId: string;
  approverId: string;
};

export type TApprovalChangeProducersInput = {
  [TApprovalChangeProducers.APPLY]: TApprovalChangeApplyInput;
};

export type TApprovalChangeApplierProps<TModels = any> =
  TApprovalChangeApplyInput & {
    models: TModels;
    subdomain: string;
  };

export type TApprovalChangeApplier<TModels = any> = (
  props: TApprovalChangeApplierProps<TModels>,
) => Promise<void>;

export type TApprovalChangeType = {
  type: string;
  label: string;
};

/**
 * A plugin declares the changes it can carry out and how. Approval then knows
 * only that someone owns a change type — never what that change does.
 */
export type TApprovalConfig<TModels = any> = {
  changeTypes: TApprovalChangeType[];
  appliers: Record<string, TApprovalChangeApplier<TModels>>;
  generateModels: (subdomain: string) => Promise<TModels>;
};

export const types = `
  type ApprovalDecision {
    userId: String
    decision: String
    reason: String
    at: Date
  }

  type ApprovalContentMeta {
    contentType: String
    contentId: String
    label: String
    ownerId: String
  }

  type ApprovalLock {
    _id: String!
    contentType: String
    contentId: String
    lockedBy: String
    ownerIdSnapshot: String
    allowedUserIds: [String]
    approverScope: String
    approvalMode: String
    status: String
    createdAt: Date
    releasedAt: Date
    releasedBy: String
    releaseReason: String
  }

  type ApprovalChange {
    changeType: String
    payload: JSON
    summary: String
  }

  type ApprovalRequest {
    _id: String!
    kind: String
    contentType: String
    contentId: String
    lockId: String
    requesterId: String
    reason: String
    status: String
    requiredApproverIds: [String]
    decisions: [ApprovalDecision]
    notificationIds: [String]
    change: ApprovalChange
    appliedAt: Date
    applyError: String
    createdAt: Date
    resolvedAt: Date
    requester: User
    requiredApprovers: [User]
    content: ApprovalContentMeta
  }

  type ApprovalRequestsList {
    list: [ApprovalRequest]
    totalCount: Int
    pageInfo: PageInfo
  }

  type ApprovalLockState {
    contentType: String
    contentId: String
    action: String
    locked: Boolean
    hasAccess: Boolean
    reason: String
    content: ApprovalContentMeta
    lock: ApprovalLock
    pendingRequest: ApprovalRequest
  }

  input ApprovalLockCreateInput {
    contentType: String!
    contentTypeId: String!
    ownerId: String!
    allowedUserIds: [String]
    scope: String
    mode: String
  }

  input ApprovalChangeInput {
    changeType: String!
    payload: JSON
    summary: String!
  }

  input ApprovalRequestCreateInput {
    contentType: String!
    contentId: String!
    reason: String
    # Naming a change makes this a change request: approving it performs the
    # change instead of only letting the requester past a lock.
    change: ApprovalChangeInput
    approverIds: [String]
  }
`;

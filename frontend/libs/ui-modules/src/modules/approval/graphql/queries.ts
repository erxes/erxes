import { gql } from '@apollo/client';

export const APPROVAL_LOCK_FIELDS = gql`
  fragment ApprovalLockFields on ApprovalLock {
    _id
    contentType
    contentId
    lockedBy
    ownerIdSnapshot
    allowedUserIds
    approverScope
    approvalMode
    status
    createdAt
    releasedAt
    releasedBy
    releaseReason
  }
`;

export const APPROVAL_REQUEST_FIELDS = gql`
  fragment ApprovalRequestFields on ApprovalRequest {
    _id
    contentType
    contentId
    lockId
    requesterId
    reason
    status
    requiredApproverIds
    decisions {
      userId
      decision
      reason
      at
    }
    notificationIds
    createdAt
    resolvedAt
  }
`;

export const APPROVAL_LOCK_STATE_FIELDS = gql`
  fragment ApprovalLockStateFields on ApprovalLockState {
    contentType
    contentId
    action
    locked
    hasAccess
    reason
    content {
      contentType
      contentId
      label
      ownerId
    }
    lock {
      ...ApprovalLockFields
    }
    pendingRequest {
      ...ApprovalRequestFields
    }
  }
  ${APPROVAL_LOCK_FIELDS}
  ${APPROVAL_REQUEST_FIELDS}
`;

export const APPROVAL_LOCK_STATE = gql`
  query ApprovalLockState(
    $contentType: String!
    $contentId: String!
    $ownerId: String
    $action: String
  ) {
    approvalLockState(
      contentType: $contentType
      contentId: $contentId
      ownerId: $ownerId
      action: $action
    ) {
      ...ApprovalLockStateFields
    }
  }
  ${APPROVAL_LOCK_STATE_FIELDS}
`;

export const APPROVAL_LOCK_STATES = gql`
  query ApprovalLockStates(
    $contentType: String!
    $contentIds: [String!]!
    $ownerIdsByContentId: JSON
    $action: String
  ) {
    approvalLockStates(
      contentType: $contentType
      contentIds: $contentIds
      ownerIdsByContentId: $ownerIdsByContentId
      action: $action
    ) {
      ...ApprovalLockStateFields
    }
  }
  ${APPROVAL_LOCK_STATE_FIELDS}
`;

export const APPROVAL_REQUEST_DETAIL = gql`
  query ApprovalRequestDetail($id: String!) {
    approvalRequestDetail(_id: $id) {
      ...ApprovalRequestFields
      requester {
        _id
        email
        username
        details {
          fullName
          firstName
          lastName
          avatar
        }
      }
    }
  }
  ${APPROVAL_REQUEST_FIELDS}
`;

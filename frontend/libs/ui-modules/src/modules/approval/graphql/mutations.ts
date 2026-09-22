import { gql } from '@apollo/client';
import { APPROVAL_LOCK_FIELDS, APPROVAL_REQUEST_FIELDS } from './queries';

export const APPROVAL_LOCK_CREATE = gql`
  mutation ApprovalLockCreate($input: ApprovalLockCreateInput!) {
    approvalLockCreate(input: $input) {
      ...ApprovalLockFields
    }
  }
  ${APPROVAL_LOCK_FIELDS}
`;

export const APPROVAL_LOCK_RELEASE = gql`
  mutation ApprovalLockRelease($id: String!) {
    approvalLockRelease(_id: $id) {
      ...ApprovalLockFields
    }
  }
  ${APPROVAL_LOCK_FIELDS}
`;

export const APPROVAL_REQUEST_CREATE = gql`
  mutation ApprovalRequestCreate($input: ApprovalRequestCreateInput!) {
    approvalRequestCreate(input: $input) {
      ...ApprovalRequestFields
    }
  }
  ${APPROVAL_REQUEST_FIELDS}
`;

export const APPROVAL_REQUEST_APPROVE = gql`
  mutation ApprovalRequestApprove($id: String!) {
    approvalRequestApprove(_id: $id) {
      ...ApprovalRequestFields
    }
  }
  ${APPROVAL_REQUEST_FIELDS}
`;

export const APPROVAL_REQUEST_REJECT = gql`
  mutation ApprovalRequestReject($id: String!, $reason: String) {
    approvalRequestReject(_id: $id, reason: $reason) {
      ...ApprovalRequestFields
    }
  }
  ${APPROVAL_REQUEST_FIELDS}
`;

export const APPROVAL_REQUEST_CANCEL = gql`
  mutation ApprovalRequestCancel($id: String!) {
    approvalRequestCancel(_id: $id) {
      ...ApprovalRequestFields
    }
  }
  ${APPROVAL_REQUEST_FIELDS}
`;

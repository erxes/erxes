import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const queries = `
  approvalLockState(contentType: String!, contentId: String!, ownerId: String, action: String): ApprovalLockState
  approvalLockStates(contentType: String!, contentIds: [String!]!, ownerIdsByContentId: JSON, action: String): [ApprovalLockState]
  approvalRequestDetail(_id: String!): ApprovalRequest
  approvalRequests(${GQL_CURSOR_PARAM_DEFS}, status: String, contentType: String, requesterIds: [String], approverIds: [String]): ApprovalRequestsList
`;

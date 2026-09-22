export const mutations = `
  approvalLockCreate(input: ApprovalLockCreateInput!): ApprovalLock
  approvalLockRelease(_id: String!): ApprovalLock
  approvalLockForceRelease(_id: String!, reason: String!): ApprovalLock
  approvalRequestCreate(input: ApprovalRequestCreateInput!): ApprovalRequest
  approvalRequestApprove(_id: String!): ApprovalRequest
  approvalRequestReject(_id: String!, reason: String): ApprovalRequest
  approvalRequestCancel(_id: String!): ApprovalRequest
`;

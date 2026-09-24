import { Document, Schema } from 'mongoose';
import {
  APPROVAL_DECISIONS,
  APPROVAL_REQUEST_KINDS,
  APPROVAL_REQUEST_STATUSES,
  ApprovalDecision,
  ApprovalDecisionValue,
  ApprovalRequest,
  ApprovalRequestKind,
  ApprovalRequestStatus,
} from 'erxes-api-shared/core-modules';

export interface IApprovalRequestDocument
  extends Omit<ApprovalRequest, '_id'>,
    Document {
  _id: string;
}

const approvalDecisionSchema = new Schema<ApprovalDecision>(
  {
    userId: { type: String, required: true },
    decision: {
      type: String,
      enum: Object.values(APPROVAL_DECISIONS) as ApprovalDecisionValue[],
      required: true,
    },
    reason: { type: String },
    at: { type: Date, default: Date.now, required: true },
  },
  { _id: false },
);

const approvalChangeSchema = new Schema(
  {
    changeType: { type: String, required: true },
    payload: { type: Object },
    summary: { type: String, required: true },
  },
  { _id: false },
);

export const approvalRequestSchema = new Schema<IApprovalRequestDocument>({
  kind: {
    type: String,
    enum: Object.values(APPROVAL_REQUEST_KINDS) as ApprovalRequestKind[],
    default: APPROVAL_REQUEST_KINDS.ACCESS,
    required: true,
    index: true,
  },
  contentType: { type: String, required: true, index: true },
  contentId: { type: String, required: true, index: true },
  // Access requests are always about a lock; a change request carries the work
  // itself and needs none.
  lockId: { type: String, index: true },
  requesterId: { type: String, required: true, index: true },
  reason: { type: String },
  status: {
    type: String,
    enum: Object.values(APPROVAL_REQUEST_STATUSES) as ApprovalRequestStatus[],
    default: APPROVAL_REQUEST_STATUSES.PENDING,
    required: true,
    index: true,
  },
  requiredApproverIds: { type: [String], default: [], index: true },
  decisions: { type: [approvalDecisionSchema], default: [] },
  notificationIds: { type: [String], default: [] },
  change: { type: approvalChangeSchema },
  appliedAt: { type: Date },
  applyError: { type: String },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

approvalRequestSchema.index(
  { lockId: 1, requesterId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: APPROVAL_REQUEST_STATUSES.PENDING,
      kind: APPROVAL_REQUEST_KINDS.ACCESS,
    },
  },
);

// One pending change of a kind per record: two people must not be able to
// propose the same move at the same time and have both applied.
approvalRequestSchema.index(
  { contentType: 1, contentId: 1, 'change.changeType': 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: APPROVAL_REQUEST_STATUSES.PENDING,
      kind: APPROVAL_REQUEST_KINDS.CHANGE,
    },
  },
);
approvalRequestSchema.index({ requiredApproverIds: 1, status: 1 });
approvalRequestSchema.index({ requesterId: 1, status: 1 });

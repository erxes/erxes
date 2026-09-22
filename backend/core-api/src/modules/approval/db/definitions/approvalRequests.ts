import { Document, Schema } from 'mongoose';
import {
  APPROVAL_DECISIONS,
  APPROVAL_REQUEST_STATUSES,
  ApprovalDecision,
  ApprovalDecisionValue,
  ApprovalRequest,
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

export const approvalRequestSchema = new Schema<IApprovalRequestDocument>({
  contentType: { type: String, required: true, index: true },
  contentId: { type: String, required: true, index: true },
  lockId: { type: String, required: true, index: true },
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
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

approvalRequestSchema.index(
  { lockId: 1, requesterId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: APPROVAL_REQUEST_STATUSES.PENDING },
  },
);
approvalRequestSchema.index({ requiredApproverIds: 1, status: 1 });
approvalRequestSchema.index({ requesterId: 1, status: 1 });

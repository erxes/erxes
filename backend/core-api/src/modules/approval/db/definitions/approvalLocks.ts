import { Document, Schema } from 'mongoose';
import {
  APPROVAL_APPROVER_SCOPES,
  APPROVAL_LOCK_STATUSES,
  APPROVAL_MODES,
  ApprovalApproverScope,
  ApprovalLock,
  ApprovalLockStatus,
  ApprovalMode,
} from 'erxes-api-shared/core-modules';

export interface IApprovalLockDocument
  extends Omit<ApprovalLock, '_id'>,
    Document {
  _id: string;
}

export const approvalLockSchema = new Schema<IApprovalLockDocument>({
  contentType: { type: String, required: true, index: true },
  contentId: { type: String, required: true, index: true },
  lockedBy: { type: String, required: true, index: true },
  ownerIdSnapshot: { type: String },
  allowedUserIds: { type: [String], default: [] },
  approverScope: {
    type: String,
    enum: Object.values(APPROVAL_APPROVER_SCOPES) as ApprovalApproverScope[],
    default: APPROVAL_APPROVER_SCOPES.LOCKER_ONLY,
    required: true,
  },
  approvalMode: {
    type: String,
    enum: Object.values(APPROVAL_MODES) as ApprovalMode[],
    default: APPROVAL_MODES.FIRST_WINS,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(APPROVAL_LOCK_STATUSES) as ApprovalLockStatus[],
    default: APPROVAL_LOCK_STATUSES.ACTIVE,
    required: true,
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
  releasedAt: { type: Date },
  releasedBy: { type: String },
  releaseReason: { type: String },
});

approvalLockSchema.index({ contentType: 1, contentId: 1, status: 1 });
approvalLockSchema.index(
  { contentType: 1, contentId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: APPROVAL_LOCK_STATUSES.ACTIVE },
  },
);

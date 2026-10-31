import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';

export const SUPPORT_ACCESS_MODES = ['off', 'approval', 'allow'] as const;
export type SupportAccessMode = (typeof SUPPORT_ACCESS_MODES)[number];

export const SUPPORT_GRANT_HOURS = [1, 4, 24, 168];

export interface ISupportAccessPolicy {
  // False off erxes cloud or without global-profile's keys: nobody can enter
  available: boolean;
  // What a visit meets now: allow becomes approval once allowUntil passes
  mode: SupportAccessMode;
  configuredMode: SupportAccessMode;
  allowUntil?: Date;
  // Groups for allow-window visits; empty means every plugin's admin group
  permissionGroupIds: string[];
}

export interface ISupportAccessPolicyInput {
  mode: SupportAccessMode;
  allowUntil?: Date | null;
  permissionGroupIds: string[];
}

export interface ISupportGrantApproval {
  hours: number;
  permissionGroupIds: string[];
}

export type SupportGrantStatus = 'pending' | 'approved' | 'denied' | 'revoked';

export interface ISupportGrantVisit {
  enteredAt: Date;
  reason: string;
}

export interface ISupportGrant {
  // global-profile admin the grant is for; one support user per staff member
  staffId: string;
  staffName: string;
  staffEmail?: string;
  userId: string;
  reason: string;
  status: SupportGrantStatus;
  // Let in by the allow window, not by a person
  autoApproved: boolean;
  permissionGroupIds: string[];
  decidedBy?: string;
  decidedAt?: Date;
  // Access and every session on it end here
  endsAt?: Date;
  revokedBy?: string;
  revokedAt?: Date;
  visits: ISupportGrantVisit[];
}

export interface ISupportGrantDocument extends ISupportGrant, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const visitSchema = new Schema(
  {
    enteredAt: { type: Date, label: 'Entered at' },
    reason: { type: String, label: 'Reason' },
  },
  { _id: false },
);

export const supportGrantSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    staffId: { type: String, label: 'Staff id', required: true },
    staffName: { type: String, label: 'Staff name', required: true },
    staffEmail: { type: String, label: 'Staff email' },
    userId: {
      type: String,
      label: 'Support user id',
      required: true,
      index: true,
    },
    reason: { type: String, label: 'Reason' },
    status: {
      type: String,
      label: 'Status',
      enum: ['pending', 'approved', 'denied', 'revoked'],
      required: true,
    },
    autoApproved: { type: Boolean, label: 'Auto approved', default: false },
    permissionGroupIds: {
      type: [String],
      label: 'Permission group ids',
      default: [],
    },
    decidedBy: { type: String, label: 'Decided by' },
    decidedAt: { type: Date, label: 'Decided at' },
    endsAt: { type: Date, label: 'Ends at' },
    revokedBy: { type: String, label: 'Revoked by' },
    revokedAt: { type: Date, label: 'Revoked at' },
    visits: { type: [visitSchema], label: 'Visits', default: [] },
  },
  {
    timestamps: true,
  },
);

// One open request per staff member, even when two visits race
supportGrantSchema.index(
  { staffId: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } },
);
supportGrantSchema.index({ status: 1, endsAt: 1 });
supportGrantSchema.index({ createdAt: -1 });

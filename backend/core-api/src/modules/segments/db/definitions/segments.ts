import { schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';
import { SegmentNode } from 'erxes-api-shared/core-modules';
import { segmentNodeSchema } from './segmentNodes';

export type SegmentVisibility = 'private' | 'organization';

export type SegmentStatus =
  | 'draft'
  | 'building'
  | 'active'
  | 'failed'
  | 'cancelled';

export interface ISegment {
  contentType: string;

  name: string;
  description?: string;
  color?: string;

  root: SegmentNode;

  dependsOn: string[];

  fingerprint: string;

  visibility: SegmentVisibility;
  ownerId: string;

  status: SegmentStatus;
  revision: number;

  membersCount?: number;
  membersCountedAt?: Date;
  reconciledAt?: Date;

  buildStartedAt?: Date;
  buildProcessed?: number;
  timeSensitive?: boolean;
  buildTotal?: number;
  buildCancelRequested?: boolean;

  createdBy: string;
  updatedBy?: string;
}

export interface ISegmentDocument extends ISegment, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const segmentSchema = schemaWrapper(
  new Schema(
    {
      contentType: { type: String, required: true, label: 'Content type' },

      name: { type: String, required: true, label: 'Name' },
      description: { type: String, optional: true },
      color: { type: String, optional: true },

      root: { type: segmentNodeSchema, required: true },

      dependsOn: { type: [String], default: [], label: 'Depends on' },
      fingerprint: { type: String, optional: true, label: 'Fingerprint' },

      visibility: {
        type: String,
        enum: ['private', 'organization'],
        default: 'organization',
        label: 'Visibility',
      },
      ownerId: { type: String, required: true, label: 'Owner' },

      status: {
        type: String,
        enum: ['draft', 'building', 'active', 'failed', 'cancelled'],
        default: 'active',
        label: 'Status',
      },
      revision: { type: Number, default: 1 },

      membersCount: { type: Number, optional: true },
      membersCountedAt: { type: Date, optional: true },
      reconciledAt: { type: Date, optional: true },

      buildStartedAt: { type: Date, optional: true },
      buildProcessed: { type: Number, optional: true },
      timeSensitive: { type: Boolean, optional: true },
      buildTotal: { type: Number, optional: true },
      buildCancelRequested: { type: Boolean, optional: true },

      createdBy: { type: String, required: true },
      updatedBy: { type: String, optional: true },
    },
    { timestamps: true },
  ),
);

segmentSchema.index({ contentType: 1, visibility: 1, status: 1 });
segmentSchema.index({ ownerId: 1, updatedAt: -1 });
segmentSchema.index({ dependsOn: 1, status: 1 });
segmentSchema.index({ contentType: 1, fingerprint: 1 });

segmentSchema.index({ status: 1, reconciledAt: 1 });

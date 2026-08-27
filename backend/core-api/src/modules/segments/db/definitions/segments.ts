import { schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';
import { SegmentNode } from 'erxes-api-shared/core-modules';
import { segmentNodeSchema } from './segmentNodes';

/**
 * A segment: one condition tree, who may see it, and how it is evaluated.
 *
 * `visibility` and `executionMode` are separate axes on purpose - a private
 * segment can be materialised and an organisation-wide one can stay dynamic.
 */

/** Who may see the segment. Independent of how it is evaluated. */
export type SegmentVisibility = 'private' | 'team' | 'organization';

/** How the segment is evaluated. Independent of who may see it. */
export type SegmentExecutionMode = 'dynamic' | 'materialized';

export type SegmentStatus = 'draft' | 'building' | 'active' | 'failed';

export interface ISegment {
  contentType: string;

  name: string;
  description?: string;
  color?: string;

  /** Always a group node, so an empty segment is a group with no children. */
  root: SegmentNode;

  /**
   * Content types this segment reads, its own included. Derived from the tree
   * on every save - it is how a change to a deal finds the customer segments
   * that count deals.
   */
  dependsOn: string[];

  /**
   * Identity of what the segment asks, canonical so two ways of typing the
   * same question collide. Used to find a segment that already answers it.
   */
  fingerprint: string;

  visibility: SegmentVisibility;
  ownerId: string;
  teamId?: string;

  executionMode: SegmentExecutionMode;
  status: SegmentStatus;
  revision: number;

  /**
   * Materialised member count. Absent until the segmentation worker has
   * counted, which is not the same as a count of zero.
   */
  membersCount?: number;
  membersCountedAt?: Date;

  /**
   * How far a running rebuild has got. There is no total to compare it to -
   * the definition is paged through, so how many members it will find is not
   * known until it ends.
   */
  buildStartedAt?: Date;
  buildProcessed?: number;

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
        enum: ['private', 'team', 'organization'],
        default: 'organization',
        label: 'Visibility',
      },
      ownerId: { type: String, required: true, label: 'Owner' },
      teamId: { type: String, optional: true },

      executionMode: {
        type: String,
        enum: ['dynamic', 'materialized'],
        default: 'dynamic',
        label: 'Execution mode',
      },
      status: {
        type: String,
        enum: ['draft', 'building', 'active', 'failed'],
        default: 'active',
        label: 'Status',
      },
      revision: { type: Number, default: 1 },

      membersCount: { type: Number, optional: true },
      membersCountedAt: { type: Date, optional: true },

      buildStartedAt: { type: Date, optional: true },
      buildProcessed: { type: Number, optional: true },

      createdBy: { type: String, required: true },
      updatedBy: { type: String, optional: true },
    },
    { timestamps: true },
  ),
);

segmentSchema.index({ contentType: 1, visibility: 1, status: 1 });
segmentSchema.index({ ownerId: 1, updatedAt: -1 });
segmentSchema.index({ status: 1, executionMode: 1 });
// The segmentation worker's only lookup: what has to be re-checked now that
// records of this content type have changed.
segmentSchema.index({ dependsOn: 1, status: 1 });
// Narrows to the segments that might ask the same thing; the canonical text
// settles whether they really do.
segmentSchema.index({ contentType: 1, fingerprint: 1 });

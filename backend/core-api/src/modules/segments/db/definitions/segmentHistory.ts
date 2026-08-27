import { schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';

/**
 * What has happened to a segment's membership, and when.
 *
 * Two shapes for two questions. A transition answers "when did this record
 * join or leave", written only when membership actually moves, so its size
 * follows real churn rather than how often segments are evaluated. A daily
 * count answers "how has this segment grown", kept as one row per segment per
 * day so a chart is a range scan rather than a fold over every transition.
 */

export type SegmentTransitionAction = 'joined' | 'left';

export interface ISegmentTransition {
  segmentId: string;
  /** The segment's own content type, so a record's history can be grouped. */
  contentType: string;
  recordId: string;
  action: SegmentTransitionAction;
  createdAt: Date;
}

export interface ISegmentTransitionDocument
  extends ISegmentTransition,
    Document {
  _id: string;
}

export const segmentTransitionSchema = schemaWrapper(
  new Schema({
    segmentId: { type: String, required: true },
    contentType: { type: String, required: true },
    recordId: { type: String, required: true },
    action: { type: String, enum: ['joined', 'left'], required: true },
    createdAt: { type: Date, default: Date.now },
  }),
);

// One record's story, newest first.
segmentTransitionSchema.index({ recordId: 1, createdAt: -1 });
// One segment's story, and the range scan behind the growth chart.
segmentTransitionSchema.index({ segmentId: 1, createdAt: -1 });

export interface ISegmentDailyCount {
  segmentId: string;
  /** UTC day, as `YYYY-MM-DD`, so a range is a plain string comparison. */
  date: string;
  count: number;
  updatedAt: Date;
}

export interface ISegmentDailyCountDocument
  extends ISegmentDailyCount,
    Document {
  _id: string;
}

export const segmentDailyCountSchema = schemaWrapper(
  new Schema({
    segmentId: { type: String, required: true },
    date: { type: String, required: true },
    count: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now },
  }),
);

// Last write of the day wins, so the row is the day's closing membership.
segmentDailyCountSchema.index({ segmentId: 1, date: 1 }, { unique: true });

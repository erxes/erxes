import { schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';

export type SegmentTransitionAction = 'joined' | 'left';

export interface ISegmentTransition {
  segmentId: string;
  contentType: string;
  recordId: string;
  action: SegmentTransitionAction;
  createdAt: Date;
}

export interface ISegmentTransitionDocument
  extends ISegmentTransition, Document {
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

segmentTransitionSchema.index({ recordId: 1, createdAt: -1 });
segmentTransitionSchema.index({ segmentId: 1, createdAt: -1 });

export interface ISegmentDailyCount {
  segmentId: string;
  date: string;
  count: number;
  updatedAt: Date;
}

export interface ISegmentDailyCountDocument
  extends ISegmentDailyCount, Document {
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

segmentDailyCountSchema.index({ segmentId: 1, date: 1 }, { unique: true });

export type SegmentLevelReason = 'rebuild';

export interface ISegmentLevelSample {
  segmentId: string;
  count: number;
  at: Date;
  reason: SegmentLevelReason;
}

export interface ISegmentLevelSampleDocument
  extends ISegmentLevelSample, Document {
  _id: string;
}

export const segmentLevelSampleSchema = schemaWrapper(
  new Schema({
    segmentId: { type: String, required: true },
    count: { type: Number, required: true },
    at: { type: Date, required: true },
    reason: { type: String, enum: ['rebuild'], required: true },
  }),
);

segmentLevelSampleSchema.index({ segmentId: 1, at: -1 });

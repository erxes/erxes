import { Document, Schema } from 'mongoose';
import { BOARD_TYPES, HACK_SCORING_TYPES, PIPELINE_VISIBLITIES, PROBABILITY } from './constants';
import { field, schemaWrapper } from './utils';

interface ICommonFields {
  userId?: string;
  createdAt?: Date;
  order?: number;
  type: string;
}

export interface IItemCommonFields {
  name?: string;
  // TODO migrate after remove 2row
  companyIds?: string[];
  customerIds?: string[];
  closeDate?: Date;
  description?: string;
  assignedUserIds?: string[];
  watchedUserIds?: string[];
  notifiedUserIds?: string[];
  attachments?: any[];
  stageId?: string;
  initialStageId?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  userId?: string;
  createdAt?: Date;
  order?: number;
  searchText?: string;
}

export interface IBoard extends ICommonFields {
  name?: string;
}

export interface IBoardDocument extends IBoard, Document {
  _id: string;
}

export interface IPipeline extends ICommonFields {
  name?: string;
  boardId?: string;
  visibility?: string;
  memberIds?: string[];
  bgColor?: string;
  watchedUserIds?: string[];
  // growth hack
  startDate?: Date;
  endDate?: Date;
  metric?: string;
  hackScoringType?: string;
  templateId?: string;
}

export interface IPipelineDocument extends IPipeline, Document {
  _id: string;
}

export interface IStage extends ICommonFields {
  name?: string;
  probability?: string;
  pipelineId: string;
  formId?: string;
}

export interface IStageDocument extends IStage, Document {
  _id: string;
}

// Not mongoose document, just stage shaped plain object
export type IPipelineStage = IStage & { _id: string };

export interface IOrderInput {
  _id: string;
  order: number;
}

const attachmentSchema = new Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
    type: field({ type: String }),
    size: field({ type: Number, optional: true }),
  },
  { _id: false },
);

// Mongoose schemas =======================
const commonFieldsSchema = {
  userId: field({ type: String }),
  createdAt: field({
    type: Date,
    default: new Date(),
  }),
  order: field({ type: Number }),
  type: field({
    type: String,
    enum: BOARD_TYPES.ALL,
    required: true,
  }),
};

export const commonItemFieldsSchema = {
  _id: field({ pkey: true }),
  userId: field({ type: String }),
  createdAt: field({
    type: Date,
    default: new Date(),
  }),
  order: field({ type: Number }),
  name: field({ type: String }),
  closeDate: field({ type: Date }),
  reminderMinute: field({ type: Number }),
  isComplete: field({ type: Boolean, default: false }),
  description: field({ type: String, optional: true }),
  assignedUserIds: field({ type: [String] }),
  watchedUserIds: field({ type: [String] }),
  attachments: field({ type: [attachmentSchema] }),
  stageId: field({ type: String }),
  initialStageId: field({ type: String, optional: true }),
  modifiedAt: field({
    type: Date,
    default: new Date(),
  }),
  modifiedBy: field({ type: String }),
  searchText: field({ type: String, optional: true, index: true }),
};

export const boardSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String }),
    ...commonFieldsSchema,
  }),
);

export const pipelineSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  boardId: field({ type: String }),
  visibility: field({
    type: String,
    enum: PIPELINE_VISIBLITIES.ALL,
    default: PIPELINE_VISIBLITIES.PUBLIC,
  }),
  watchedUserIds: field({ type: [String] }),
  memberIds: field({ type: [String] }),
  bgColor: field({ type: String }),
  // Growth hack
  startDate: field({ type: Date, optional: true }),
  endDate: field({ type: Date, optional: true }),
  metric: field({ type: String, optional: true }),
  hackScoringType: field({
    type: String,
    enum: HACK_SCORING_TYPES.ALL,
  }),
  templateId: field({ type: String, optional: true }),
  ...commonFieldsSchema,
});

export const stageSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  probability: field({
    type: String,
    enum: PROBABILITY.ALL,
  }), // Win probability
  pipelineId: field({ type: String }),
  formId: field({ type: String }),
  ...commonFieldsSchema,
});

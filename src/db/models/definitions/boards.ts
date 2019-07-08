import { Document, Schema } from 'mongoose';
import { field } from '../utils';
import { BOARD_TYPES, PIPELINE_VISIBLITIES, PROBABILITY } from './constants';

interface ICommonFields {
  userId?: string;
  createdAt?: Date;
  order?: number;
  type: string;
}

export interface IItemCommonFields {
  name?: string;
  companyIds?: string[];
  customerIds?: string[];
  closeDate?: Date;
  description?: string;
  assignedUserIds?: string[];
  watchedUserIds?: string[];
  notifiedUserIds?: string[];
  stageId?: string;
  initialStageId?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  userId?: string;
  createdAt?: Date;
  order?: number;
}

export interface IBoard extends ICommonFields {
  name?: string;
  isDefault?: boolean;
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
}

export interface IPipelineDocument extends IPipeline, Document {
  _id: string;
}

export interface IStage extends ICommonFields {
  name?: string;
  probability?: string;
  pipelineId?: string;
}

export interface IStageDocument extends IStage, Document {
  _id: string;
}

export interface IOrderInput {
  _id: string;
  order: number;
}

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
  companyIds: field({ type: [String] }),
  customerIds: field({ type: [String] }),
  closeDate: field({ type: Date }),
  description: field({ type: String, optional: true }),
  assignedUserIds: field({ type: [String] }),
  watchedUserIds: field({ type: [String] }),
  stageId: field({ type: String, optional: true }),
  initialStageId: field({ type: String, optional: true }),
  modifiedAt: field({
    type: Date,
    default: new Date(),
  }),
  modifiedBy: field({ type: String }),
};

export const boardSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  isDefault: field({
    type: Boolean,
    default: false,
  }),
  ...commonFieldsSchema,
});

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
  ...commonFieldsSchema,
});

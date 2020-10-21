import { Document, Schema } from 'mongoose';
import {
  BOARD_STATUSES,
  BOARD_TYPES,
  HACK_SCORING_TYPES,
  PIPELINE_VISIBLITIES,
  PROBABILITY,
  TIME_TRACK_TYPES,
} from './constants';
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
  labelIds?: string[];
  attachments?: any[];
  stageId: string;
  initialStageId?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
  userId?: string;
  createdAt?: Date;
  order?: number;
  searchText?: string;
  priority?: string;
  sourceConversationId?: string;
  status?: string;
  timeTrack?: {
    status: string;
    timeSpent: number;
    startDate?: string;
  };
}

export interface IItemCommonFieldsDocument extends IItemCommonFields, Document {
  _id: string;
}

export interface IItemDragCommonFields {
  proccessId: string;
  itemId: string;
  aboveItemId?: string;
  destinationStageId: string;
  sourceStageId: string;
}

export interface IBoard extends ICommonFields {
  name?: string;
}

export interface IBoardDocument extends IBoard, Document {
  _id: string;
}

export interface IPipeline extends ICommonFields {
  name?: string;
  boardId: string;
  visibility?: string;
  memberIds?: string[];
  bgColor?: string;
  watchedUserIds?: string[];

  startDate?: Date;
  endDate?: Date;
  metric?: string;
  hackScoringType?: string;
  templateId?: string;
  isCheckUser?: boolean;
  excludeCheckUserIds?: string[];
}

export interface IPipelineDocument extends IPipeline, Document {
  _id: string;
}

export interface IStage extends ICommonFields {
  name?: string;
  probability?: string;
  pipelineId: string;
  formId?: string;
  status?: string;
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

export const attachmentSchema = new Schema(
  {
    name: field({ type: String, label: 'Name' }),
    url: field({ type: String, label: 'Url' }),
    type: field({ type: String, label: 'Type' }),
    size: field({ type: Number, optional: true, label: 'Size' }),
  },
  { _id: false },
);

// Mongoose schemas =======================
const commonFieldsSchema = {
  userId: field({ type: String, label: 'Created by' }),
  createdAt: field({
    type: Date,
    default: new Date(),
    label: 'Created at',
  }),
  order: field({ type: Number, label: 'Order' }),
  type: field({
    type: String,
    enum: BOARD_TYPES.ALL,
    required: true,
    label: 'Type',
  }),
};

const timeTrackSchema = new Schema(
  {
    startDate: field({ type: String }),
    timeSpent: field({ type: Number }),
    status: field({
      type: String,
      enum: TIME_TRACK_TYPES.ALL,
      default: TIME_TRACK_TYPES.STOPPED,
    }),
  },
  { _id: false },
);

export const commonItemFieldsSchema = {
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' }),
  order: field({ type: Number, label: 'Order' }),
  name: field({ type: String, label: 'Name' }),
  closeDate: field({ type: Date, label: 'Close date' }),
  reminderMinute: field({ type: Number, label: 'Reminder minute' }),
  isComplete: field({ type: Boolean, default: false, label: 'Is complete' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  assignedUserIds: field({ type: [String], label: 'Assigned users' }),
  watchedUserIds: field({ type: [String], label: 'Watched users' }),
  labelIds: field({ type: [String], label: 'Labels' }),
  attachments: field({ type: [attachmentSchema], label: 'Attachments' }),
  stageId: field({ type: String, label: 'Stage', index: true }),
  initialStageId: field({ type: String, optional: true, label: 'Initial stage' }),
  modifiedAt: field({
    type: Date,
    default: new Date(),
    label: 'Modified at',
  }),
  modifiedBy: field({ type: String, label: 'Modified by' }),
  searchText: field({ type: String, optional: true, index: true }),
  priority: field({ type: String, optional: true, label: 'Priority' }),
  sourceConversationId: field({ type: String, optional: true }),
  timeTrack: field({
    type: timeTrackSchema,
  }),
  status: field({
    type: String,
    enum: BOARD_STATUSES.ALL,
    default: BOARD_STATUSES.ACTIVE,
    index: true,
  }),
};

export const boardSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    ...commonFieldsSchema,
  }),
);

export const pipelineSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  boardId: field({ type: String, label: 'Board' }),
  visibility: field({
    type: String,
    enum: PIPELINE_VISIBLITIES.ALL,
    default: PIPELINE_VISIBLITIES.PUBLIC,
    label: 'Visibility',
  }),
  watchedUserIds: field({ type: [String], label: 'Watched users' }),
  memberIds: field({ type: [String], label: 'Members' }),
  bgColor: field({ type: String, label: 'Background color' }),
  // Growth hack
  startDate: field({ type: Date, optional: true, label: 'Start date' }),
  endDate: field({ type: Date, optional: true, label: 'End date' }),
  metric: field({ type: String, optional: true, label: 'Metric' }),
  hackScoringType: field({
    type: String,
    enum: HACK_SCORING_TYPES.ALL,
    label: 'Hacking scoring type',
  }),
  templateId: field({ type: String, optional: true, label: 'Template' }),
  isCheckUser: field({ type: Boolean, optional: true, label: 'Show only the users created or assigned cards' }),
  excludeCheckUserIds: field({ type: [String], optional: true, label: 'Users elligible to see all cards' }),
  ...commonFieldsSchema,
});

export const stageSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  probability: field({
    type: String,
    enum: PROBABILITY.ALL,
    label: 'Probability',
  }), // Win probability
  pipelineId: field({ type: String, label: 'Pipeline' }),
  formId: field({ type: String, label: 'Form' }),
  status: field({
    type: String,
    enum: BOARD_STATUSES.ALL,
    default: BOARD_STATUSES.ACTIVE,
  }),
  ...commonFieldsSchema,
});

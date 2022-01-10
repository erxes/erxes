import { Document, Schema } from 'mongoose';
import { customFieldSchema, ICustomField } from './common';
import {
  BOARD_STATUSES,
  BOARD_STATUSES_OPTIONS,
  BOARD_TYPES,
  HACK_SCORING_TYPES,
  PIPELINE_VISIBLITIES,
  PROBABILITY,
  TIME_TRACK_TYPES
} from './constants';

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
  startDate?: Date;
  closeDate?: Date;
  stageChangedDate?: Date;
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
  sourceConversationIds?: string[];
  status?: string;
  timeTrack?: {
    status: string;
    timeSpent: number;
    startDate?: string;
  };
  customFieldsData?: ICustomField[];
  score?: number;
  number?: string;
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
  pipelines?: IPipeline[];
}

export interface IBoardDocument extends IBoard, Document {
  _id: string;
}

export interface IPipeline extends ICommonFields {
  name?: string;
  boardId: string;
  status?: string;
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
  numberConfig?: string;
  numberSize?: string;
  lastNum?: string;
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
    name: { type: String },
    url: { type: String },
    type: { type: String },
    size: { type: Number, optional: true },
    duration: { type: Number, optional: true }
  },
  { _id: false }
);

// Mongoose schemas =======================
const commonFieldsSchema = {
  userId: { type: String, label: 'Created by' },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at'
  },
  order: { type: Number, label: 'Order' },
  type: {
    type: String,
    enum: BOARD_TYPES.ALL,
    required: true,
    label: 'Type'
  }
};

const timeTrackSchema = new Schema(
  {
    startDate: { type: String },
    timeSpent: { type: Number },
    status: {
      type: String,
      enum: TIME_TRACK_TYPES.ALL,
      default: TIME_TRACK_TYPES.STOPPED
    }
  },
  { _id: false }
);

const relationSchema = new Schema(
  {
    id: { type: String },
    start: { type: String },
    end: { type: String }
  },
  { _id: false }
);

export const commonItemFieldsSchema = {
  _id: { pkey: true },
  userId: { type: String, esType: 'keyword' },
  createdAt: { type: Date, label: 'Created at', esType: 'date' },
  order: { type: Number },
  name: { type: String, label: 'Name' },
  startDate: { type: Date, label: 'Start date', esType: 'date' },
  closeDate: { type: Date, label: 'Close date', esType: 'date' },
  stageChangedDate: {
    type: Date,
    label: 'Stage changed date',
    esType: 'date'
  },
  reminderMinute: { type: Number, label: 'Reminder minute' },
  isComplete: {
    type: Boolean,
    default: false,
    label: 'Is complete',
    esType: 'boolean'
  },
  description: { type: String, optional: true, label: 'Description' },
  assignedUserIds: { type: [String], esType: 'keyword' },
  watchedUserIds: { type: [String], esType: 'keyword' },
  labelIds: { type: [String], esType: 'keyword' },
  attachments: { type: [attachmentSchema], label: 'Attachments' },
  stageId: { type: String, index: true },
  initialStageId: {
    type: String,
    optional: true
  },
  modifiedAt: {
    type: Date,
    default: new Date(),
    label: 'Modified at',
    esType: 'date'
  },
  modifiedBy: { type: String, esType: 'keyword' },
  searchText: { type: String, optional: true, index: true },
  priority: { type: String, optional: true, label: 'Priority' },
  // TODO remove after migration
  sourceConversationId: { type: String, optional: true },
  sourceConversationIds: { type: [String], optional: true },
  timeTrack: {
    type: timeTrackSchema
  },
  status: {
    type: String,
    enum: BOARD_STATUSES.ALL,
    default: BOARD_STATUSES.ACTIVE,
    label: 'Status',
    selectOptions: BOARD_STATUSES_OPTIONS,
    index: true
  },
  customFieldsData: {
    type: [customFieldSchema],
    optional: true,
    label: 'Custom fields data'
  },
  score: {
    type: Number,
    optional: true,
    label: 'Score',
    esType: 'number'
  },
  number: {
    type: String,
    unique: true,
    sparse: true,
    label: 'Item number'
  },
  relations: {
    type: [relationSchema],
    optional: true,
    label: 'Related items used for gantt chart'
  }
};

export const boardSchema = new Schema({
  _id: { pkey: true },
  name: { type: String, label: 'Name' },
  ...commonFieldsSchema
});

export const pipelineSchema = new Schema({
  _id: { pkey: true },
  name: { type: String, label: 'Name' },
  boardId: { type: String, label: 'Board' },
  status: {
    type: String,
    enum: BOARD_STATUSES.ALL,
    default: BOARD_STATUSES.ACTIVE,
    label: 'Status'
  },
  visibility: {
    type: String,
    enum: PIPELINE_VISIBLITIES.ALL,
    default: PIPELINE_VISIBLITIES.PUBLIC,
    label: 'Visibility'
  },
  watchedUserIds: { type: [String], label: 'Watched users' },
  memberIds: { type: [String], label: 'Members' },
  bgColor: { type: String, label: 'Background color' },
  // Growth hack
  startDate: { type: Date, optional: true, label: 'Start date' },
  endDate: { type: Date, optional: true, label: 'End date' },
  metric: { type: String, optional: true, label: 'Metric' },
  hackScoringType: {
    type: String,
    enum: HACK_SCORING_TYPES.ALL,
    label: 'Hacking scoring type'
  },
  templateId: { type: String, optional: true, label: 'Template' },
  isCheckUser: {
    type: Boolean,
    optional: true,
    label: 'Show only the users created or assigned cards'
  },
  excludeCheckUserIds: {
    type: [String],
    optional: true,
    label: 'Users elligible to see all cards'
  },
  numberConfig: { type: String, optional: true, label: 'Number config' },
  numberSize: { type: String, optional: true, label: 'Number count' },
  lastNum: {
    type: String,
    optional: true,
    label: 'Last generated number'
  },
  ...commonFieldsSchema
});

export const stageSchema = new Schema({
  _id: { pkey: true },
  name: { type: String, label: 'Name' },
  probability: {
    type: String,
    enum: PROBABILITY.ALL,
    label: 'Probability'
  }, // Win probability
  pipelineId: { type: String, label: 'Pipeline' },
  formId: { type: String, label: 'Form' },
  status: {
    type: String,
    enum: BOARD_STATUSES.ALL,
    default: BOARD_STATUSES.ACTIVE
  },
  ...commonFieldsSchema
});

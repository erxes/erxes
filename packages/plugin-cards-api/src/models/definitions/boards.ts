import { Document, Schema } from 'mongoose';
import { customFieldSchema, ICustomField } from './common';
import {
  BOARD_STATUSES,
  BOARD_STATUSES_OPTIONS,
  BOARD_TYPES,
  HACK_SCORING_TYPES,
  VISIBLITIES,
  PROBABILITY,
  TIME_TRACK_TYPES
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
  data?: any;
  tagIds?: string[];
  branchIds?: string[];
  departmentIds?: string[];
  parentId?: string;
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
  isCheckDepartment?: boolean;
  excludeCheckUserIds?: string[];
  numberConfig?: string;
  numberSize?: string;
  lastNum?: string;
  departmentIds?: string[];
  tagId?: string;
}

export interface IPipelineDocument extends IPipeline, Document {
  _id: string;
}

export interface IStage extends ICommonFields {
  name?: string;
  probability?: string;
  pipelineId: string;
  visibility?: string;
  memberIds?: string[];
  canMoveMemberIds?: string[];
  canEditMemberIds?: string[];
  departmentIds?: string[];
  formId?: string;
  status?: string;
  code?: string;
  age?: number;
  defaultTick?: boolean;
}

export interface IStageDocument extends IStage, Document {
  _id: string;
}

// Not mongoose document, just stage shaped plain object
export type IPipelineStage = IStage & { _id: string };

export const attachmentSchema = new Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
    type: field({ type: String }),
    size: field({ type: Number, optional: true }),
    duration: field({ type: Number, optional: true })
  },
  { _id: false }
);

// Mongoose schemas =======================
const commonFieldsSchema = {
  userId: field({ type: String, label: 'Created by' }),
  createdAt: field({
    type: Date,
    default: new Date(),
    label: 'Created at'
  }),
  order: field({ type: Number, label: 'Order' }),
  type: field({
    type: String,
    enum: BOARD_TYPES.ALL,
    required: true,
    label: 'Type'
  })
};

const timeTrackSchema = new Schema(
  {
    startDate: field({ type: String }),
    timeSpent: field({ type: Number }),
    status: field({
      type: String,
      enum: TIME_TRACK_TYPES.ALL,
      default: TIME_TRACK_TYPES.STOPPED
    })
  },
  { _id: false }
);

const relationSchema = new Schema(
  {
    id: field({ type: String }),
    start: field({ type: String }),
    end: field({ type: String })
  },
  { _id: false }
);

export const commonItemFieldsSchema = {
  _id: field({ pkey: true }),
  parentId: field({ type: String, optional: true, label: 'Parent Id' }),
  userId: field({ type: String, optional: true, esType: 'keyword' }),
  createdAt: field({ type: Date, label: 'Created at', esType: 'date' }),
  order: field({ type: Number }),
  name: field({ type: String, label: 'Name' }),
  startDate: field({ type: Date, label: 'Start date', esType: 'date' }),
  closeDate: field({ type: Date, label: 'Close date', esType: 'date' }),
  stageChangedDate: field({
    type: Date,
    label: 'Stage changed date',
    esType: 'date'
  }),
  reminderMinute: field({ type: Number, label: 'Reminder minute' }),
  isComplete: field({
    type: Boolean,
    default: false,
    label: 'Is complete',
    esType: 'boolean'
  }),
  description: field({ type: String, optional: true, label: 'Description' }),
  assignedUserIds: field({ type: [String], esType: 'keyword' }),
  watchedUserIds: field({ type: [String], esType: 'keyword' }),
  labelIds: field({ type: [String], esType: 'keyword' }),
  attachments: field({ type: [attachmentSchema], label: 'Attachments' }),
  stageId: field({ type: String, index: true }),
  initialStageId: field({
    type: String,
    optional: true
  }),
  modifiedAt: field({
    type: Date,
    default: new Date(),
    label: 'Modified at',
    esType: 'date'
  }),
  modifiedBy: field({ type: String, esType: 'keyword' }),
  searchText: field({ type: String, optional: true, index: true }),
  priority: field({ type: String, optional: true, label: 'Priority' }),
  // TODO remove after migration
  sourceConversationId: field({ type: String, optional: true }),
  sourceConversationIds: field({ type: [String], optional: true }),
  timeTrack: field({
    type: timeTrackSchema
  }),
  status: field({
    type: String,
    enum: BOARD_STATUSES.ALL,
    default: BOARD_STATUSES.ACTIVE,
    label: 'Status',
    selectOptions: BOARD_STATUSES_OPTIONS,
    index: true
  }),
  customFieldsData: field({
    type: [customFieldSchema],
    optional: true,
    label: 'Custom fields data'
  }),
  score: field({
    type: Number,
    optional: true,
    label: 'Score',
    esType: 'number'
  }),
  number: field({
    type: String,
    unique: true,
    sparse: true,
    label: 'Item number'
  }),
  relations: field({
    type: [relationSchema],
    optional: true,
    label: 'Related items used for gantt chart'
  }),
  tagIds: field({
    type: [String],
    optional: true,
    index: true,
    label: 'Tags'
  }),
  branchIds: field({
    type: [String],
    optional: true,
    index: true,
    label: 'Tags'
  }),
  departmentIds: field({
    type: [String],
    optional: true,
    index: true,
    label: 'Tags'
  })
};

export const boardSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    ...commonFieldsSchema
  })
);

export const pipelineSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  boardId: field({ type: String, label: 'Board' }),
  tagId: field({
    type: String,
    optional: true,
    label: 'Tags'
  }),
  status: field({
    type: String,
    enum: BOARD_STATUSES.ALL,
    default: BOARD_STATUSES.ACTIVE,
    label: 'Status'
  }),
  visibility: field({
    type: String,
    enum: VISIBLITIES.ALL,
    default: VISIBLITIES.PUBLIC,
    label: 'Visibility'
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
    label: 'Hacking scoring type'
  }),
  templateId: field({ type: String, optional: true, label: 'Template' }),
  isCheckUser: field({
    type: Boolean,
    optional: true,
    label: 'Show only the users created or assigned cards'
  }),
  isCheckDepartment: field({
    type: Boolean,
    optional: true,
    label: 'Show only the departments created or assigned cards'
  }),
  excludeCheckUserIds: field({
    type: [String],
    optional: true,
    label: 'Users elligible to see all cards'
  }),
  numberConfig: field({ type: String, optional: true, label: 'Number config' }),
  numberSize: field({ type: String, optional: true, label: 'Number count' }),
  lastNum: field({
    type: String,
    optional: true,
    label: 'Last generated number'
  }),
  departmentIds: field({
    type: [String],
    optional: true,
    label: 'Related departments'
  }),
  ...commonFieldsSchema
});

export const stageSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  probability: field({
    type: String,
    enum: PROBABILITY.ALL,
    label: 'Probability'
  }), // Win probability
  pipelineId: field({ type: String, label: 'Pipeline' }),
  formId: field({ type: String, label: 'Form' }),
  status: field({
    type: String,
    enum: BOARD_STATUSES.ALL,
    default: BOARD_STATUSES.ACTIVE
  }),
  visibility: field({
    type: String,
    enum: VISIBLITIES.ALL,
    default: VISIBLITIES.PUBLIC,
    label: 'Visibility'
  }),
  code: field({
    type: String,
    label: 'Code',
    optional: true
  }),
  age: field({ type: Number, optional: true, label: 'Age' }),
  memberIds: field({ type: [String], label: 'Members' }),
  canMoveMemberIds: field({ type: [String], label: 'Can move members' }),
  canEditMemberIds: field({ type: [String], label: 'Can edit members' }),
  departmentIds: field({ type: [String], label: 'Departments' }),
  defaultTick: field({
    type: Boolean,
    label: 'Default tick used',
    optional: true
  }),
  ...commonFieldsSchema
});

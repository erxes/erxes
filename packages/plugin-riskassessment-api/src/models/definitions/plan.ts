import { Document, Schema } from 'mongoose';
import { field } from './utils';

export type IPlan = {
  plannerId: string;
  name: string;
  structureType: string;
  structureTypeIds: string[];
  configs: any;
  status: string;
  createdAt: string;
  modifiedAt: string;
  createDate: string;
  startDate: string;
  closeDate: string;
  cardIds: string[];
};

export type ISchedule = {
  name: string;
  indicatorId?: string;
  structureTypeIds: string[];
  assignedUserIds: string[];
  groupId?: string;
  startDate: string;
  endDate: string;
  customFieldsData?: any;
};

export interface ISchedulesDocument extends Document, ISchedule {
  _id: string;
}
export interface IPlansDocument extends Document, IPlan {
  _id: string;
}

export const schedulesSchema = new Schema({
  _id: field({ pkey: true }),
  planId: field({ type: String, label: 'planId' }),
  name: field({ type: String, label: 'Name' }),
  indicatorId: field({
    type: String,
    label: 'IndicatorId',
    optional: true
  }),
  groupId: field({ type: String, label: 'groupId', optional: true }),
  structureTypeId: field({
    type: String,
    label: 'Structure Type Id',
    required: true
  }),
  assignedUserIds: field({
    type: [String],
    label: 'AssignUserIds',
    optional: true
  }),
  status: field({
    type: String,
    label: 'Status',
    enum: ['Waiting', 'Done'],
    default: 'Waiting'
  }),
  customFieldsData: field({
    type: Schema.Types.Mixed,
    label: 'CustomFieldsData',
    optional: true
  }),
  createdAt: field({ type: Date, label: 'Created At', default: Date.now })
});

const configSchema = new Schema({
  cardType: field({ type: String, label: 'cardType', required: true }),
  boardId: field({ type: String, label: 'IndicatorId', required: true }),
  pipelineId: field({ type: String, label: 'groupId', required: true }),
  stageId: field({ type: String, label: 'StageId', required: true })
});

export const plansSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name', required: true }),
  plannerId: field({ type: String, label: 'Planner Id', required: true }),
  structureType: field({
    type: String,
    label: 'Structure Type',
    required: true
  }),
  structureTypeId: field({
    type: String,
    label: 'General Structure Id',
    required: true
  }),
  configs: field({ type: configSchema, label: 'configs' }),
  createdAt: field({ type: Date, label: 'createdAt', default: Date.now }),
  modifiedAt: field({ type: Date, label: 'modifiedAt', default: Date.now }),
  createDate: field({ type: Date, label: 'createDate' }),
  startDate: field({ type: Date, label: 'startDate' }),
  closeDate: field({ type: Date, label: 'closeDate' }),
  cardIds: field({ type: [String], label: 'Created Card IDs', optional: true }),
  tagId: field({ type: String, label: 'General Tag Id', optional: true }),
  status: field({
    type: String,
    label: 'Status',
    enum: ['active', 'archived', 'draft'],
    default: 'draft'
  })
});

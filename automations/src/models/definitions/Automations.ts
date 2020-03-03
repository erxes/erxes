import { Document, Schema } from 'mongoose';
import { ALL_KIND, AUTOMATION_STATUS, AUTOMATION_TYPE } from './constants';
import { field } from './utils';

export interface IAutomation {
  name: string;
  description: string;
  status: string;
  userId?: string;
  createdAt?: Date;
  publishedAt?: Date;
  modifiedAt?: Date;
  modifiedBy?: string;
}

export interface IShape {
  automationId: string;
  type: string;
  kind: string;
  async: boolean;
  position: any;
  size: any;
  toArrow: string[];
  config: any;
}

export interface IAutomationDocument extends IAutomation, Document {
  _id: string;
}

export interface IShapeDocument extends IShape, Document {
  _id: string;
  configFormat?: any;
}

export const automationSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Description' }),
  status: field({
    type: String,
    enum: AUTOMATION_STATUS.ALL,
    default: AUTOMATION_STATUS.DRAFT,
    label: 'Status',
    index: true,
  }),
  userId: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' }),
  publishedAt: field({ type: Date, label: 'Published at' }),
  modifiedAt: field({
    type: Date,
    default: new Date(),
    label: 'Modified at',
  }),
  modifiedBy: field({ type: String, label: 'Modified by' }),
});

export const shapeSchema = new Schema({
  _id: field({ pkey: true }),
  automationId: field({ type: String, label: 'Automation', index: true }),
  type: field({
    type: String,
    enum: AUTOMATION_TYPE.ALL,
    label: 'Type',
    index: true,
  }),
  kind: field({
    type: String,
    enum: ALL_KIND,
    label: 'Kind',
    index: true,
  }),
  async: field({ type: Boolean, default: false, label: 'is Async', index: true }),
  position: field({ type: Object, optional: true }),
  size: field({ type: Object, optional: true }),
  toArrow: field({ type: [String], label: 'Connect Arrow Shapes' }),
  config: field({ type: Object, optional: true }),
});

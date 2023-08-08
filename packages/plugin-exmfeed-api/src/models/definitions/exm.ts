import { Schema, Document } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
export type TExmThank = {
  description: string;
  recipientIds: string[];
  createdAt?: Date;
};
export interface IFeed {
  title: string;
  description: string;
  images: string;
  attachments: string;
  isPinned: boolean;
  contentType: string;
  recipientIds: string;
  customFieldsData: string;
  ceremonyData: string;
  eventData: string;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  department: string;
  departmentIds?: string[];
  branchIds?: string[];
  unitId?: string;
}
export interface IFeedDocument extends IFeed, Document {
  _id: string;
}

export interface IThank {
  description: string;
  recipientIds: string;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}

export interface IThankDocument extends IThank, Document {
  _id: string;
}

// Mongoose schemas =======================
const attachmentSchema = schemaHooksWrapper(
  new Schema({
    name: field({ type: String }),
    url: field({ type: String }),
    type: field({ type: String }),
    size: field({ type: Number, optional: true })
  }),
  'erxes_attachmentSchema'
);

const customFieldSchema = schemaHooksWrapper(
  new Schema({
    field: field({ type: String }),
    value: field({ type: JSON })
  }),
  'erxes_customFieldSchema'
);

const ceremonyDataSchema = schemaHooksWrapper(
  new Schema({
    startedDate: field({ type: Date, label: 'Date to start working' }),
    willDate: field({ type: Date, label: 'Ceremony date' }),
    howManyYear: field({ type: Number, label: 'How many years' }),
    year: field({ type: Number, label: 'Ceremony year' })
  }),
  'erxes_ceremonyDataSchema'
);

const eventDataSchema = schemaHooksWrapper(
  new Schema({
    visibility: field({ type: String }),
    where: field({ type: String }),
    startDate: field({ type: Date }),
    endDate: field({ type: Date }),
    interestedUserIds: field({ type: [String] }),
    goingUserIds: field({ type: [String] })
  }),
  'erxes_eventDataSchema'
);

export const FEED_CONTENT_TYPES = {
  POST: 'post',
  EVENT: 'event',
  BRAVO: 'bravo',
  BIRTHDAY: 'birthday',
  WORK_ANNIVARSARY: 'workAnniversary',
  PUBLIC_HOLIDAY: 'publicHoliday',
  WELCOME: 'welcome',
  ALL: [
    'post',
    'event',
    'bravo',
    'birthday',
    'workAnniversary',
    'publicHoliday',
    'welcome'
  ]
};

export const feedSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    title: field({ type: String, label: 'Title' }),
    description: field({ type: String, label: 'Description' }),
    images: field({ type: [attachmentSchema], label: 'Images' }),
    attachments: field({
      type: [attachmentSchema],
      label: 'Attachments'
    }),
    isPinned: field({ type: Boolean }),
    contentType: field({ type: String, enum: FEED_CONTENT_TYPES.ALL }),
    recipientIds: field({ type: [String] }),
    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields data'
    }),
    departmentIds: field({ type: [String], label: 'Department Ids' }),
    department: field({ type: String, label: 'Department' }),
    branchIds: field({ type: [String], label: 'Branch Ids' }),
    unitId: field({ type: String, label: 'Unit', optional: true }),
    ceremonyData: field({ type: ceremonyDataSchema }),
    eventData: field({ type: eventDataSchema }),
    startDate: field({ type: Date }),
    endDate: field({ type: Date }),
    createdBy: field({ type: String, label: 'Created by' }),
    createdAt: field({ type: Date, label: 'Created at' }),
    updatedBy: field({ type: String, label: 'Updated by' }),
    updatedAt: field({ type: Date, label: 'Updated at' })
  }),
  'erxes_feedSchema'
);

export const thankSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    description: field({ type: String, label: 'Description' }),
    recipientIds: field({ type: [String] }),
    createdBy: field({ type: String, label: 'Created by' }),
    createdAt: field({ type: Date, label: 'Created at' }),
    updatedBy: field({ type: String, label: 'Updated by' }),
    updatedAt: field({ type: Date, label: 'Updated at' })
  }),
  'erxes_thankSchema'
);

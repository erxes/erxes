import { Schema, Document } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
export type TExmThank = {
  description: string;
  recipientIds: string[];
  createdAt?: Date;
};
export interface IFeed {
  title: String;
  description: String;
  images: String;
  attachments: String;
  isPinned: Boolean;
  contentType: String;
  recipientIds: String;
  customFieldsData: String;
  ceremonyData: String;
  eventData: String;
  startDate: Date;
  endDate: Date;
  createdBy: String;
  createdAt: Date;
  updatedBy: String;
  updatedAt: Date;
  department: String;
}
export interface IFeedDocument extends IFeed, Document {
  _id: String;
}

export interface IThank {
  description: String;
  recipientIds: String;
  createdBy: String;
  createdAt: Date;
  updatedBy: String;
  updatedAt: Date;
}

export interface IThankDocument extends IThank, Document {
  _id: String;
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
  ALL: [
    'post',
    'event',
    'bravo',
    'birthday',
    'workAnniversary',
    'publicHoliday'
  ]
};

export const feedSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    title: field({ type: String, label: 'Title' }),
    description: field({ type: String, label: 'Description' }),
    images: field({ type: [attachmentSchema], label: 'Images' }),
    attachments: field({ type: [attachmentSchema], label: 'Attachments' }),
    isPinned: field({ type: Boolean }),
    contentType: field({ type: String, enum: FEED_CONTENT_TYPES.ALL }),
    recipientIds: field({ type: [String] }),
    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields data'
    }),
    department: field({ type: String, label: 'Department' }),
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

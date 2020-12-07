import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface ICalendar {
  name: string;
  color: string;
  userId: string;
  groupId: string;
  createdAt?: Date;
  accountId: string;
  isPrimary?: boolean;
}

export interface ICalendarDocument extends ICalendar, Document {
  _id: string;
}

export interface ICalendarGroup {
  name: string;
  isPrivate: boolean;
  memberIds?: string[];
  userId?: string;
  createdAt?: Date;
  boardId: string;
}

export interface ICalendarGroupDocument extends ICalendarGroup, Document {
  _id: string;
}

export interface ICalendarBoard {
  name: string;
  userId?: string;
  createdAt?: Date;
}

export interface ICalendarBoardDocument extends ICalendarBoard, Document {
  _id: string;
}

// Mongoose schemas =======================
export const calendarSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    color: field({ type: String, label: 'Color' }),
    userId: field({ type: String, label: 'Created by' }),
    groupId: field({ type: String, label: 'Group' }),
    accountId: field({ type: String, label: 'Integration Account' }),
    createdAt: field({ type: Date, required: true, default: Date.now }),
    isPrimary: field({ type: Boolean, default: false, label: 'Is primary' })
  })
);

export const calendarGroupSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    userId: field({ type: String, label: 'Created by' }),
    memberIds: field({ type: [String], label: 'Members' }),
    isPrivate: field({ type: Boolean, default: false, label: 'Is private' }),
    createdAt: field({ type: Date, required: true, default: Date.now }),
    boardId: field({ type: String, label: 'Board' })
  })
);

export const calendarBoardSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    userId: field({ type: String, label: 'Created by' }),
    createdAt: field({ type: Date, required: true, default: Date.now })
  })
);

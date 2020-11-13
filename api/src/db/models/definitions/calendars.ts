import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface ICalendar {
  name: string;
  color: string;
  userId: string;
  groupId: string;
  createdAt?: Date;
  accountId: string;
}

export interface ICalendarDocument extends ICalendar, Document {
  _id: string;
}

export interface ICalendarGroup {
  name: string;
  isPrivate: boolean;
  assignedUserIds?: string[];
  userId?: string;
  createdAt: Date;
}

export interface ICalendarGroupDocument extends ICalendarGroup, Document {
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
    createdAt: field({ type: Date, required: true, default: Date.now })
  })
);

export const calendarGroupSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    userId: field({ type: String, label: 'Created by' }),
    assignedUserIds: field({ type: [String], label: 'Assigned users' }),
    isPrivate: field({ type: Boolean, default: false, label: 'Is private' }),
    createdAt: field({ type: Date, required: true, default: Date.now })
  })
);

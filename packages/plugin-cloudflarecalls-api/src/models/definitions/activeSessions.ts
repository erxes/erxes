import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IActiveSessions {
  userId: string;
  lastLoginDeviceId: string;
}

export interface IActiveSessionDocument extends IActiveSessions, Document {}

export const activeSessionSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ pkey: true, type: String, label: 'Active user id' }),
  lastLoginDeviceId: field({ type: String, label: 'Browser session id' }),
});

import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface ICallHistory {
  operatorPhone: string;
  customerPhone: string;
  callDuration: number;
  callStartTime: Date;
  callEndTime: Date;
  callType: string;
  callStatus: string;
  sessionId: string;
  modifiedAt: Date;
  createdAt: Date;
  createdBy: string;
  modifiedBy: string;
  conversationId: string;
  acceptedUserId: string;
}

export interface ICallHistoryDocument extends ICallHistory, Document {}

export const callHistorySchema = new Schema({
  operatorPhone: field({ type: String, label: 'operator number' }),
  customerPhone: field({ type: String, label: 'customer number' }),
  callDuration: field({ type: Number, label: 'duration' }),
  callStartTime: field({ type: Date, label: 'call start time' }),
  callEndTime: field({ type: Date, label: 'call end time' }),
  callType: field({
    type: String,
    label: 'call type',
    enum: ['incoming', 'outgoing'],
  }),
  callStatus: field({
    type: String,
    label: 'status',
    enum: ['missed', 'connected', 'rejected', 'cancelled', 'active'],
    default: 'missed',
  }),
  acceptedUserId: field({
    type: String,
    label: 'call accepted operator id',
  }),
  sessionId: field({ type: String, label: 'call session id' }),
  modifiedAt: field({ type: Date, label: 'modified date' }),
  createdAt: field({ type: Date, label: 'created date', default: new Date() }),
  createdBy: field({ type: String, label: 'created By' }),
  modifiedBy: field({ type: String, label: 'updated By' }),
  extentionNumber: field({ type: String, label: 'extention number' }),
  conversationId: field({ type: String, label: 'erxes conversation id' }),
});

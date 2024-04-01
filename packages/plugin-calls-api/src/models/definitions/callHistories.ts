import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface ICallHistory {
  receiverNumber: string;
  callerNumber: string;
  callDuration: number;
  callStartTime: Date;
  callEndTime: Date;
  callType: string;
  callStatus: string;
  sessionId: string;
  updatedAt: Date;
  createdAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface ICallHistoryDocument extends ICallHistory, Document {}

export const callHistorySchema = new Schema({
  receiverNumber: field({ type: String, label: 'reciever number' }),
  callerNumber: field({ type: String, label: 'caller number' }),
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
    enum: ['missed', 'connected', 'rejected', 'cancelled'],
  }),
  sessionId: field({ type: String, label: 'call session id' }),
  updatedAt: field({ type: Date, label: 'modified date' }),
  createdAt: field({ type: Date, label: 'created date' }),
  createdBy: field({ type: String, label: 'created By' }),
  updatedBy: field({ type: String, label: 'updated By' }),
});

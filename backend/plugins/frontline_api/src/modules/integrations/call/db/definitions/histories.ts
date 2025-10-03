import { Schema } from 'mongoose';
import { field } from '../utils';

export const callHistorySchema = new Schema({
  operatorPhone: field({ type: String, label: 'operator number' }),
  customerPhone: field({ type: String, label: 'customer number' }),
  callDuration: field({ type: Number, label: 'duration' }),
  callStartTime: field({ type: Date, label: 'call start time' }),
  callEndTime: field({ type: Date, label: 'call end time' }),
  callType: field({
    type: String,
    label: 'call type',
    // enum: ['incoming', 'outgoing'],
  }),
  callStatus: field({
    type: String,
    label: 'status',
    enum: [
      'missed',
      'connected',
      'rejected',
      'cancelled',
      'active',
      'transferred',
      'cancelledToAnswered',
    ],
    default: 'missed',
  }),
  acceptedUserId: field({
    type: String,
    label: 'call accepted operator id',
  }),
  timeStamp: field({
    type: Number,
    label: 'call timestamp',
  }),
  modifiedAt: field({ type: Date, label: 'modified date' }),
  createdAt: field({ type: Date, label: 'created date', default: new Date() }),
  createdBy: field({ type: String, label: 'created By' }),
  modifiedBy: field({ type: String, label: 'updated By' }),
  extensionNumber: field({ type: String, label: 'extention number' }),
  conversationId: field({ type: String, label: 'erxes conversation id' }),
  inboxIntegrationId: field({ type: String, label: 'erxes integration id' }),
  recordUrl: field({ type: String, label: 'record url' }),
  endedBy: field({
    type: String,
    label: `'Local' indicates the call was ended by Erxes, while 'remote' indicates the call was ended by the customer`,
  }),
  queueName: field({ type: String, label: 'queue name' }),
});

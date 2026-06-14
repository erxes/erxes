import { Schema } from 'mongoose';
import { field } from '../utils';

const operatorSchema = new Schema(
  {
    userId: field({ type: String, optional: true }),
    extensionNumber: field({ type: String, required: true }),
    state: field({
      type: String,
      enum: ['ringing', 'answered', 'rejected', 'noanswer'],
      default: 'ringing',
    }),
    ringedAt: field({ type: Date, optional: true }),
    answeredAt: field({ type: Date, optional: true }),
  },
  { _id: false },
);

export const callSessionSchema = new Schema(
  {
    uniqueid: field({
      type: String,
      required: true,
      label: 'PBX uniqueid or SIP Call-ID',
    }),
    linkedid: field({
      type: String,
      optional: true,
      label: 'PBX linkedid (call-wide id tying legs together)',
    }),
    inboxIntegrationId: field({
      type: String,
      required: true,
      label: 'erxes integration id',
    }),
    conversationId: field({
      type: String,
      optional: true,
      label: 'erxes conversation id',
    }),
    customerId: field({
      type: String,
      optional: true,
      label: 'erxes customer id',
    }),
    customerPhone: field({ type: String, required: true }),
    operatorPhone: field({ type: String, optional: true }),
    callType: field({
      type: String,
      enum: ['incoming', 'outgoing'],
      required: true,
    }),
    status: field({
      type: String,
      enum: ['ringing', 'active', 'ended', 'missed', 'failed'],
      default: 'ringing',
    }),
    queueName: field({ type: String, optional: true }),
    ringingOperators: { type: [operatorSchema], default: [] },
    answeredBy: field({ type: String, optional: true }),
    answeredExtension: field({ type: String, optional: true }),
    startedAt: field({ type: Date, required: true }),
    answeredAt: field({ type: Date, optional: true }),
    endedAt: field({ type: Date, optional: true }),
    durationSec: field({ type: Number, optional: true }),
    hangupCause: field({ type: String, optional: true }),
    source: field({
      type: String,
      enum: ['cti', 'cdr', 'sip'],
      default: 'cti',
    }),
    cdrAcctId: field({ type: String, optional: true }),
    recordUrl: field({ type: String, optional: true }),
    diversion: field({ type: String, optional: true }),
    raw: field({ type: Schema.Types.Mixed, optional: true }),
  },
  { timestamps: true },
);

callSessionSchema.index({ uniqueid: 1 }, { unique: true });
callSessionSchema.index({ linkedid: 1 });
callSessionSchema.index({ inboxIntegrationId: 1, status: 1, startedAt: -1 });
callSessionSchema.index({ conversationId: 1 });
callSessionSchema.index({ customerPhone: 1, startedAt: -1 });

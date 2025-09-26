import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface ICallQueueStatistics extends Document {
  queuechairman: string;
  queue: number;
  totalCalls: number;
  answeredCalls: number;
  answeredRate: number;
  abandonedCalls: number;
  avgWait: number;
  avgTalk: number;
  vqTotalCalls: number;
  slaRate: number;
  vqSlaRate: number;
  transferOutCalls: number;
  transferOutRate: number;
  abandonedRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICallQueueStatisticsDocuments
  extends ICallQueueStatistics,
    Document {}

export const operatorSchema = new Schema({
  userId: field({ type: String, label: 'user id', unique: true }),
  extension: field({ type: String, label: 'Operator extension' }),
  status: field({
    type: String,
    label: 'Operator extension',
    enum: ['unAvailable', 'idle', 'pause', 'unpause'],
    default: 'unAvailable',
  }),
});

export const queueStatisticsSchema = new Schema({
  queuechairman: field({ type: String, required: true }),
  integrationId: field({ type: String, required: true }),
  queue: field({ type: Number, required: true }),
  totalCalls: field({ type: Number, default: 0 }),
  answeredCalls: field({ type: Number, default: 0 }),
  answeredRate: field({ type: Number, default: 0 }),
  abandonedCalls: field({ type: Number, default: 0 }),
  avgWait: field({ type: Number, default: 0 }),
  avgTalk: field({ type: Number, default: 0 }),
  vqTotalCalls: field({ type: Number, default: 0 }),
  slaRate: field({ type: Number, default: 0 }),
  vqSlaRate: field({ type: Number, default: 0 }),
  transferOutCalls: field({ type: Number, default: 0 }),
  transferOutRate: field({ type: Number, default: 0 }),
  abandonedRate: field({ type: Number, default: 0 }),
});

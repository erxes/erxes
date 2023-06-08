import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IRCFAIssues {
  _id?: string;
  rcfaId?: string;
  issue: string;
  parentId?: string;
  createdAt: string;
  code: string;
  order: string;
  isRootCause?: boolean;
  __v?: number;
}

export interface IRCFAIssuesDocument extends IRCFAIssues, Document {
  _id: string;
}

export const rcfaIssuessSchema = new Schema({
  _id: field({ pkey: true }),
  rcfaId: field({ type: String, optional: true }),
  code: field({ type: String, label: 'code' }),
  order: field({ type: String, label: 'order' }),
  issue: field({ type: String, label: 'Issue' }),
  parentId: field({ type: String, optional: true }),
  isRootCause: field({ type: Boolean }),
  status: field({
    type: String,
    enum: ['inProgress', 'closed'],
    default: 'inProgress',
    label: 'Status'
  }),
  createdAt: field({ type: Date, default: Date.now }),
  closedAt: field({ type: Date, default: Date.now }),
  relType: field({ type: String, optional: true }),
  relTypeId: field({ type: String, optional: true }),
  description: field({ type: String, optional: true })
});

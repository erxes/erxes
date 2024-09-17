import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface ISyncRule {
  title: string;
  serviceName: string;
  responseKey?: string;
  extractType?: string;
  extractKey?: string;

  objectType: string;
  fieldGroup: string;
  formField: string;

  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
}
export interface ISyncRuleDocument extends ISyncRule, Document {
  _id: string;
}

export const xypSyncRuleSchema = new Schema({
  _id: field({ pkey: true }),

  title: field({ type: String, label: 'title' }),
  serviceName: field({ type: String, label: 'serviceName' }),
  responseKey: field({ type: String, optional: true, label: 'responseKey' }),
  extractType: field({ type: String, optional: true, label: 'extractType' }),
  extractKey: field({ type: String, optional: true, label: 'extractKey' }),
  objectType: field({ type: String, label: 'objectType' }),
  fieldGroup: field({ type: String, label: 'fieldGroup' }),
  formField: field({ type: String, label: 'formField' }),

  createdBy: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' }),
  updatedBy: field({ type: String, label: 'Updated by' }),
  updatedAt: field({ type: Date, label: 'Updated at' })
});

xypSyncRuleSchema.index({ contentType: 1, contentTypeId: 1 });
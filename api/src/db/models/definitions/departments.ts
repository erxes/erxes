import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IDepartment {
  title: string;
  description?: string;
  parentId?: string;
  userIds?: string[];
}

export interface IDepartmentDocument extends IDepartment, Document {
  _id: string;
}

export const departmentSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    title: field({ type: String }),
    description: field({ type: String }),
    parentId: field({ type: String }),
    userIds: field({ type: [String], label: 'Related users' }),
    updatedBy: field({ type: String }),
    updatedAt: field({ type: Date }),
    createdBy: field({ type: String }),
    createdAt: field({ type: Date, default: Date.now })
  })
);

import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IDepartment {
  title: string;
  description?: string;
  supervisorId?: string;
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
    supervisorId: field({ type: String }),
    code: field({ type: String }),
    parentId: field({ type: String }),
    userIds: field({ type: [String], label: 'Related users' }),
    updatedBy: field({ type: String }),
    updatedAt: field({ type: Date }),
    createdBy: field({ type: String }),
    createdAt: field({ type: Date, default: Date.now })
  })
);

export interface IUnit {
  title: string;
  description?: string;
  supervisorId?: string;
  departmentId?: string;
  userIds?: string[];
}

export interface IUnitDocument extends IUnit, Document {
  _id: string;
}

export const unitSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    title: field({ type: String }),
    description: field({ type: String }),
    departmentId: field({ type: String }),
    supervisorId: field({ type: String }),
    code: field({ type: String }),
    userIds: field({ type: [String], label: 'Related users' }),
    updatedBy: field({ type: String }),
    updatedAt: field({ type: Date }),
    createdBy: field({ type: String }),
    createdAt: field({ type: Date, default: Date.now })
  })
);

import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

const commonSchemaFields = {
  updatedBy: field({ type: String }),
  updatedAt: field({ type: Date }),
  createdBy: field({ type: String }),
  createdAt: field({ type: Date, default: Date.now })
};

export interface IStructure {
  title: string;
  description?: string;
  supervisorId?: string;
}

export interface IStructureDocument extends IStructure, Document {
  _id: string;
}

export const structureSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    title: field({ type: String }),
    description: field({ type: String, optional: true }),
    supervisorId: field({ type: String, optional: true }),
    code: field({ type: String, optional: true }),
    ...commonSchemaFields
  })
);

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
    description: field({ type: String, optional: true }),
    supervisorId: field({ type: String, optional: true }),
    code: field({ type: String, optional: true }),
    parentId: field({ type: String }),
    userIds: field({ type: [String], label: 'Related users' }),
    ...commonSchemaFields
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
    description: field({ type: String, optional: true }),
    departmentId: field({ type: String, optional: true }),
    supervisorId: field({ type: String, optional: true }),
    code: field({ type: String, optional: true }),
    userIds: field({ type: [String], label: 'Related users' }),
    ...commonSchemaFields
  })
);

export interface IBranch {
  title: string;
  address?: string;
  supervisorId?: string;
  parentId?: string;
  userIds?: string[];
}

export interface IBranchDocument extends IBranch, Document {
  _id: string;
}

export const branchSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    title: field({ type: String }),
    address: field({ type: String }),
    parentId: field({ type: String, optional: true }),
    code: field({ type: String, optional: true }),
    userIds: field({ type: [String], label: 'Related users' }),
    ...commonSchemaFields
  })
);

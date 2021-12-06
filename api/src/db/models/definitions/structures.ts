import { Document, Schema } from 'mongoose';
import { attachmentSchema } from './boards';
import { ILink } from './common';
import { field, schemaWrapper } from './utils';

const commonSchemaFields = {
  code: field({ type: String, optional: true }),
  updatedBy: field({ type: String }),
  updatedAt: field({ type: Date }),
  createdBy: field({ type: String }),
  createdAt: field({ type: Date, default: Date.now })
};

const CoordinateSchame = new Schema({
  longitude: field({ type: String, optional: true }),
  latitude: field({ type: String, optional: true })
});

const contactInfoSchema = {
  website: field({ type: String, optional: true }),
  phoneNumber: field({ type: String, optional: true }),
  email: field({ type: String, optional: true }),
  address: field({ type: String, optional: true }),
  links: field({ type: Object, default: {}, label: 'Links' }),
  coordinate: field({
    type: CoordinateSchame,
    optional: true,
    label: 'Longitude and latitude'
  }),
  image: field({ type: attachmentSchema, optional: true })
};

export interface IStructure {
  title: string;
  description?: string;
  supervisorId?: string;
  links?: ILink;
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
    ...contactInfoSchema,
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
    parentId: field({ type: String, optional: true }),
    userIds: field({ type: [String], label: 'Related users' }),
    ...contactInfoSchema,
    ...commonSchemaFields
  })
);

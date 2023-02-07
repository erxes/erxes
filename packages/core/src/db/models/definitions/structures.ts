import { Document, Schema } from 'mongoose';
import { ILink, attachmentSchema } from '@erxes/api-utils/src/types';
import { field, schemaWrapper } from './utils';
import { STRUCTURE_STATUSES } from '../../../constants';

const commonSchemaFields = {
  _id: field({ pkey: true }),
  title: field({ type: String }),
  code: field({ type: String, unique: true }),
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

interface ICommonTypes {
  title: string;
  description?: string;
  supervisorId?: string;
  parentId?: string;
  code: string;
}
export interface IStructure extends ICommonTypes {
  links?: ILink;
}

export interface IStructureDocument extends IStructure, Document {
  _id: string;
}

export const structureSchema = schemaWrapper(
  new Schema({
    description: field({ type: String, optional: true }),
    supervisorId: field({ type: String, optional: true }),
    ...contactInfoSchema,
    ...commonSchemaFields
  })
);

export interface IDepartment extends ICommonTypes {
  parentId?: string;
  userIds?: string[];
  order: string;
}

export interface IDepartmentDocument extends IDepartment, Document {
  _id: string;
}

export const departmentSchema = schemaWrapper(
  new Schema({
    description: field({ type: String, optional: true }),
    supervisorId: field({ type: String, optional: true }),
    parentId: field({ type: String }),
    order: field({ type: String, unique: true }),
    status: field({
      type: String,
      label: 'Status',
      default: STRUCTURE_STATUSES.ACTIVE
    }),
    ...commonSchemaFields
  })
);

export interface IUnit extends ICommonTypes {
  departmentId?: string;
  userIds?: string[];
  order: string;
}

export interface IUnitDocument extends IUnit, Document {
  _id: string;
}

export const unitSchema = schemaWrapper(
  new Schema({
    description: field({ type: String, optional: true }),
    departmentId: field({ type: String, optional: true }),
    supervisorId: field({ type: String, optional: true }),
    userIds: field({ type: [String], label: 'Related users' }),
    ...commonSchemaFields
  })
);

export interface IBranch extends ICommonTypes {
  address?: string;
  userIds?: string[];
  radius?: number;
  order: string;
}

export interface IBranchDocument extends IBranch, Document {
  _id: string;
}

export const branchSchema = schemaWrapper(
  new Schema({
    parentId: field({ type: String, optional: true }),
    ...contactInfoSchema,
    ...commonSchemaFields,
    order: field({ type: String, unique: true }),
    status: field({
      type: String,
      label: 'Status',
      default: STRUCTURE_STATUSES.ACTIVE
    }),
    radius: field({ type: Number, label: 'Coordinate radius /M/' })
  })
);

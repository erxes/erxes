import {
  STRUCTURE_STATUSES,
  attachmentSchema,
} from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const commonSchemaFields = {
  id: mongooseStringRandomId,
  title: { type: String },
  code: { type: String, unique: true },
  updatedBy: { type: String },
  updatedAt: { type: Date },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
};

const CoordinateSchame = new Schema({
  longitude: { type: String, optional: true },
  latitude: { type: String, optional: true },
});

const contactInfoSchema = {
  website: { type: String, optional: true },
  phoneNumber: { type: String, optional: true },
  email: { type: String, optional: true },
  address: { type: String, optional: true },
  links: { type: Object, default: {}, label: 'Links' },
  coordinate: {
    type: CoordinateSchame,
    optional: true,
    label: 'Longitude and latitude',
  },
  image: { type: attachmentSchema, optional: true },
};

export const structureSchema = schemaWrapper(
  new Schema({
    description: { type: String, optional: true },
    supervisorId: { type: String, optional: true },
    ...contactInfoSchema,
    ...commonSchemaFields,
  }),
);

export const departmentSchema = schemaWrapper(
  new Schema({
    description: { type: String, optional: true },
    supervisorId: { type: String, optional: true },
    parentId: { type: String, optional: true },
    order: { type: String, unique: true },
    status: {
      type: String,
      label: 'Status',
      default: STRUCTURE_STATUSES.ACTIVE,
    },
    workhours: { type: Object, label: 'WorkHours', optional: true },
    ...commonSchemaFields,
  }),
);

export const unitSchema = schemaWrapper(
  new Schema({
    description: { type: String, optional: true },
    departmentId: { type: String, optional: true },
    supervisorId: { type: String, optional: true },
    userIds: { type: [String], label: 'Related users' },
    ...commonSchemaFields,
  }),
);

export const branchSchema = schemaWrapper(
  new Schema({
    parentId: { type: String, optional: true },
    ...contactInfoSchema,
    ...commonSchemaFields,
    order: { type: String, unique: true },
    status: {
      type: String,
      label: 'Status',
      default: STRUCTURE_STATUSES.ACTIVE,
    },
    supervisorId: { type: String, optional: true },
    radius: { type: Number, label: 'Coordinate radius /M/' },
    workhours: { type: Object, label: 'WorkHours', optional: true },
  }),
);

export const positionSchema = schemaWrapper(
  new Schema({
    ...commonSchemaFields,
    parentId: { type: String, optional: true },
    order: { type: String, unique: true },
    userIds: { type: [String], label: 'Related users' },
    status: {
      type: String,
      label: 'Status',
      default: STRUCTURE_STATUSES.ACTIVE,
    },
  }),
);

branchSchema.index({ _id: 1, createdAt: 1, parentId: 1 });
departmentSchema.index({ _id: 1, createdAt: 1, parentId: 1 });
unitSchema.index({ _id: 1, createdAt: 1 });
positionSchema.index({ _id: 1, createdAt: 1, parentId: 1 });

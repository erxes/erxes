import { Schema } from 'mongoose';
import { mongooseField, schemaWrapper } from '../../../../utils';

export const userGroupSchema = schemaWrapper(
  new Schema({
    _id: mongooseField({ pkey: true }),
    name: mongooseField({ type: String, unique: true, label: 'Name' }),
    description: mongooseField({ type: String, label: 'Description' }),
    branchIds: mongooseField({
      type: [String],
      label: 'Branches',
      optional: true,
    }),
    departmentIds: mongooseField({
      type: [String],
      label: 'Departments',
      optional: true,
    }),
  }),
);

export const permissionSchema = schemaWrapper(
  new Schema({
    _id: mongooseField({ pkey: true }),
    module: mongooseField({ type: String, label: 'Module' }),
    action: mongooseField({ type: String, label: 'Action' }),
    userId: mongooseField({ type: String, label: 'User' }),
    groupId: mongooseField({ type: String, label: 'User group' }),
    requiredActions: mongooseField({
      type: [String],
      default: [],
      label: 'Required actions',
    }),
    allowed: mongooseField({ type: Boolean, default: false, label: 'Allowed' }),
  }),
);

import { Schema } from 'mongoose';
import { mongooseField, schemaWrapper } from '../../../../utils';

export const permissionGroupSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseField({ pkey: true }),
      name: mongooseField({ type: String, label: 'Name' }),
      description: mongooseField({ type: String, label: 'Description' }),
      permissions: mongooseField({
        type: [
          {
            plugin: { type: String },
            module: { type: String },
            actions: { type: [String] },
            scope: { type: String, enum: ['own', 'group', 'all'] },
          },
        ],
        default: [],
        label: 'Permissions',
      }),
    },
    { timestamps: true },
  ),
);

// DEPRECATED - Keep for migration, remove later
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

// DEPRECATED - Keep for migration, remove later
export const permissionSchema = schemaWrapper(
  new Schema({
    _id: mongooseField({ pkey: true }),
    plugin: mongooseField({ type: String, label: 'Plugin' }),
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

// DEPRECATED - Remove
export const roleSchema = new Schema(
  {
    userId: {
      type: String,
      label: 'User',
      index: true,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      label: 'Role',
      index: true,
      required: true,
    },
  },
  { timestamps: true },
);

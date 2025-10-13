import { Schema } from 'mongoose';
import { PERMISSION_ROLES } from '~/modules/permissions/db/constants';

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
      enum: PERMISSION_ROLES.ALL,
      label: 'Role',
      index: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { ACCOUNT_PERM_LEVELS } from '../../@types/permission';

// Mongoose schemas ===========

export const permissionSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    userId: { type: String, index: true, label: 'User' },
    accountId: { type: String, index: true, label: 'Account' },
    permission: {
      type: String,
      label: 'Permission',
      enum: ACCOUNT_PERM_LEVELS.ALL,
      default: ACCOUNT_PERM_LEVELS.READ
    },
    createdAt: { type: Date },
    updatedAt: { type: Date }
  })
);

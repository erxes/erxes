import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { ACCOUNT_PERMISSION_SCOPES, ACCOUNT_PERMISSION_WRITE_SCOPES } from '../../@types/permission';

export const accountPermissionSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    accountId: { type: String, required: true, label: 'Account' },
    userId: { type: String, required: true, label: 'Team Member' },
    level: { type: Number, label: 'Level', default: 0 },
    read: {
      type: String,
      enum: ACCOUNT_PERMISSION_SCOPES.ALL,
      default: ACCOUNT_PERMISSION_SCOPES.NONE,
      label: 'Read rule',
    },
    write: {
      type: String,
      enum: ACCOUNT_PERMISSION_WRITE_SCOPES.ALL,
      default: ACCOUNT_PERMISSION_WRITE_SCOPES.NONE,
      label: 'Write rule',
    },
    createdAt: { type: Date, default: Date.now, label: 'Created at' },
    updatedAt: { type: Date, optional: true, label: 'Modified at' },
  }),
);

accountPermissionSchema.index({ userId: 1, accountId: 1 }, { unique: true });
accountPermissionSchema.index({ accountId: 1, level: 1 });
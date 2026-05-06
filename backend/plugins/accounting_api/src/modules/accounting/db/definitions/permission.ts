import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const ACCOUNT_PERMISSION_SCOPES = {
  NONE: 'none',
  OWN: 'own',
  LT_LVL: 'ltLvl',
  LTE_LVL: 'lteLvl',
  GT_LVL: 'gtLvl',
  VALUES: [
    'own',
    'ltLvl',
    'lteLvl',
    'gtLvl',
  ],
};

export const ACCOUNT_PERMISSION_WRITE_SCOPES = {

  NONE: 'none',
  ADD: 'add',
  OWN: 'own',
  LT_LVL: 'ltLvl',
  LTE_LVL: 'lteLvl',
  GT_LVL: 'gtLvl',
  VALUES: [
    'add',
    'own',
    'ltLvl',
    'lteLvl',
    'gtLvl',
  ],
};

export const accountPermissionSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    accountId: { type: String, label: 'Account' },
    userId: { type: String, label: 'Team Member' },
    level: { type: Number, label: 'Level' }, // baga baihdaa iluu huchtee
    read: {
      type: String,
      enum: ACCOUNT_PERMISSION_SCOPES.VALUES,
      default: ACCOUNT_PERMISSION_SCOPES.NONE,
      label: 'Read rule',
    },
    write: {
      type: String,
      enum: ACCOUNT_PERMISSION_WRITE_SCOPES.VALUES,
      default: ACCOUNT_PERMISSION_WRITE_SCOPES.NONE,
      label: 'Write rule',
    },
    createdAt: { type: Date, default: Date.now, label: 'Created at' },
    updatedAt: { type: Date, optional: true, label: 'Modified at' },
  }),
);

accountPermissionSchema.index({ userId: 1, accountId: 1 }, { unique: true });
accountPermissionSchema.index({ accountId: 1, level: 1 });
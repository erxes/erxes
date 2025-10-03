import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';

export const appSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    name: { type: String, label: 'App name' },
    createdAt: { type: Date, label: 'Created at', default: new Date() },
    accessToken: { type: String, label: 'Access token' },
    refreshToken: {
      type: String,
      label: 'Refresh token used to gain access token',
    },
    isEnabled: { type: Boolean, label: 'Status of the app' },
    userGroupId: { type: String, label: 'User group id', optional: true },
    expireDate: { type: Date, label: 'Token expire date' },
    noExpire: { type: Boolean, label: 'noExpire' },
    allowAllPermission: { type: Boolean, label: 'allowAllPermission' },
  }),
);

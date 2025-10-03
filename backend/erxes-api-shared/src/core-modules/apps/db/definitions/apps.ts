import { Schema } from 'mongoose';
import { mongooseField, schemaWrapper } from '../../../../utils';
export const appSchema = schemaWrapper(
  new Schema({
    _id: mongooseField({ pkey: true }),
    name: mongooseField({ type: String, label: 'App name' }),
    createdAt: mongooseField({
      type: Date,
      label: 'Created at',
      default: new Date(),
    }),
    accessToken: mongooseField({ type: String, label: 'Access token' }),
    refreshToken: mongooseField({
      type: String,
      label: 'Refresh token used to gain access token',
    }),
    isEnabled: mongooseField({ type: Boolean, label: 'Status of the app' }),
    userGroupId: mongooseField({
      type: String,
      label: 'User group id',
      optional: true,
    }),
    expireDate: mongooseField({ type: Date, label: 'Token expire date' }),
    noExpire: mongooseField({ type: Boolean, label: 'noExpire' }),
    allowAllPermission: mongooseField({
      type: Boolean,
      label: 'allowAllPermission',
    }),
  }),
);

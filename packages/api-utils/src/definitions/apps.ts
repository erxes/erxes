import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IApp {
  isEnabled?: boolean;
  name: string;
  userGroupId: string;
  expireDate?: Date;
  noExpire?: boolean;
  allowAllPermission?: boolean;
}

export interface IAppDocument extends IApp, Document {
  _id: string;
  createdAt: Date;
  accessToken: string;
  refreshToken: string;
}

export const appSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'App name' }),
  createdAt: field({ type: Date, label: 'Created at', default: new Date() }),
  accessToken: field({ type: String, label: 'Access token' }),
  refreshToken: field({
    type: String,
    label: 'Refresh token used to gain access token'
  }),
  isEnabled: field({ type: Boolean, label: 'Status of the app' }),
  userGroupId: field({ type: String, label: 'User group id', optional: true }),
  expireDate: field({ type: Date, label: 'Token expire date' }),
  noExpire: field({ type: Boolean, label: 'noExpire' }),
  allowAllPermission: field({ type: Boolean, label: 'allowAllPermission' })
});

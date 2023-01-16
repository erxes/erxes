import {
  IDetail,
  IDetailDocument,
  IEmailSignature,
  IEmailSignatureDocument,
  IUser,
  IUserDocument,
  userSchema
} from '@erxes/api-utils/src/definitions/users';
import { Document, Schema } from 'mongoose';
import { USER_MOVEMENT_STATUSES } from '../../../constants';
import { field } from './utils';

interface IUserMovementDocument extends Document {
  _id: string;
  contentType: string;
  contentTypeId: string;
  userId: string;
  createdAt: string;
  createdBy: string;
  status: string;
  isActive: boolean;
}

const userMovemmentSchema = new Schema({
  _id: field({ pkey: true }),
  contentType: field({ type: String, label: 'Content Type' }),
  contentTypeId: field({ type: String, label: 'Content Type Id' }),
  userId: field({ type: String, label: 'User Id' }),
  createdBy: field({ type: String, label: 'Created By' }),
  isActive: field({ type: Boolean, label: 'Is Active' }),
  status: field({
    type: String,
    label: 'User Movement Status',
    default: USER_MOVEMENT_STATUSES.CREATED
  }),
  createdAt: field({ type: Date, label: 'Created At', default: Date.now })
});

export {
  IDetail,
  IDetailDocument,
  IEmailSignature,
  IEmailSignatureDocument,
  IUser,
  IUserDocument,
  userSchema,
  IUserMovementDocument,
  userMovemmentSchema
};

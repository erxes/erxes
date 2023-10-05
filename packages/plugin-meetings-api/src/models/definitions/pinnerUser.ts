import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IPinnedUser {
  userId: string;
  pinnedUserIds: string;
}
export interface IPinnedUserDocument extends IPinnedUser, Document {
  _id: String;
}

export const pinnedUserSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ pkey: true }),
  pinnedUserIds: field({ type: [String] })
});

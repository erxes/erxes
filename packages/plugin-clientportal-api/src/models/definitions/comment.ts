import { field } from '@erxes/api-utils/src';
import { Document, Schema } from 'mongoose';

export interface IComment {
  typeId: string;
  type: string;

  content: string;
  parentId?: string;

  userId?: string;
  userType?: string;
}

export interface ICommentDocument extends IComment, Document {
  _id: string;
  createdAt?: Date;
}

export const USER_TYPES = {
  TEAM: 'team',
  CLIENT: 'client',
  ALL: ['team', 'client']
};

export const commentSchema = new Schema({
  typeId: field({ type: String, label: 'Type Id' }),
  type: field({ type: String, label: 'Type' }),

  content: field({ type: String, label: 'Content' }),
  parentId: field({ type: String, label: 'Parent Id' }),

  userId: field({ type: String, label: 'User Id' }),
  userType: field({ type: String, enum: USER_TYPES.ALL, label: 'User Type' }),

  createdAt: field({ type: Date, label: 'Created at' })
});

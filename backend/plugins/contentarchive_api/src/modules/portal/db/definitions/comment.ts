import { Schema } from 'mongoose';
import { USER_TYPES } from '@/portal/constants';

export const commentSchema = new Schema({
  typeId: { type: String, label: 'Type Id' },
  type: { type: String, label: 'Type' },

  content: { type: String, label: 'Content' },
  parentId: { type: String, label: 'Parent Id' },

  userId: { type: String, label: 'User Id' },
  userType: { type: String, enum: USER_TYPES.ALL, label: 'User Type' },

  createdAt: { type: Date, label: 'Created at' },
});

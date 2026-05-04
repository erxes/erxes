import { Schema } from 'mongoose';

import { mongooseStringRandomId } from '../../../utils';

export const USER_TYPES = {
  TEAM: 'team',
  CLIENT: 'client',
  ALL: ['team', 'client']
};

export const commentSchema = new Schema(
  {
    _id: mongooseStringRandomId,

    phone: { type: String, sparse: true },
    typeId: ({ type: String, label: 'Type Id' }),
    type: ({ type: String, label: 'Type' }),
    content: { type: String, label: 'Content' },
    parentId: { type: String, label: 'Parent Id' },
    userId: { type: String, label: 'User Id' },
    userType: { type: String, enum: USER_TYPES.ALL, label: 'User Type' },
    createdAt: { type: Date, label: 'Created at' }
  },
  { timestamps: true },
);
commentSchema.index({ typeId: 1 });

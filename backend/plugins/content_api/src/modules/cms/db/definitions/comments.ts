import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IPostCommentDocument } from '@/cms/@types/comments';

export const postCommentSchema = new Schema<IPostCommentDocument>(
  {
    _id: mongooseStringRandomId,
    postId: { type: String, required: true },
    clientPortalId: { type: String, required: true },
    content: { type: String, required: true },
    authorKind: {
      type: String,
      required: true,
      enum: ['user', 'portalUser'],
    },
    authorId: { type: String, required: true },
    parentId: { type: String },
    status: {
      type: String,
      default: 'approved',
      enum: ['pending', 'approved', 'rejected'],
    },
  },
  { timestamps: true },
);

postCommentSchema.index({ postId: 1, clientPortalId: 1 });
postCommentSchema.index({ parentId: 1 });

import mongoose from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import {
  IPostViewDocument,
  POST_VIEW_RETENTION_SECONDS,
} from '@/cms/@types/postView';

export const postViewSchema = new mongoose.Schema<IPostViewDocument>(
  {
    _id: mongooseStringRandomId,
    postId: { type: String, required: true, index: true },
    clientPortalId: { type: String, required: true, index: true },
    viewedAt: { type: Date, required: true, index: true },
    count: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

postViewSchema.index(
  { postId: 1, clientPortalId: 1, viewedAt: 1 },
  { unique: true },
);

postViewSchema.index(
  { viewedAt: 1 },
  { expireAfterSeconds: POST_VIEW_RETENTION_SECONDS },
);

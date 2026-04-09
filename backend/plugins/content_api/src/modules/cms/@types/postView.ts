import { Document } from 'mongoose';

export const POST_VIEW_RETENTION_DAYS = 30;
export const POST_VIEW_RETENTION_SECONDS =
  POST_VIEW_RETENTION_DAYS * 24 * 60 * 60;

export interface IPostView {
  postId: string;
  clientPortalId: string;
  viewedAt: Date;
  count: number;
}

export interface IPostViewDocument extends IPostView, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostViewCount {
  postId: string;
  recentViewCount: number;
}

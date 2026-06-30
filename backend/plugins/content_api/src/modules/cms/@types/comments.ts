import { Document, Model } from 'mongoose';

export type PostCommentStatus = 'pending' | 'approved' | 'rejected';
export type PostCommentAuthorKind = 'user' | 'portalUser';

export interface IPostComment {
  postId: string;
  clientPortalId: string;
  content: string;
  authorKind: PostCommentAuthorKind;
  authorId: string;
  parentId?: string;
  status: PostCommentStatus;
}

export interface IPostCommentDocument extends IPostComment, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostCommentModel extends Model<IPostCommentDocument> {
  createComment(doc: IPostComment): Promise<IPostCommentDocument>;
  updateComment(_id: string, content: string): Promise<IPostCommentDocument>;
  deleteComment(_id: string): Promise<{ deletedCount?: number }>;
}


import { Document } from 'mongoose';

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

import { Document, Schema } from 'mongoose';

export interface ICPComment {
  typeId: string;
  type: string;

  content: string;
  parentId?: string;

  userId?: string;
  userType?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICPCommentDocument extends ICPComment, Document {
  _id: string;
}
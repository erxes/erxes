import { Document } from 'mongoose';

export interface IInternalNote {
  contentType: string;
  contentTypeId: string;
  content: string;
  mentionedUserIds?: string[];
}

export interface IInternalNoteDocument extends IInternalNote, Document {
  _id: string;
  createdUserId: string;
  createdAt: Date;
}

export interface IInternalNoteParams {
  contentType: string;
  pipelineId: string;
  page: number;
  perPage: number;
}

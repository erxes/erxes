import { Model, Document } from 'mongoose';

export interface INote {
  content: string;
  contentId: string;
  createdBy: string;
  mentions?: string[];
}

export interface INoteDocument extends INote, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type INoteModel = Model<INoteDocument>;

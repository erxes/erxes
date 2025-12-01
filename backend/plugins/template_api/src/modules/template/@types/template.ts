import { Document } from 'mongoose';

export interface ITemplate {
  name?: string;
}

export interface ITemplateDocument extends ITemplate, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

import { Document } from 'mongoose';

export interface ITemplateCategory {
  name: string;
  parentId: string;
  code: string;
  contentType: string;

  createdBy: string;

  updatedBy: string;
}

export interface ITemplateCategoryDocument extends ITemplateCategory, Document {
  _id: string;

  createdAt: Date;
  updatedAt: Date;
}

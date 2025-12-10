import { ICustomField } from 'erxes-api-shared/core-types';

export interface ITranslation {
  postId: string;
  language: string;
  title: string;
  content: string;
  excerpt: string;
  customFieldsData?: ICustomField[];
  type: string;
}

export interface ITranslationDocument extends ITranslation, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

import { ICustomField } from 'erxes-api-shared/core-types';

export interface IPostTranslation {
  postId: string;
  language: string;
  title: string;
  content: string;
  excerpt: string;
  customFieldsData?: ICustomField[];
}

export interface IPostTranslationDocument extends IPostTranslation, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

import { IUser } from 'ui-modules';
import { TemplateCategory } from './TemplateCategory';

export interface IRelatedContent {
  contentType: string;
  content: string[];
}

export type Template = {
  _id: string;

  name: string;
  description: string;
  contentId: string;
  contentType: string;
  content: string;
  relatedContents: IRelatedContent[];

  createdBy: IUser;
  updatedBy: IUser;

  categoryIds: string[];
  categories: TemplateCategory;

  createdAt: Date;
  updatedAt: Date;
};

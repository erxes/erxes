import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { IUser } from 'ui-modules';

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

export type TemplateFilterState = {
  searchValue: string | null;
  contentType: string | null;
  categoryIds: string[] | null;

  createdAt: string | null;
  createdBy: string | string[] | null;

  updatedAt: string | null;
  updatedBy: string | string[] | null;
};

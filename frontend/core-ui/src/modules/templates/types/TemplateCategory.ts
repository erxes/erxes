import { IUser } from 'ui-modules';

export type TemplateCategory = {
  _id: string;

  name: string;
  parentId: string;
  order: string;
  code: string;
  contentType: string;

  createdBy: IUser;
  updatedBy: IUser;

  createdAt: Date;
  updatedAt: Date;
};

export type TemplateCategoryFilterState = {
  searchValue: string | null;
  parentIds: string[] | null;

  createdAt: string | null;
  createdBy: string | string[] | null;

  updatedAt: string | null;
  updatedBy: string | string[] | null;
}
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

import { Document } from 'mongoose';

export interface ICustomFieldGroup {
  clientPortalId: string;
  label: string;
  code: string;
  order: number;
  parentId?: string;
  type: 'user' | 'post' | 'page' | 'category';
  customPostTypeIds?: string[];

  enabledPageIds?: string[];
  enabledCategoryIds?: string[];
}

export interface ICustomFieldGroupDocument extends ICustomFieldGroup, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

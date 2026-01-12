import { Document } from 'mongoose';

export interface ICustomPostType {
  _id: string;
  clientPortalId: string;

  label: string;
  name?: string;
  pluralLabel: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface ICustomPostTypeDocument extends ICustomPostType, Document {
  _id: string;
}




export interface ICustomFieldGroup {
  _id: string;
  clientPortalId: string;
  label: string;
  code?: string;
  parentId?: string;
  order?: number;
  customPostTypeIds?: string[];
  enabledPageIds?: string[];
  enabledCategoryIds?: string[];
  type?: string;
}

export interface ICustomFieldGroupDocument extends ICustomFieldGroup, Document {
  _id: string;
}



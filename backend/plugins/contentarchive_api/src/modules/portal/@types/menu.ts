import { Document } from 'mongoose';

export interface IMenuItem {
  clientPortalId: string;
  label: string;
  contentType: string;
  contentTypeID: string;
  kind: string;
  icon: string;
  url: string;
  parentId?: string;
  order?: number;
  target?: string;
}

export interface IMenuItemDocument extends IMenuItem, Document {
  _id: string;
}

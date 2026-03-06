import { Document } from 'mongoose';
import { ICommonFields } from '@/webbuilder/@types/common';

export interface IWebMenuItem {
  parentId?: string;
  webId: string;
  clientPortalId: string;
  label: string;
  objectType?: string;
  objectId?: string;
  kind?: string;
  icon?: string;
  url?: string;
  order?: number;
  target?: string;
  isActive?: boolean;
}

export interface IWebMenuItemDocument extends IWebMenuItem, ICommonFields, Document {
  _id: string;
}


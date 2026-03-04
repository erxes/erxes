import { Document } from 'mongoose';

export interface IWebPageItem {
  name: string;
  type: string;
  content: any;
  order: number;
  objectType: string;
  objectId: string;
  config?: any;
}

export interface IWebPage {
  clientPortalId: string;
  name: string;
  description?: string;
  content?: string;
  slug: string;
  layout?: string;
  createdUserId?: string;
  coverImage?: string;
  customFieldsData?: any[];
  pageItems?: IWebPageItem[];
}

export interface IWebPageDocument extends IWebPage, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}


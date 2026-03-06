import { Document } from 'mongoose';

export interface IWebPageItem {
  name: string;
  type: string;
  content: any;
  order: number;
  contentType: string;
  contentId: string;
  config?: any;
}

export interface IWebPage {
  webId: string; 
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


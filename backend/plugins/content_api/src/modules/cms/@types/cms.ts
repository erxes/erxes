export interface IContentCMS {
  name: string;
  description: string;
  clientPortalId: string;
  content: string;
  language?: string;
  languages?: string[];
}

export interface IContentCMSDocument extends IContentCMS, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContentCMSInput {
  name: string;
  description: string;
  clientPortalId: string;
  content: string;
  language?: string;
  languages?: string[];
}

export interface ICMSMenu {
  clientPortalId: string;
  label: string;
  objectType: string;
  objectId: string;
  kind: string;
  icon?: string;
  url?: string;
  parentId?: string;
  order: number;
  target?: string;
}

export interface ICMSMenuDocument extends ICMSMenu, Document {
   _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICMSPageItem {
  name: string;
  type: string;
  content: any;
  order: number;
  objectType: string;
  objectId: string;
  config?: any;
}

export interface ICMSPage {
  clientPortalId: string;
  name: string;
  description?: string;
  content?: string;
  slug: string;
  layout?: string;
  status?: string;
  createdUserId?: string;
  coverImage?: string;
  customFieldsData?: any[];
  pageItems?: ICMSPageItem[];
}

export interface ICMSPageDocument extends ICMSPage, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}


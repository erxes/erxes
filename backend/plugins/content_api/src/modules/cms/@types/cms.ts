import {
  IAttachment,
  IPdfAttachment,
  ICustomField,
} from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export const CMS_POST_URL_FIELDS = ['_id', 'count', 'slug'] as const;
export type CMSPostUrlField = (typeof CMS_POST_URL_FIELDS)[number];
export const CMS_DEFAULT_POST_URL_FIELD: CMSPostUrlField = '_id';
export const MENU_LINK_TYPES = [
  'URL',
  'PAGE',
  'POST',
  'CATEGORY',
  'TAG',
] as const;
export type MenuLinkType = (typeof MENU_LINK_TYPES)[number];

export interface IContentCMS {
  name: string;
  description: string;
  clientPortalId: string;
  content: string;
  domain?: string;
  publicUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  metaImage?: IAttachment;
  googleTrackingId?: string;
  googleTagManagerId?: string;
  customScripts?: string[];
  defaultPostStatus?: string;
  allowComments?: boolean;
  siteLogo?: IAttachment;
  favicon?: IAttachment;
  language?: string;
  languages?: string[];
  postUrlField?: CMSPostUrlField;
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
  domain?: string;
  publicUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  metaImage?: IAttachment;
  googleTrackingId?: string;
  googleTagManagerId?: string;
  customScripts?: string[];
  defaultPostStatus?: string;
  allowComments?: boolean;
  siteLogo?: IAttachment;
  favicon?: IAttachment;
  language?: string;
  languages?: string[];
  postUrlField?: CMSPostUrlField;
}

export interface ICMSMenu {
  clientPortalId: string;
  webId?: string;
  label: string;
  contentType?: string;
  contentTypeId?: string;
  linkType?: MenuLinkType;
  kind: string;
  icon?: string;
  url?: string;
  parentId?: string;
  order: number;
  linkedContent?: IMenuLinkedContent | null;
  openInNewTab?: boolean;
  target?: string;
}

export interface IMenuLinkedContent {
  _id: string;
  title?: string;
  slug?: string;
  linkType: MenuLinkType;
}

export interface ICMSMenuDocument
  extends Omit<Document, 'contentType'>, ICMSMenu {
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
  parentId?: string;
  description?: string;
  content?: string;
  slug: string;
  layout?: string;
  status?: string;
  createdUserId?: string;
  coverImage?: string;
  customFieldsData?: ICustomField;

  thumbnail?: IAttachment;
  pageImages?: IAttachment[];
  video?: IAttachment;
  audio?: IAttachment;
  documents?: IAttachment[];
  attachments?: IAttachment[];
  videoUrl?: string;
  pdfAttachment?: IPdfAttachment;

  pageItems?: ICMSPageItem[];
}

export interface ICMSPageDocument extends ICMSPage, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

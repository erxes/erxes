export interface IWebThumbnail {
  url?: string;
  name?: string;
  type?: string;
  size?: number;
  duration?: number;
}

export interface IWeb {
  _id: string;
  name: string;
  description?: string;
  domain?: string;
  templateType?: string;
  templateId?: string;
  clientPortalId?: string;
  thumbnail?: IWebThumbnail;
}

export interface IWebInput {
  name: string;
  description?: string;
  domain?: string;
  templateType?: string;
  templateId?: string;
  clientPortalId?: string;
}

export interface IWebPageItem {
  _id: string;
  name?: string;
  type?: string;
  // Backend stores `content` as a String (JSON-encoded). It may also arrive
  // pre-parsed in some legacy paths, so consumers should tolerate both.
  content?: string | unknown;
  order?: number;
  contentType?: string;
  contentTypeId?: string;
  config?: unknown;
}

export interface IWebPage {
  _id: string;
  webId: string;
  clientPortalId: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
  pageItems?: IWebPageItem[];
}

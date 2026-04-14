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

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

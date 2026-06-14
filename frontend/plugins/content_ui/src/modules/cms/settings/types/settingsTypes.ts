export type CmsAttachment = {
  url: string;
  name: string;
  type?: string;
  size?: number;
  duration?: number;
};

export type SettingsFormState = {
  websiteName: string;
  clientPortalKind: string;
  shortDescription: string;
  domain: string;
  publicUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  metaImage: CmsAttachment | null;
  indexing: 'index' | 'noindex';
  gaTrackingId: string;
  googleTagManagerId: string;
  customHeadScripts: string;
  postUrlField: string;
  postUrlPrefix: string;
  postsPerPage: string;
  defaultPostStatus: string;
  allowComments: boolean;
  languages: string[];
  defaultLanguage: string;
  siteLogo: CmsAttachment | null;
  favicon: CmsAttachment | null;
};

export type ClientPortalOption = {
  _id: string;
  name?: string;
  description?: string;
  domain?: string;
};

export type CmsSettingsData = {
  _id?: string;
  name?: string;
  description?: string;
  clientPortalId?: string;
  content?: string;
  domain?: string;
  publicUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  metaImage?: CmsAttachment | null;
  googleTrackingId?: string;
  googleTagManagerId?: string;
  customScripts?: string[];
  defaultPostStatus?: string;
  allowComments?: boolean;
  language?: string;
  languages?: string[];
  postUrlField?: string;
  postUrlPrefix?: string;
  siteLogo?: CmsAttachment | null;
  favicon?: CmsAttachment | null;
};

export type UpdateSetting = <TKey extends keyof SettingsFormState>(
  key: TKey,
  value: SettingsFormState[TKey],
) => void;

export type SettingsFormState = {
  websiteName: string;
  clientPortalKind: string;
  shortDescription: string;
  domain: string;
  publicUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  indexing: 'index' | 'noindex';
  gaTrackingId: string;
  googleTagManagerId: string;
  customHeadScripts: string;
  postUrlField: string;
  postsPerPage: string;
  defaultPostStatus: string;
  allowComments: boolean;
  languages: string[];
  defaultLanguage: string;
};

export type ClientPortalOption = {
  _id: string;
  name?: string;
  description?: string;
  domain?: string;
};

export type CmsSettingsData = {
  name?: string;
  description?: string;
  clientPortalId?: string;
  domain?: string;
  publicUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  googleTrackingId?: string;
  googleTagManagerId?: string;
  customScripts?: string[];
  defaultPostStatus?: string;
  allowComments?: boolean;
  language?: string;
  languages?: string[];
  postUrlField?: string;
};

export type UpdateSetting = <TKey extends keyof SettingsFormState>(
  key: TKey,
  value: SettingsFormState[TKey],
) => void;

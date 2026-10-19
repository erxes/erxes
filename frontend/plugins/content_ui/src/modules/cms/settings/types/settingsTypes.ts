import type { ContentCmsListQuery } from '~/gql/graphql';

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
  accessPolicy: CmsAccessPolicy;
  assignedMemberIds: string[];
};

export type CmsAccessPolicy = 'open' | 'assigned';

export type ClientPortalOption = {
  _id: string;
  name?: string | null;
  description?: string | null;
  domain?: string | null;
};

export type CmsSettingsData = NonNullable<
  NonNullable<ContentCmsListQuery['contentCMSList']>[number]
>;

export type UpdateSetting = <TKey extends keyof SettingsFormState>(
  key: TKey,
  value: SettingsFormState[TKey],
) => void;

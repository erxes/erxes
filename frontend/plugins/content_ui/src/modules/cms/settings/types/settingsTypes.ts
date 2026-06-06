import { type ComponentType, type ReactNode } from 'react';

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
  gaPropertyId: string;
  gaTrackingId: string;
  googleTagManagerId: string;
  customHeadScripts: string;
  postUrlField: string;
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
  googleAnalyticsPropertyId?: string;
  googleTrackingId?: string;
  googleTagManagerId?: string;
  customScripts?: string[];
  defaultPostStatus?: string;
  allowComments?: boolean;
  language?: string;
  languages?: string[];
  postUrlField?: string;
  siteLogo?: CmsAttachment | null;
  favicon?: CmsAttachment | null;
};

export type UpdateSetting = <TKey extends keyof SettingsFormState>(
  key: TKey,
  value: SettingsFormState[TKey],
) => void;

export type SettingsFormProps = {
  cms?: CmsSettingsData;
  isDeleting: boolean;
  settings: SettingsFormState;
  clientPortals: ClientPortalOption[];
  updateSetting: UpdateSetting;
  onDelete: () => Promise<void> | void;
};

export type SettingsHeaderProps = {
  disabled?: boolean;
  saving?: boolean;
  onSave: () => void;
};

export type RobotsOptionProps = {
  checked: boolean;
  title: string;
  description: string;
  onClick: () => void;
};

export type SettingsSectionProps = {
  id: string;
  title: string;
  badge?: ReactNode;
  className?: string;
  contentClassName?: string;
};

export type UploadValue = Partial<CmsAttachment> & {
  fileInfo?: Partial<CmsAttachment>;
};

export type UploaderProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  value: CmsAttachment | null;
  onChange: (value: CmsAttachment | null) => void;
};

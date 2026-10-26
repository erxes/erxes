import { JSONContent } from 'erxes-ui';

export type TNotificationTemplateVariable = {
  name: string;
  label: string;
  sample?: string | null;
  required?: boolean | null;
};

export type TNotificationTemplateVersion = {
  subject?: string | null;
  preheader?: string | null;
  content?: string | null;
  contentJson?: JSONContent | null;
  savedAt?: string | null;
  savedUser?: {
    _id: string;
    email?: string;
    details?: { fullName?: string | null } | null;
  } | null;
};

export type TNotificationTemplate = {
  key: string;
  title: string;
  description?: string | null;
  defaultSubject?: string | null;
  variables: TNotificationTemplateVariable[];
  starterJson?: JSONContent | null;
  draft?: TNotificationTemplateVersion | null;
  published?: TNotificationTemplateVersion | null;
  draftRevision: number;
  publishedRevision?: number | null;
  version: number;
  fallbackCount: number;
  lastFallbackAt?: string | null;
  lastFallbackReason?: string | null;
};

export type TNotificationTemplateInput = {
  subject?: string;
  preheader?: string;
  content: string;
  contentJson: JSONContent;
};

export type TNotificationEmailBrand = {
  name?: string | null;
  logoUrl?: string | null;
  color?: string | null;
  footerText?: string | null;
};

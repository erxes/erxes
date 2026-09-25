import type { KbTopicStyles } from '@/modules/knowledge-base/types';

export type HelpCenterHeader = {
  wordmark: string | null;
  homeLabel: string | null;
  formsLabel: string | null;
  announcementsLabel: string | null;
  searchPlaceholder: string | null;
};

export type HelpCenterFooterLink = {
  label: string | null;
  url: string | null;
};

export type HelpCenterFooterColumn = {
  heading: string | null;
  links: HelpCenterFooterLink[] | null;
};

export type HelpCenterFooter = {
  logo: string | null;
  description: string | null;
  copyright: string | null;
  columns: HelpCenterFooterColumn[] | null;
};

export type RawCmsConfig = {
  cmsId: string | null;
  cmsAppToken: string | null;
};

export type HelpCenterConfig = {
  _id: string;
  title: string | null;
  description: string | null;
  url: string | null;
  erxesAppToken: string | null;
  languageCode: string | null;

  kbToggle: boolean | null;
  kbLabel: string | null;
  kbTopicId: string | null;

  ticketToggle: boolean | null;
  ticketLabel: string | null;
  ticketChannelId: string | null;
  ticketPipelineId: string | null;
  ticketStatusId: string | null;

  formChannelId: string | null;
  formIds: string[] | null;

  cmsId: string | null;
  cmsAppToken: string | null;
  cmsConfigs: RawCmsConfig[] | null;

  color: string | null;
  backgroundImage: string | null;
  styles: KbTopicStyles;
  header?: HelpCenterHeader | null;
  footer?: HelpCenterFooter | null;
};

export type PortalCmsConfig = {
  cmsId: string;
  cmsAppToken: string;
};

export type PortalHeader = {
  wordmark: string;
  homeLabel: string;
  formsLabel: string;
  announcementsLabel: string;
  searchPlaceholder: string;
};

export type PortalFooterLink = {
  label: string;
  url: string;
};

export type PortalFooterColumn = {
  heading: string;
  links: PortalFooterLink[];
};

export type PortalFooter = {
  logo: string;
  description: string;
  copyright: string;
  columns: PortalFooterColumn[];
};

export type PortalConfig = {
  _id: string;
  title: string;
  description: string;
  url: string;
  appToken: string;
  languageCode: string;

  knowledgeBaseEnabled: boolean;
  knowledgeBaseLabel: string;
  topicId: string;

  ticketsEnabled: boolean;
  ticketLabel: string;
  ticketChannelId: string;
  ticketPipelineId: string;
  ticketStatusId: string;

  formChannelId: string;
  formIds: string[];

  cmsId: string;
  cmsAppToken: string;
  cmsConfigs: PortalCmsConfig[];

  color: string;
  backgroundImage: string;
  styles: KbTopicStyles;
  header: PortalHeader;
  footer: PortalFooter;
};

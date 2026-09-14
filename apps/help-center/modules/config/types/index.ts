import type { KbTopicStyles } from '@/modules/knowledge-base/types';

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

  color: string | null;
  backgroundImage: string | null;
  styles: KbTopicStyles;
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

  color: string;
  backgroundImage: string;
  styles: KbTopicStyles;
};

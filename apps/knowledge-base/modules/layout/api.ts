import { readConfig } from '@/modules/config/api';
import { getPortalCopy } from '@/modules/cms/api';
import { normalizeTheme } from '@/modules/knowledge-base/utils/normalize';
import type {
  PortalTheme,
  PortalTicketTarget,
} from '@/modules/knowledge-base/utils/normalize';
import { site } from './constants/site';

export type PortalIdentity = {
  title: string;
  headline: string;
};

export const getPortalIdentity = async (): Promise<PortalIdentity> => {
  const [copy, config] = await Promise.all([getPortalCopy(), readConfig()]);

  return {
    title: copy?.name?.trim() || config?.title || site.fallbackTitle,
    headline:
      copy?.description?.trim() ||
      config?.description ||
      site.fallbackHeadline,
  };
};

export type PortalSettings = {
  knowledgeBaseEnabled: boolean;
  knowledgeBaseLabel: string;
  ticketsEnabled: boolean;
  ticketLabel: string;
  ticketTarget: PortalTicketTarget;
  theme: PortalTheme | null;
};

const EMPTY_TARGET: PortalTicketTarget = {
  channelId: '',
  pipelineId: '',
  statusId: '',
};

export const getPortalSettings = async (): Promise<PortalSettings> => {
  const config = await readConfig();

  if (!config) {
    return {
      knowledgeBaseEnabled: false,
      knowledgeBaseLabel: '',
      ticketsEnabled: false,
      ticketLabel: '',
      ticketTarget: EMPTY_TARGET,
      theme: null,
    };
  }

  return {
    knowledgeBaseEnabled: config.knowledgeBaseEnabled,
    knowledgeBaseLabel: config.knowledgeBaseLabel,
    ticketsEnabled: config.ticketsEnabled,
    ticketLabel: config.ticketLabel,
    ticketTarget: {
      channelId: config.ticketChannelId,
      pipelineId: config.ticketPipelineId,
      statusId: config.ticketStatusId,
    },
    theme: normalizeTheme(config),
  };
};

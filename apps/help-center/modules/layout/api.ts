import { readConfig } from '@/modules/config/api';
import { getPortalCopy } from '@/modules/cms/api';
import { storedFileUrl } from '@/modules/apollo/utils/file';
import type { PortalFooterColumn, PortalHeader } from '@/modules/config/types';
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
      copy?.description?.trim() || config?.description || site.fallbackHeadline,
  };
};

export type PortalFooterView = {
  logo: string | null;
  description: string;
  copyright: string;
  columns: PortalFooterColumn[];
  languageLabel: string;
};

export type PortalSettings = {
  header: PortalHeader;
  knowledgeBaseEnabled: boolean;
  knowledgeBaseLabel: string;
  ticketsEnabled: boolean;
  ticketLabel: string;
  ticketTarget: PortalTicketTarget;
  theme: PortalTheme | null;
  footer: PortalFooterView;
};

const EMPTY_TARGET: PortalTicketTarget = {
  channelId: '',
  pipelineId: '',
  statusId: '',
};

const EMPTY_HEADER: PortalHeader = {
  wordmark: '',
  homeLabel: '',
  formsLabel: '',
  announcementsLabel: '',
  searchPlaceholder: '',
};

const EMPTY_FOOTER: PortalFooterView = {
  logo: null,
  description: '',
  copyright: '',
  columns: [],
  languageLabel: site.fallbackLanguageLabel,
};

const languageLabel = (code: string): string => {
  if (!code) {
    return site.fallbackLanguageLabel;
  }

  try {
    const label = new Intl.DisplayNames([code], { type: 'language' }).of(code);

    return label ? label.charAt(0).toUpperCase() + label.slice(1) : code;
  } catch {
    return code;
  }
};

export const getPortalSettings = async (): Promise<PortalSettings> => {
  const config = await readConfig();

  if (!config) {
    return {
      header: EMPTY_HEADER,
      knowledgeBaseEnabled: false,
      knowledgeBaseLabel: '',
      ticketsEnabled: false,
      ticketLabel: '',
      ticketTarget: EMPTY_TARGET,
      theme: null,
      footer: EMPTY_FOOTER,
    };
  }

  return {
    header: config.header,
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
    footer: {
      logo: storedFileUrl(config.footer.logo),
      description: config.footer.description,
      copyright: config.footer.copyright,
      columns: config.footer.columns,
      languageLabel: languageLabel(config.languageCode),
    },
  };
};

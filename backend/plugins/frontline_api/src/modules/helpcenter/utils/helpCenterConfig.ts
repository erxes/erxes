import {
  removeExtraSpaces,
  removeLastTrailingSlash,
} from 'erxes-api-shared/utils';
import {
  IHelpCenterConfigInput,
  IHelpCenterFooter,
  IHelpCenterHeader,
} from '@/helpcenter/@types/helpCenterConfig';

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);

    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

export const normalizeHelpCenterUrl = (url?: string): string =>
  url ? removeExtraSpaces(removeLastTrailingSlash(url)) : '';

const normalizeHelpCenterFooter = (
  footer?: IHelpCenterFooter,
): IHelpCenterFooter => ({
  logo: footer?.logo?.trim() ?? '',
  description: footer?.description?.trim() ?? '',
  copyright: footer?.copyright?.trim() ?? '',
  columns: (footer?.columns ?? [])
    .map((column) => ({
      heading: column.heading?.trim() ?? '',
      links: (column.links ?? [])
        .map((link) => ({
          label: link.label?.trim() ?? '',
          url: link.url?.trim() ?? '',
        }))
        .filter((link) => link.label && link.url),
    }))
    .filter((column) => column.heading || column.links.length),
});

const normalizeHelpCenterHeader = (
  header?: IHelpCenterHeader,
): IHelpCenterHeader => ({
  wordmark: header?.wordmark?.trim() ?? '',
  homeLabel: header?.homeLabel?.trim() ?? '',
  formsLabel: header?.formsLabel?.trim() ?? '',
  announcementsLabel: header?.announcementsLabel?.trim() ?? '',
  searchPlaceholder: header?.searchPlaceholder?.trim() ?? '',
});

const normalizeHelpCenterIdentity = (config: IHelpCenterConfigInput) => {
  const title = config.title?.trim() ?? '';
  const url = normalizeHelpCenterUrl(config.url);

  if (!title) {
    throw new Error('Please enter a help center name');
  }

  if (url && !isHttpUrl(url)) {
    throw new Error('Please enter a valid website address');
  }

  return {
    title,
    url,
    erxesAppToken: config.erxesAppToken?.trim() ?? '',
    description: config.description?.trim() ?? '',
  };
};

const normalizeKnowledgeBase = (config: IHelpCenterConfigInput) => {
  const kbToggle = config.kbToggle ?? false;

  if (kbToggle && !config.kbTopicId) {
    throw new Error('Please choose a knowledge base topic');
  }

  if (!kbToggle) {
    return { kbToggle, kbLabel: '', kbTopicId: '' };
  }

  return {
    kbToggle,
    kbLabel: config.kbLabel?.trim() ?? '',
    kbTopicId: config.kbTopicId ?? '',
  };
};

const normalizeTickets = (config: IHelpCenterConfigInput) => {
  const ticketToggle = config.ticketToggle ?? false;

  if (ticketToggle && !config.ticketChannelId) {
    throw new Error('Please choose a ticket channel');
  }

  if (ticketToggle && !config.ticketPipelineId) {
    throw new Error('Please choose a ticket pipeline');
  }

  if (!ticketToggle) {
    return {
      ticketToggle,
      ticketLabel: '',
      ticketChannelId: '',
      ticketPipelineId: '',
      ticketStatusId: '',
      formChannelId: '',
      formIds: [],
    };
  }

  return {
    ticketToggle,
    ticketLabel: config.ticketLabel?.trim() ?? '',
    ticketChannelId: config.ticketChannelId ?? '',
    ticketPipelineId: config.ticketPipelineId ?? '',
    ticketStatusId: config.ticketStatusId ?? '',
    formChannelId: config.formChannelId ?? '',
    formIds: [...new Set((config.formIds ?? []).filter(Boolean))],
  };
};

const normalizeCms = (config: IHelpCenterConfigInput) => {
  const cmsId = config.cmsId?.trim() ?? '';
  const cmsAppToken = config.cmsAppToken?.trim() ?? '';

  if (cmsId && !cmsAppToken) {
    throw new Error("The chosen CMS's client portal has no app token");
  }

  return { cmsId, cmsAppToken: cmsId ? cmsAppToken : '' };
};

export const normalizeHelpCenterConfig = (
  config: IHelpCenterConfigInput,
): IHelpCenterConfigInput => ({
  ...config,
  ...normalizeHelpCenterIdentity(config),
  ...normalizeKnowledgeBase(config),
  ...normalizeTickets(config),
  ...normalizeCms(config),
  header: normalizeHelpCenterHeader(config.header),
  footer: normalizeHelpCenterFooter(config.footer),
});

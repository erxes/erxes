import type {
  HelpCenterConfig,
  HelpCenterFooter,
  HelpCenterHeader,
  PortalConfig,
  PortalFooter,
  PortalHeader,
} from '../types';

const text = (value: string | null | undefined): string => value?.trim() ?? '';

const normalizeFooter = (footer: HelpCenterFooter | null): PortalFooter => ({
  logo: text(footer?.logo),
  description: text(footer?.description),
  copyright: text(footer?.copyright),
  columns: (footer?.columns ?? [])
    .map((column) => ({
      heading: text(column.heading),
      links: (column.links ?? [])
        .map((link) => ({ label: text(link.label), url: text(link.url) }))
        .filter((link) => link.label && link.url),
    }))
    .filter((column) => column.heading || column.links.length),
});

const normalizeHeader = (header: HelpCenterHeader | null): PortalHeader => ({
  wordmark: text(header?.wordmark),
  homeLabel: text(header?.homeLabel),
  formsLabel: text(header?.formsLabel),
  announcementsLabel: text(header?.announcementsLabel),
  searchPlaceholder: text(header?.searchPlaceholder),
});

export const normalizeConfig = (config: HelpCenterConfig): PortalConfig => {
  const kbToggle = config.kbToggle ?? true;
  const ticketToggle = config.ticketToggle ?? false;

  return {
    _id: config._id,
    title: text(config.title),
    description: text(config.description),
    url: text(config.url),
    appToken: text(config.erxesAppToken),
    languageCode: text(config.languageCode),

    knowledgeBaseEnabled: kbToggle && !!text(config.kbTopicId),
    knowledgeBaseLabel: text(config.kbLabel),
    topicId: text(config.kbTopicId),

    ticketsEnabled:
      ticketToggle &&
      !!text(config.ticketChannelId) &&
      !!text(config.ticketPipelineId),
    ticketLabel: text(config.ticketLabel),
    ticketChannelId: text(config.ticketChannelId),
    ticketPipelineId: text(config.ticketPipelineId),
    ticketStatusId: text(config.ticketStatusId),

    formChannelId: ticketToggle ? text(config.formChannelId) : '',
    formIds: ticketToggle
      ? (config.formIds ?? []).map(text).filter(Boolean)
      : [],

    cmsId: text(config.cmsId),
    cmsAppToken: text(config.cmsId) ? text(config.cmsAppToken) : '',

    color: text(config.color),
    backgroundImage: text(config.backgroundImage),
    styles: config.styles,
    header: normalizeHeader(config.header ?? null),
    footer: normalizeFooter(config.footer ?? null),
  };
};

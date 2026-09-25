import type {
  HelpCenterConfig,
  HelpCenterFooter,
  HelpCenterHeader,
  PortalCmsConfig,
  PortalConfig,
  PortalFooter,
  PortalHeader,
} from '../types';

const text = (value: string | null | undefined): string => value?.trim() ?? '';

const normalizeCmsConfigs = (config: HelpCenterConfig): PortalCmsConfig[] => {
  const entries = (config.cmsConfigs ?? []).length
    ? config.cmsConfigs ?? []
    : [{ cmsId: config.cmsId, cmsAppToken: config.cmsAppToken }];

  const byCmsId = new Map<string, PortalCmsConfig>();

  for (const entry of entries) {
    const cmsId = text(entry?.cmsId);
    const cmsAppToken = text(entry?.cmsAppToken);

    if (cmsId && cmsAppToken) {
      byCmsId.set(cmsId, { cmsId, cmsAppToken });
    }
  }

  return [...byCmsId.values()];
};

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
  const cmsConfigs = normalizeCmsConfigs(config);

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

    cmsId: cmsConfigs[0]?.cmsId ?? '',
    cmsAppToken: cmsConfigs[0]?.cmsAppToken ?? '',
    cmsConfigs,

    color: text(config.color),
    backgroundImage: text(config.backgroundImage),
    styles: config.styles,
    header: normalizeHeader(config.header ?? null),
    footer: normalizeFooter(config.footer ?? null),
  };
};

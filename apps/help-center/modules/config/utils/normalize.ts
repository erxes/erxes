import type { HelpCenterConfig, PortalConfig } from '../types';

const text = (value: string | null | undefined): string => value?.trim() ?? '';

export const normalizeConfig = (config: HelpCenterConfig): PortalConfig => {
  const kbToggle = config.kbToggle ?? true;
  const ticketToggle = config.ticketToggle ?? false;
//test
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

    color: text(config.color),
    backgroundImage: text(config.backgroundImage),
    styles: config.styles,
  };
};

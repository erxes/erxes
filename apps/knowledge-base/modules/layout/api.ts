import { getPortalCopy } from '@/modules/cms/api';
import { getTopicOverview } from '@/modules/knowledge-base/api';
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
  const [copy, topic] = await Promise.all([
    getPortalCopy(),
    getTopicOverview(),
  ]);

  const topicData = topic.state === 'ready' ? topic.data : null;

  return {
    title: copy?.name?.trim() || topicData?.title || site.fallbackTitle,
    headline:
      copy?.description?.trim() ||
      topicData?.description ||
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

/*
 * Read wherever a surface has to know what the help center turned on. The topic
 * is cached upstream, so every caller in a render shares one request, and a
 * topic that cannot be read leaves the portal fully enabled rather than
 * hiding everything behind an outage.
 */
export const getPortalSettings = async (): Promise<PortalSettings> => {
  const topic = await getTopicOverview();

  if (topic.state !== 'ready') {
    return {
      knowledgeBaseEnabled: true,
      knowledgeBaseLabel: '',
      ticketsEnabled: true,
      ticketLabel: '',
      ticketTarget: EMPTY_TARGET,
      theme: null,
    };
  }

  const {
    knowledgeBaseEnabled,
    knowledgeBaseLabel,
    ticketsEnabled,
    ticketLabel,
    ticketTarget,
    theme,
  } = topic.data;

  return {
    knowledgeBaseEnabled,
    knowledgeBaseLabel,
    ticketsEnabled,
    ticketLabel,
    ticketTarget,
    theme,
  };
};

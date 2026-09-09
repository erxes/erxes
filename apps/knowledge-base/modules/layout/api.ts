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

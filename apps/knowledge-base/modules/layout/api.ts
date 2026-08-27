import { getPortalCopy } from '@/modules/cms/api';
import { getTopicOverview } from '@/modules/knowledge-base/api';
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

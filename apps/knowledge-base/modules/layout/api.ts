import { getPortalCopy } from '@/modules/cms/api';
import { getTopicOverview } from '@/modules/knowledge-base/api';
import { site } from './site';

export type PortalIdentity = {
  /** Shown next to the wordmark and used as the metadata title. */
  title: string;
  /** Hero headline. */
  headline: string;
};

/**
 * Portal wording, in priority order: the CMS page for this portal, then the
 * knowledge base topic, then the built-in fallback. Both sources are optional
 * so the chrome still renders while the API is unreachable.
 */
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

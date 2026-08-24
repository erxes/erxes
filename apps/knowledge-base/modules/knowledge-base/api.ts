import { query } from '@/modules/apollo/apolloClient';
import { readPortalEnv } from '@/modules/apollo/env';
import {
  errorMessage,
  kbGate,
  type PortalResult,
} from '@/modules/apollo/result';
import {
  KB_PORTAL_TOPIC_ARTICLES,
  KB_PORTAL_TOPIC_OVERVIEW,
} from './graphql/queries/knowledgeBaseTopic';
import { normalizeTopic, type PortalTopic } from './normalize';
import type { KbTopic } from './types';

type TopicResponse = { cpKnowledgeBaseTopicDetail: KbTopic | null };

const fetchTopic = async (
  document: typeof KB_PORTAL_TOPIC_OVERVIEW,
): Promise<PortalResult<PortalTopic>> => {
  const unconfigured = kbGate<PortalTopic>();

  if (unconfigured) {
    return unconfigured;
  }

  const { topicId } = readPortalEnv();

  try {
    const { data, error } = await query<TopicResponse>({
      query: document,
      variables: { topicId },
      errorPolicy: 'all',
    });

    if (error) {
      return { state: 'error', message: error.message };
    }

    const topic = data?.cpKnowledgeBaseTopicDetail;

    if (!topic) {
      return {
        state: 'error',
        message: `«${topicId}» ID-тай мэдлэгийн сангийн сэдэв олдсонгүй.`,
      };
    }

    return { state: 'ready', data: normalizeTopic(topic) };
  } catch (caught) {
    return { state: 'error', message: errorMessage(caught) };
  }
};

/** Categories and counts only — home page and category sidebar. */
export const getTopicOverview = () => fetchTopic(KB_PORTAL_TOPIC_OVERVIEW);

/** Full tree including article bodies — category, article and search pages. */
export const getTopicWithArticles = () => fetchTopic(KB_PORTAL_TOPIC_ARTICLES);

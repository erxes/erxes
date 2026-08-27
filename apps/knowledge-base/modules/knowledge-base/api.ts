import { query } from '@/modules/apollo/apolloClient';
import { readPortalEnv } from '@/modules/apollo/utils/env';
import {
  errorMessage,
  kbGate,
  type PortalResult,
} from '@/modules/apollo/utils/result';
import {
  KB_PORTAL_TOPIC_ARTICLES,
  KB_PORTAL_TOPIC_ARTICLE_LIST,
  KB_PORTAL_TOPIC_OVERVIEW,
} from './graphql/queries/knowledgeBaseTopic';
import { normalizeTopic, type PortalTopic } from './utils/normalize';
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

const TOPIC_TTL_MS = 60_000;

type TopicPromise = Promise<PortalResult<PortalTopic>>;

const topicCache = new Map<string, { at: number; value: TopicPromise }>();

const cachedTopic = (
  key: string,
  document: typeof KB_PORTAL_TOPIC_OVERVIEW,
): TopicPromise => {
  const hit = topicCache.get(key);

  if (hit && Date.now() - hit.at < TOPIC_TTL_MS) {
    return hit.value;
  }

  const value = fetchTopic(document).then((result) => {
    if (result.state !== 'ready') {
      topicCache.delete(key);
    }

    return result;
  });

  topicCache.set(key, { at: Date.now(), value });

  return value;
};

export const getTopicOverview = () =>
  cachedTopic('overview', KB_PORTAL_TOPIC_OVERVIEW);

export const getTopicArticleList = () =>
  cachedTopic('article-list', KB_PORTAL_TOPIC_ARTICLE_LIST);

export const getTopicWithArticles = () =>
  cachedTopic('articles', KB_PORTAL_TOPIC_ARTICLES);

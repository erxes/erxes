import { cache } from 'react';
import { query } from '@/modules/apollo/apolloClient';
import {
  createSharedCache,
  TIMED_OUT,
} from '@/modules/apollo/utils/sharedCache';
import { getPortalConfig } from '@/modules/config/api';
import { readScopedApiUrl } from '@/modules/config/requestScope';
import { getT } from '@/modules/i18n/server';
import {
  errorBodyMatches,
  errorMessage,
  type PortalResult,
} from '@/modules/apollo/utils/result';
import {
  KB_PORTAL_TOPIC_ARTICLES,
  KB_PORTAL_TOPIC_ARTICLES_PLAIN,
  KB_PORTAL_TOPIC_ARTICLE_LIST,
  KB_PORTAL_TOPIC_ARTICLE_LIST_PLAIN,
  KB_PORTAL_TOPIC_OVERVIEW,
  KB_PORTAL_TOPIC_OVERVIEW_PLAIN,
} from './graphql/queries/knowledgeBaseTopic';
import {
  emptyTopic,
  normalizeTopic,
  type PortalTopic,
} from './utils/normalize';
import type { PortalConfig } from '@/modules/config/types';
import type { KbTopic } from './types';

type TopicResponse = { cpKnowledgeBaseTopicDetail: KbTopic | null };

type TopicFailure = { error: string; cause?: unknown };

const isFailure = <T>(value: T | TopicFailure): value is TopicFailure =>
  typeof value === 'object' && value !== null && 'error' in value;

type TopicDocument = typeof KB_PORTAL_TOPIC_OVERVIEW;

const PLAIN_OF = new Map<TopicDocument, TopicDocument>([
  [KB_PORTAL_TOPIC_OVERVIEW, KB_PORTAL_TOPIC_OVERVIEW_PLAIN],
  [KB_PORTAL_TOPIC_ARTICLE_LIST, KB_PORTAL_TOPIC_ARTICLE_LIST_PLAIN],
  [KB_PORTAL_TOPIC_ARTICLES, KB_PORTAL_TOPIC_ARTICLES_PLAIN],
]);

const DOCUMENTS = {
  overview: KB_PORTAL_TOPIC_OVERVIEW,
  'article-list': KB_PORTAL_TOPIC_ARTICLE_LIST,
  articles: KB_PORTAL_TOPIC_ARTICLES,
} as const;

type TopicDocumentKey = keyof typeof DOCUMENTS;

const UNKNOWN_FIELD = /Cannot query field/i;

const isUnknownFieldError = (error: unknown): boolean =>
  errorBodyMatches(error, UNKNOWN_FIELD);

const runTopic = async (
  document: TopicDocument,
  topicId: string,
): Promise<KbTopic | TopicFailure> => {
  const { data, error } = await query<TopicResponse>({
    query: document,
    variables: { topicId },
    errorPolicy: 'all',
  });

  if (error) {
    return { error: error.message, cause: error };
  }

  const topic = data?.cpKnowledgeBaseTopicDetail;

  if (!topic) {
    return {
      error: `No knowledge base topic was found with the ID "${topicId}".`,
    };
  }

  return topic;
};

const readTopic = async (
  document: TopicDocument,
  topicId: string,
): Promise<KbTopic | TopicFailure> => {
  const result = await runTopic(document, topicId);
  const plain = PLAIN_OF.get(document);

  if (!isFailure(result) || !plain || !isUnknownFieldError(result.cause)) {
    return result;
  }

  return runTopic(plain, topicId);
};

const sharedTopic = createSharedCache<KbTopic | TopicFailure>({
  ttlMs: 60_000,
  staleMs: 10 * 60_000,
  maxEntries: 100,
  keep: (value) => !isFailure(value),
  timedOut: () => ({ error: TIMED_OUT }),
});

const fetchTopic = async (
  key: TopicDocumentKey,
  config: PortalConfig,
): Promise<PortalResult<PortalTopic>> => {
  if (!config.knowledgeBaseEnabled) {
    return { state: 'ready', data: emptyTopic(config) };
  }

  try {
    const topic = await sharedTopic(
      [readScopedApiUrl(), config.appToken, config.topicId, key].join('|'),
      () => readTopic(DOCUMENTS[key], config.topicId),
    );

    if (isFailure(topic)) {
      return { state: 'error', message: topic.error };
    }

    return {
      state: 'ready',
      data: normalizeTopic(topic, config, await getT()),
    };
  } catch (caught) {
    return { state: 'error', message: errorMessage(caught) };
  }
};

const cachedTopic = cache(fetchTopic);

const readTopicFor = async (
  key: TopicDocumentKey,
): Promise<PortalResult<PortalTopic>> => {
  const config = await getPortalConfig();

  if (config.state !== 'ready') {
    return config;
  }

  return cachedTopic(key, config.data);
};

export const getTopicOverview = () => readTopicFor('overview');

export const getTopicArticleList = () => readTopicFor('article-list');

export const getTopicWithArticles = () => readTopicFor('articles');

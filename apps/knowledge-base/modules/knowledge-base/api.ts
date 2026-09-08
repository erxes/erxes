import { query } from '@/modules/apollo/apolloClient';
import { readPortalEnv } from '@/modules/apollo/utils/env';
import {
  errorMessage,
  kbGate,
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
import { normalizeTopic, type PortalTopic } from './utils/normalize';
import type { KbTopic } from './types';

type TopicResponse = { cpKnowledgeBaseTopicDetail: KbTopic | null };

type TopicFailure = { error: string; cause?: unknown };

const isFailure = <T>(value: T | TopicFailure): value is TopicFailure =>
  typeof value === 'object' && value !== null && 'error' in value;

type TopicDocument = typeof KB_PORTAL_TOPIC_OVERVIEW;

/** The settings-free twin of each read, used when the gateway rejects the full one. */
const PLAIN_OF = new Map<TopicDocument, TopicDocument>([
  [KB_PORTAL_TOPIC_OVERVIEW, KB_PORTAL_TOPIC_OVERVIEW_PLAIN],
  [KB_PORTAL_TOPIC_ARTICLE_LIST, KB_PORTAL_TOPIC_ARTICLE_LIST_PLAIN],
  [KB_PORTAL_TOPIC_ARTICLES, KB_PORTAL_TOPIC_ARTICLES_PLAIN],
]);

const UNKNOWN_FIELD = /Cannot query field/i;

/*
 * A gateway older than the help center's settings fields rejects the whole
 * document at validation, which would cost the portal its articles as well as
 * the settings. Only that failure is retried without them.
 *
 * Such a rejection arrives as HTTP 400, which Apollo raises as a `ServerError`
 * whose `message` is only the status code; the GraphQL errors stay unparsed in
 * `bodyText`, so the reason is read from there.
 */
const isUnknownFieldError = (error: unknown): boolean => {
  if (UNKNOWN_FIELD.test(errorMessage(error))) {
    return true;
  }

  const { bodyText } = (error ?? {}) as { bodyText?: unknown };

  return typeof bodyText === 'string' && UNKNOWN_FIELD.test(bodyText);
};

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
      error: `«${topicId}» ID-тай мэдлэгийн сангийн сэдэв олдсонгүй.`,
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

const fetchTopic = async (
  document: TopicDocument,
): Promise<PortalResult<PortalTopic>> => {
  const unconfigured = kbGate<PortalTopic>();

  if (unconfigured) {
    return unconfigured;
  }

  const { topicId } = readPortalEnv();

  try {
    const topic = await readTopic(document, topicId);

    if (isFailure(topic)) {
      return { state: 'error', message: topic.error };
    }

    /*
     * A help center may serve another topic's articles. The settings — theme,
     * toggles, ticket target — stay with the configured topic; only the
     * categories and articles come from the one it points at. A self-reference
     * is ignored so the portal cannot ask for the same document twice.
     */
    const sourceId = topic.kbTopicId?.trim();

    if (!sourceId || sourceId === topicId) {
      return { state: 'ready', data: normalizeTopic(topic) };
    }

    const source = await readTopic(document, sourceId);

    if (isFailure(source)) {
      return { state: 'error', message: source.error };
    }

    return {
      state: 'ready',
      data: normalizeTopic({
        ...topic,
        parentCategories: source.parentCategories,
      }),
    };
  } catch (caught) {
    return { state: 'error', message: errorMessage(caught) };
  }
};

const TOPIC_TTL_MS = 60_000;

type TopicPromise = Promise<PortalResult<PortalTopic>>;

const topicCache = new Map<string, { at: number; value: TopicPromise }>();

const cachedTopic = (key: string, document: TopicDocument): TopicPromise => {
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

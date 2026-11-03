import type { ApolloCache } from '@apollo/client';

import {
  AGENTS_THREAD_DETAIL,
  type IAgentsThreadDetailData,
} from '../graphql/threads';

/**
 * Transcripts kept in Apollo's cache for instant session switching. Users
 * flip between a handful of open session tabs; ten covers that working set
 * with room to spare, while one transcript can carry large tool outputs, so
 * keeping every visited thread for the page's lifetime would grow without
 * bound.
 */
export const AGENTS_THREAD_DETAIL_CACHE_LIMIT = 10;

type TAgentsThreadDetail = NonNullable<
  IAgentsThreadDetailData['agentsThreadDetail']
>;

/** Most recently used thread ids per cache, oldest first. */
const recentThreads = new WeakMap<object, string[]>();

/** The thread's complete cached detail, or undefined when Apollo has none. */
export const readCachedThreadDetail = <T>(
  cache: ApolloCache<T>,
  threadId: string,
): TAgentsThreadDetail | undefined => {
  try {
    return (
      cache.readQuery<IAgentsThreadDetailData>({
        query: AGENTS_THREAD_DETAIL,
        variables: { threadId },
      })?.agentsThreadDetail ?? undefined
    );
  } catch {
    return undefined;
  }
};

/**
 * Removes one thread's cached detail: its root field and the normalized
 * messages it references. Nothing else in the app cache is touched, so no
 * global `gc()` runs.
 */
export const evictThreadDetail = <T>(
  cache: ApolloCache<T>,
  threadId: string,
): void => {
  const partial = cache.readQuery<IAgentsThreadDetailData>({
    query: AGENTS_THREAD_DETAIL,
    variables: { threadId },
    returnPartialData: true,
  });
  const messageIds = (partial?.agentsThreadDetail?.messages ?? []).flatMap(
    (message) => (message?.id ? [message.id] : []),
  );

  cache.evict({ fieldName: 'agentsThreadDetail', args: { threadId } });

  for (const id of messageIds) {
    const entity = cache.identify({ __typename: 'AgentsMessage', id });
    if (entity) cache.evict({ id: entity });
  }
};

/**
 * Marks a thread's detail as just used; once more than `limit` threads are
 * tracked, the least recently used ones are evicted.
 */
export const rememberThreadDetail = <T>(
  cache: ApolloCache<T>,
  threadId: string,
  limit = AGENTS_THREAD_DETAIL_CACHE_LIMIT,
): void => {
  const recent = (recentThreads.get(cache) ?? []).filter(
    (id) => id !== threadId,
  );
  recent.push(threadId);

  while (recent.length > limit) {
    const oldest = recent.shift();
    if (oldest) evictThreadDetail(cache, oldest);
  }

  recentThreads.set(cache, recent);
};

import { ApolloClient } from '@apollo/client';
import { MASTRA_THREADS } from '~/graphql/queries';
import { IMastraThread, IMastraThreadsResponse } from '~/modules/chat/types';

type Client = ApolloClient<object>;

// Write helpers for the cached `mastraThreads` list. The session list lives in
// the Apollo cache (house convention); the chat store reconciles it through
// these instead of owning a copied array. Mutations triggered from the UI use
// the dedicated hooks — these cover the store-driven moments (send / stream
// title / turn end) where there is no GraphQL mutation to hang an update on.

const variablesFor = (mastraAgentId: string) => ({ agentId: mastraAgentId });

// Surface a brand-new session in the sidebar the instant the first message is
// sent. Idempotent: skips when the thread is already in the list, so a resend
// can't duplicate it. The streamed `thread_title` event and the turn-end
// refetch reconcile the real title / count / order into the same cached list.
export const prependThreadToCache = (
  client: Client,
  mastraAgentId: string,
  threadId: string,
) => {
  client.cache.updateQuery<IMastraThreadsResponse>(
    { query: MASTRA_THREADS, variables: variablesFor(mastraAgentId) },
    (prev) => {
      const list = prev?.mastraThreads ?? [];
      if (list.some((t) => t.threadId === threadId)) return prev ?? undefined;
      const optimistic: IMastraThread = {
        __typename: 'MastraThread',
        _id: threadId,
        threadId,
        title: 'New chat',
        messageCount: 0,
        lastMessageAt: null,
        createdAt: null,
      };
      return { mastraThreads: [optimistic, ...list] };
    },
  );
};

// Local title update for the server-pushed `thread_title` stream event (the
// server already persisted it — this only mirrors it into the cached list).
export const setThreadTitleInCache = (
  client: Client,
  mastraAgentId: string,
  threadId: string,
  title: string,
) => {
  client.cache.updateQuery<IMastraThreadsResponse>(
    { query: MASTRA_THREADS, variables: variablesFor(mastraAgentId) },
    (prev) => {
      if (!prev) return prev ?? undefined;
      return {
        mastraThreads: prev.mastraThreads.map((t) =>
          t.threadId === threadId ? { ...t, title } : t,
        ),
      };
    },
  );
};

// Reconcile the cached list against the server after a turn finishes: title,
// message count, ordering, and the real `_id` for the just-created thread.
// Apollo MERGES the network result into the cached query — it never clobbers a
// separate array — so an optimistic entry already present cannot vanish.
export const refetchThreadsIntoCache = async (
  client: Client,
  mastraAgentId: string,
) => {
  try {
    await client.query<IMastraThreadsResponse>({
      query: MASTRA_THREADS,
      variables: variablesFor(mastraAgentId),
      fetchPolicy: 'network-only',
    });
  } catch {
    // best-effort — the optimistic list stays until the next successful read
  }
};

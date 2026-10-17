import { useQuery } from '@apollo/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePermissionCheck } from 'ui-modules';

import {
  AGENTS_PINNED_THREADS,
  AGENTS_THREADS,
  AGENTS_THREADS_CHANGED,
} from '../graphql/threads';
import type { IAgentsThreadsData } from '../graphql/threads';
import type { IAgentsThread } from '../types';

const AGENTS_ACCESS_REQUIRED =
  'You need Agents access. Ask an administrator to assign an Agents-enabled group.';

const PAGE_SIZE = 20;

export interface IUseAgentsThreadsResult {
  threads: IAgentsThread[];
  /** Pinned threads — always full set (perPage 100), pinned group first. */
  pinnedThreads: IAgentsThread[];
  loading: boolean;
  error: string | undefined;
  /** True while a subsequent page is in flight. */
  loadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => Promise<void>;
}

/**
 * Loads the acting user's agents threads page by page. The
 * `agentsThreadsChanged` subscription is used purely as a refetch signal:
 * whenever a chat turn is persisted or a thread title is generated
 * server-side, a debounced refetch keeps the list fresh without any manual
 * refresh. The refetch asks for every already-loaded thread in one request
 * so pagination state is preserved.
 */
export const useAgentsThreads = (): IUseAgentsThreadsResult => {
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canViewThreads = isLoaded && hasActionPermission('showAgents');
  const refetchTimer = useRef<ReturnType<typeof setTimeout>>();
  // Pages loaded so far: a refetch re-requests that many threads as one
  // page, so `result.page` is always 1 and cannot drive pagination.
  const loadedPagesRef = useRef(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error, refetch, fetchMore, subscribeToMore } =
    useQuery<IAgentsThreadsData>(AGENTS_THREADS, {
      variables: { page: 1, perPage: PAGE_SIZE },
      skip: !canViewThreads,
    });

  const { data: pinnedData, refetch: refetchPinned } =
    useQuery<IAgentsThreadsData>(AGENTS_PINNED_THREADS, {
      skip: !canViewThreads,
    });

  // The server remains authoritative if the client's permissions are stale.
  const permissionDenied = error?.graphQLErrors.some(
    (graphQLError) =>
      graphQLError.extensions?.code === 'FORBIDDEN' ||
      graphQLError.message === 'Permission required',
  );

  const handleRefetch = useCallback(async () => {
    if (!canViewThreads) {
      return;
    }

    await Promise.all([
      refetch({
        page: 1,
        perPage: Math.max(loadedPagesRef.current * PAGE_SIZE, PAGE_SIZE),
      }),
      refetchPinned(),
    ]);
  }, [canViewThreads, refetch, refetchPinned]);

  useEffect(() => {
    if (!canViewThreads || permissionDenied) {
      return;
    }

    const unsubscribeMain = subscribeToMore({
      document: AGENTS_THREADS_CHANGED,
      updateQuery: (prev, { subscriptionData }) => {
        if (subscriptionData.data) {
          if (refetchTimer.current) {
            clearTimeout(refetchTimer.current);
          }

          refetchTimer.current = setTimeout(() => {
            void handleRefetch().catch(() => {
              // Apollo exposes the failure through the list's error state.
            });
          }, 500);
        }

        return prev;
      },
    });

    return () => {
      if (refetchTimer.current) {
        clearTimeout(refetchTimer.current);
      }

      unsubscribeMain();
    };
  }, [canViewThreads, permissionDenied, handleRefetch, subscribeToMore]);

  const result = data?.agentsThreads;
  const hasMore = Boolean(result?.hasMore);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) {
      return;
    }

    const nextPage = loadedPagesRef.current + 1;
    setLoadingMore(true);
    void fetchMore({
      variables: { page: nextPage, perPage: PAGE_SIZE },
      updateQuery: (prev, { fetchMoreResult }) => {
        const previous = prev?.agentsThreads;
        const next = fetchMoreResult?.agentsThreads;

        if (!next) {
          return prev;
        }

        const seen = new Set(
          (previous?.threads ?? []).map((thread) => thread.id),
        );

        return {
          agentsThreads: {
            ...next,
            threads: [
              ...(previous?.threads ?? []),
              ...next.threads.filter((thread) => !seen.has(thread.id)),
            ],
          },
        };
      },
    })
      .then(() => {
        loadedPagesRef.current = nextPage;
      })
      .catch(() => {
        // The list keeps its loaded page; the error surfaces on next load.
      })
      .finally(() => setLoadingMore(false));
  }, [fetchMore, hasMore, loadingMore]);

  // Defensive client-side filter: only `pinned === true` ever lands in the
  // pinned group, whatever the server returned.
  const pinnedThreads =
    canViewThreads && !permissionDenied
      ? pinnedData?.agentsThreads?.threads.filter(
          (thread) => thread.pinned === true,
        )
      : undefined;
  const pinnedIds = new Set(
    (pinnedThreads ?? []).map((thread) => thread.id),
  );
  const threads = canViewThreads && !permissionDenied
    ? result?.threads?.filter((thread) => !pinnedIds.has(thread.id))
    : undefined;
  const errorMessage = !isLoaded
    ? undefined
    : !canViewThreads || permissionDenied
      ? AGENTS_ACCESS_REQUIRED
      : error?.message;
  const isLoading = !isLoaded || (canViewThreads && loading);

  // The chat surfaces re-render on every streamed delta; a memoized result
  // keeps the `threadsState` identity stable so the memoized `ThreadList`
  // can skip those renders.
  return useMemo<IUseAgentsThreadsResult>(
    () => ({
      threads: threads ?? [],
      pinnedThreads: pinnedThreads ?? [],
      loading: isLoading,
      error: errorMessage,
      loadingMore,
      hasMore,
      loadMore,
      refetch: handleRefetch,
    }),
    [
      threads,
      pinnedThreads,
      isLoading,
      errorMessage,
      loadingMore,
      hasMore,
      loadMore,
      handleRefetch,
    ],
  );
};

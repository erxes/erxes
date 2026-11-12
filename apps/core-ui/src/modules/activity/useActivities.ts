import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { messageOf, orpc } from '~/lib/api';
import { useLivePolling } from '~/lib/live';

export type TimelineKind = 'all' | 'notes' | 'changes' | 'plugins';

export interface TimelineFilters {
  kind?: TimelineKind;
  includeRelated?: boolean;
  q?: string;
  actorId?: string;
  source?: string;
}

/**
 * A customer's or company's timeline, newest first, 20 at a time. Live
 * updates refetch it when it changes; it polls only while they're paused.
 */
export const useActivities = (
  targetType: string,
  targetId: string,
  filters: TimelineFilters = {},
) => {
  const { kind = 'all', includeRelated = false, q, actorId, source } = filters;
  const refetchInterval = useLivePolling();

  const query = useInfiniteQuery(
    orpc.activities.list.infiniteOptions({
      input: (cursor: string | undefined) => ({
        targetType,
        targetId,
        kind,
        q: q || undefined,
        actorId: actorId || undefined,
        source: source || undefined,
        includeRelated: includeRelated ? 'true' : undefined,
        limit: 20,
        cursor,
        direction: 'forward',
        cursorMode: 'exclusive',
      }),
      initialPageParam: undefined,
      getNextPageParam: (last) =>
        last.pageInfo.hasNextPage ? (last.pageInfo.endCursor ?? undefined) : undefined,
      refetchInterval,
      // Live updates refetch what changed; reopening the tab shows what is there at once.
      staleTime: 30_000,
      // Changing a filter keeps the current entries (dimmed) until the new ones arrive.
      placeholderData: (previous) => previous,
    }),
  );

  return {
    activities: query.data?.pages.flatMap((page) => page.data) ?? [],
    loading: query.isPending,
    error: query.error,
    retry: () => void query.refetch(),
    /** Showing older results while a filter's arrive. */
    updating: query.isPlaceholderData,
    hasMore: query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
  };
};

/** Pinned notes, shown above the timeline. */
export const usePinnedNotes = (targetType: string, targetId: string) =>
  useQuery(
    orpc.activities.list.queryOptions({
      input: { targetType, targetId, pinned: 'true', kind: 'notes', limit: 20 },
      select: (page) => page.data,
      staleTime: 30_000,
    }),
  );

export const useNoteActions = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  const handlers = {
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.activities.key() }),
    onError: (error: Error) =>
      toast({
        variant: 'destructive',
        title: 'Could not save the note',
        description: messageOf(error),
      }),
  };

  return {
    add: useMutation(orpc.activities.addNote.mutationOptions(handlers)),
    update: useMutation(orpc.activities.updateNote.mutationOptions(handlers)),
    remove: useMutation(orpc.activities.removeNote.mutationOptions(handlers)),
    react: useMutation(orpc.activities.react.mutationOptions(handlers)),
  };
};

/** Entry types (plugins' labels, icons, colours) and plugin record timelines. */
export const useActivityTypes = () =>
  useQuery(orpc.activities.types.queryOptions({ staleTime: 5 * 60_000 }));

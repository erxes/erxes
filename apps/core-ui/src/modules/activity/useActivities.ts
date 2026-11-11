import type { ActivityTarget } from '@erxes/core-contract';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { api, messageOf } from '~/lib/api';
import { useLivePolling } from '~/lib/live';

const ACTIVITIES_KEY = ['activities'];

export type TimelineKind = 'all' | 'notes' | 'changes' | 'plugins';

/**
 * A customer's or company's timeline, newest first, 20 at a time. Live
 * updates refetch it when it changes; it polls only while they're paused.
 */
export const useActivities = (
  targetType: ActivityTarget,
  targetId: string,
  { kind = 'all', includeRelated = false }: { kind?: TimelineKind; includeRelated?: boolean } = {},
) => {
  const refetchInterval = useLivePolling();

  const query = useInfiniteQuery({
    queryKey: [...ACTIVITIES_KEY, targetType, targetId, { kind, includeRelated }],
    queryFn: ({ pageParam }) =>
      api.activities.list({
        targetType,
        targetId,
        kind,
        includeRelated: includeRelated ? 'true' : undefined,
        limit: 20,
        cursor: pageParam,
        direction: 'forward',
        cursorMode: 'exclusive',
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pageInfo.hasNextPage ? (last.pageInfo.endCursor ?? undefined) : undefined,
    refetchInterval,
  });

  return {
    activities: query.data?.pages.flatMap((page) => page.data) ?? [],
    loading: query.isPending,
    hasMore: query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
  };
};

/** Pinned notes, shown above the timeline. */
export const usePinnedNotes = (targetType: ActivityTarget, targetId: string) =>
  useQuery({
    queryKey: [...ACTIVITIES_KEY, targetType, targetId, 'pinned'],
    queryFn: () =>
      api.activities.list({ targetType, targetId, pinned: 'true', kind: 'notes', limit: 20 }),
    select: (page) => page.data,
  });

export const useNoteActions = () => {
  const client = useQueryClient();
  const { toast } = useToast();
  const refresh = () => client.invalidateQueries({ queryKey: ACTIVITIES_KEY });

  const onError = (error: unknown) =>
    toast({
      variant: 'destructive',
      title: 'Could not save the note',
      description: messageOf(error),
    });

  return {
    add: useMutation({
      mutationFn: (input: Parameters<typeof api.activities.addNote>[0]) =>
        api.activities.addNote(input),
      onSuccess: refresh,
      onError,
    }),
    update: useMutation({
      mutationFn: (input: Parameters<typeof api.activities.updateNote>[0]) =>
        api.activities.updateNote(input),
      onSuccess: refresh,
      onError,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api.activities.removeNote({ id }),
      onSuccess: refresh,
      onError,
    }),
  };
};

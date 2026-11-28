import type { Activity, PageInfo, StreamTopic } from '@erxes/core-contract';
import {
  type InfiniteData,
  type UseInfiniteQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { firstPageOnReturn } from '~/lib/cursorList';
import { liveOptions } from '~/lib/live';

/**
 * The cursor after a timeline page. A timeline nothing shows keeps only its first page, so
 * opening a record again refetches 20 entries, not every page read before.
 */
const nextTimelinePage = firstPageOnReturn((last: { pageInfo: PageInfo }) =>
  last.pageInfo.hasNextPage ? (last.pageInfo.endCursor ?? undefined) : undefined,
);

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
      getNextPageParam: nextTimelinePage,
      ...pageOptions([`timeline:${targetType}:${targetId}`]),
    }),
  );

  return entryPages(query);
};

/**
 * What a team member did, across the timelines this member may read: newest first, 20 at a
 * time, refreshed as `useActivities` is.
 */
export const useMemberActivities = (
  actorId: string,
  filters: Pick<TimelineFilters, 'kind' | 'q' | 'source'> = {},
) => {
  const { kind = 'all', q, source } = filters;

  const query = useInfiniteQuery(
    orpc.activities.byMember.infiniteOptions({
      input: (cursor: string | undefined) => ({
        actorId,
        kind,
        q: q || undefined,
        source: source || undefined,
        limit: 20,
        cursor,
        direction: 'forward',
        cursorMode: 'exclusive',
      }),
      initialPageParam: undefined,
      getNextPageParam: nextTimelinePage,
      ...pageOptions([]),
    }),
  );

  return entryPages(query);
};

/** How a timeline's pages refresh. */
const pageOptions = (topics: readonly StreamTopic[]) => ({
  ...liveOptions(topics),
  // Live updates refetch what changed; reopening the tab shows what is there at once.
  staleTime: 30_000,
  // Changing a filter keeps the current entries (dimmed) until the new ones arrive.
  placeholderData: <T>(previous: T) => previous,
});

/** A timeline's pages as the timeline shows them. */
const entryPages = (query: UseInfiniteQueryResult<InfiniteData<{ data: Activity[] }>>) => ({
  activities: query.data?.pages.flatMap((page) => page.data) ?? [],
  loading: query.isPending,
  error: query.error,
  retry: () => void query.refetch(),
  /** Showing older results while a filter's arrive. */
  updating: query.isPlaceholderData,
  hasMore: query.hasNextPage,
  loadingMore: query.isFetchingNextPage,
  loadMore: () => void query.fetchNextPage(),
});

export type TimelinePages = ReturnType<typeof entryPages>;

/** Pinned notes, shown above the timeline. */
export const usePinnedNotes = (targetType: string, targetId: string) =>
  useQuery(
    orpc.activities.list.queryOptions({
      input: { targetType, targetId, pinned: 'true', kind: 'notes', limit: 20 },
      select: (page) => page.data,
      staleTime: 30_000,
      ...liveOptions([`timeline:${targetType}:${targetId}`], false),
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
    edit: useMutation(orpc.activities.editNote.mutationOptions(handlers)),
    pin: useMutation(orpc.activities.pinNote.mutationOptions(handlers)),
    remove: useMutation(orpc.activities.removeNote.mutationOptions(handlers)),
    react: useMutation(orpc.activities.react.mutationOptions(handlers)),
  };
};

/** Entry types (plugins' labels, icons, colours) and plugin record timelines. */
export const useActivityTypes = () =>
  useQuery(orpc.activities.types.queryOptions({ staleTime: 5 * 60_000 }));

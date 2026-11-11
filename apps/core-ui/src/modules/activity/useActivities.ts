import type { ActivityTarget } from '@erxes/core-contract';
import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '~/lib/api';

export const ACTIVITIES_KEY = ['activities'];

/** A customer's or company's timeline, newest first, 20 at a time. */
export const useActivities = (targetType: ActivityTarget, targetId: string) => {
  const query = useInfiniteQuery({
    queryKey: [...ACTIVITIES_KEY, targetType, targetId],
    queryFn: ({ pageParam }) =>
      api.activities.list({
        targetType,
        targetId,
        limit: 20,
        cursor: pageParam,
        direction: 'forward',
        cursorMode: 'exclusive',
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? (last.pageInfo.endCursor ?? undefined) : undefined),
  });

  return {
    activities: query.data?.pages.flatMap((page) => page.data) ?? [],
    loading: query.isPending,
    hasMore: query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
  };
};

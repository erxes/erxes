import type { Notification } from '@erxes/core-contract';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { api, messageOf } from '~/lib/api';

export const NOTIFICATIONS_KEY = ['notifications'];

/**
 * Unread notifications. Core's database may sit behind a pooler where live
 * push isn't possible, so the count refreshes every 30 seconds and whenever
 * the window regains focus.
 */
export const useUnreadCount = () => {
  const query = useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'unread-count'],
    queryFn: () => api.notifications.unreadCount(),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  return query.data?.count ?? 0;
};

export const useNotificationList = ({ unread, enabled = true }: { unread: boolean; enabled?: boolean }) => {
  const query = useInfiniteQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'list', { unread }],
    queryFn: ({ pageParam }) =>
      api.notifications.list({
        limit: 20,
        cursor: pageParam,
        direction: 'forward',
        cursorMode: 'exclusive',
        unread: unread ? 'true' : undefined,
      } as Parameters<typeof api.notifications.list>[0]),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? (last.pageInfo.endCursor ?? undefined) : undefined),
    enabled,
    refetchInterval: 30_000,
  });

  return {
    notifications: query.data?.pages.flatMap((page) => page.data) ?? [],
    loading: query.isPending,
    hasMore: query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
  };
};

export const useNotificationActions = () => {
  const client = useQueryClient();
  const { toast } = useToast();
  const refresh = () => client.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
  const onError = (error: unknown) =>
    toast({ variant: 'destructive', title: 'Could not update notifications', description: messageOf(error) });

  const markRead = useMutation({
    mutationFn: (input: { ids?: string[]; read?: boolean }) => api.notifications.markRead({ read: true, ...input }),
    onSuccess: refresh,
    onError,
  });
  const remove = useMutation({
    mutationFn: (notification: Notification) => api.notifications.remove({ id: notification.id }),
    onSuccess: refresh,
    onError,
  });

  return { markRead, remove };
};

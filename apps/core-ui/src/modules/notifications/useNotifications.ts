import type { Notification } from '@erxes/core-contract';
import { IconPuzzle, type Icon } from '@tabler/icons-react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import type { ComponentType } from 'react';
import { api, messageOf } from '~/lib/api';
import { useLivePolling } from '~/lib/live';
import { pluginLabel } from '~/lib/members';
import { OrgLogoIcon } from '~/modules/auth/components/Logo';
import { usePlugins } from '~/modules/plugins/usePlugins';

export const NOTIFICATIONS_KEY = ['notifications'];

/** `core` is erxes' own inbox; every plugin has one under its name. */
export const CORE_INBOX = 'core';

/**
 * Unread notifications, in total and per inbox. Core's database may sit behind
 * a pooler where live push isn't possible, so counts refresh every 30 seconds
 * and whenever the window regains focus.
 */
export const useUnreadCounts = () => {
  const refetchInterval = useLivePolling();
  const query = useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'unread-count'],
    queryFn: () => api.notifications.unreadCount({}),
    refetchInterval,
    refetchOnWindowFocus: true,
  });

  return { count: query.data?.count ?? 0, bySource: query.data?.bySource ?? {} };
};

export interface NotificationFilters {
  /** One inbox, or all of them. */
  source?: string;
  unread: boolean;
  important?: boolean;
}

export const useNotificationList = ({ source, unread, important, enabled = true }: NotificationFilters & { enabled?: boolean }) => {
  const refetchInterval = useLivePolling();
  const query = useInfiniteQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'list', { source: source ?? null, unread, important: Boolean(important) }],
    queryFn: ({ pageParam }) =>
      api.notifications.list({
        limit: 20,
        cursor: pageParam,
        direction: 'forward',
        cursorMode: 'exclusive',
        unread: unread ? 'true' : undefined,
        source,
        priority: important ? 'high' : undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? (last.pageInfo.endCursor ?? undefined) : undefined),
    enabled,
    refetchInterval,
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
    mutationFn: (input: { ids?: string[]; source?: string; read?: boolean }) =>
      api.notifications.markRead({ read: true, ...input }),
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

const SETTINGS_KEY = [...NOTIFICATIONS_KEY, 'settings'];

export const useNotificationSettings = () => {
  const client = useQueryClient();
  const { toast } = useToast();
  const query = useQuery({ queryKey: SETTINGS_KEY, queryFn: () => api.notifications.settings(), staleTime: 60_000 });
  const update = useMutation({
    mutationFn: (muted: string[]) => api.notifications.updateSettings({ muted }),
    onSuccess: (settings) => client.setQueryData(SETTINGS_KEY, settings),
    onError: (error) =>
      toast({ variant: 'destructive', title: 'Could not save notification settings', description: messageOf(error) }),
  });

  return { settings: query.data, loading: query.isPending, update };
};

export interface Inbox {
  source: string;
  label: string;
  icon: Icon | ComponentType<{ className?: string }>;
  /** The plugin's app path, when its UI is loaded. */
  path?: string;
}

/** A plugin's UI config by the name it notifies under (`hr` ↔ remote `hr_ui`). */
const configFor = (plugins: ReturnType<typeof usePlugins>['plugins'], source: string) =>
  plugins.find(
    (plugin) =>
      plugin.config.name.toLowerCase() === source ||
      plugin.remote.replace(/_ui$/, '').toLowerCase() === source ||
      plugin.config.path.replace(/^\/+|\/+$/g, '').toLowerCase() === source,
  )?.config;

/**
 * Every inbox the member has, like Atlassian's per-product inboxes: erxes'
 * own first, then each plugin that notified them (or that they muted).
 */
export const useInboxes = (): Inbox[] => {
  const { plugins } = usePlugins();
  const { settings } = useNotificationSettings();
  const { bySource } = useUnreadCounts();
  const sources = [...new Set([...(settings?.sources ?? []), ...Object.keys(bySource)])]
    .filter((source) => source !== CORE_INBOX)
    .sort();

  return [
    { source: CORE_INBOX, label: 'erxes', icon: OrgLogoIcon },
    ...sources.map((source) => {
      const config = configFor(plugins, source);

      return {
        source,
        label: config?.name && config.name.toLowerCase() !== source ? config.name : pluginLabel(source),
        icon: config?.icon ?? IconPuzzle,
        path: config?.path,
      };
    }),
  ];
};

import { IconPuzzle, type Icon } from '@tabler/icons-react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import type { ComponentType } from 'react';
import { messageOf, orpc } from '~/lib/api';
import { forwardPaging } from '~/lib/cursorList';
import { useLivePolling } from '~/lib/live';
import { pluginLabel } from '~/lib/members';
import { OrgLogoIcon } from '~/modules/auth/components/Logo';
import { usePlugins } from '~/modules/plugins/usePlugins';

/** `core` is erxes' own inbox; every plugin has one under its name. */
export const CORE_INBOX = 'core';

/**
 * Unread notifications, in total and per inbox. Core's database may sit behind
 * a pooler where live push isn't possible, so counts refresh every 30 seconds
 * and whenever the window regains focus.
 */
export const useUnreadCounts = () => {
  const refetchInterval = useLivePolling();

  const query = useQuery(
    orpc.notifications.unreadCount.queryOptions({
      input: {},
      refetchInterval,
      refetchOnWindowFocus: true,
    }),
  );

  return { count: query.data?.count ?? 0, bySource: query.data?.bySource ?? {} };
};

export interface NotificationFilters {
  /** One inbox, or all of them. */
  source?: string;
  unread: boolean;
  important?: boolean;
}

export const useNotificationList = ({
  source,
  unread,
  important,
  enabled = true,
}: NotificationFilters & { enabled?: boolean }) => {
  const refetchInterval = useLivePolling();

  const query = useInfiniteQuery(
    orpc.notifications.list.infiniteOptions({
      input: (page) => ({
        ...page,
        unread: unread ? 'true' : undefined,
        source,
        priority: important ? 'high' : undefined,
      }),
      ...forwardPaging(20),
      enabled,
      refetchInterval,
    }),
  );

  return {
    notifications: query.data?.pages.flatMap((page) => page.data) ?? [],
    loading: query.isPending,
    error: query.error,
    hasMore: query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
    loadMore: () => void query.fetchNextPage(),
  };
};

export const useNotificationActions = () => {
  const client = useQueryClient();
  const { toast } = useToast();

  const handlers = {
    onSuccess: () => client.invalidateQueries({ queryKey: orpc.notifications.key() }),
    onError: (error: Error) =>
      toast({
        variant: 'destructive',
        title: 'Could not update notifications',
        description: messageOf(error),
      }),
  };

  return {
    markRead: useMutation(orpc.notifications.markRead.mutationOptions(handlers)),
    remove: useMutation(orpc.notifications.remove.mutationOptions(handlers)),
  };
};

const notificationSettingsQuery = () =>
  orpc.notifications.settings.queryOptions({ staleTime: 60_000 });

export const useNotificationSettings = () => {
  const client = useQueryClient();
  const { toast } = useToast();
  const query = useQuery(notificationSettingsQuery());

  const update = useMutation(
    orpc.notifications.updateSettings.mutationOptions({
      onSuccess: (settings) => client.setQueryData(notificationSettingsQuery().queryKey, settings),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: 'Could not save notification settings',
          description: messageOf(error),
        }),
    }),
  );

  return { settings: query.data, loading: query.isPending, error: query.error, update };
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

  const sources = [
    ...new Set([
      ...(settings?.groups ?? []).filter((group) => group.plugin).map((group) => group.key),
      ...Object.keys(bySource),
    ]),
  ]
    .filter((source) => source !== CORE_INBOX)
    .sort();

  return [
    { source: CORE_INBOX, label: 'erxes', icon: OrgLogoIcon },
    ...sources.map((source) => {
      const config = configFor(plugins, source);

      return {
        source,
        label:
          config?.name && config.name.toLowerCase() !== source ? config.name : pluginLabel(source),
        icon: config?.icon ?? IconPuzzle,
        path: config?.path,
      };
    }),
  ];
};

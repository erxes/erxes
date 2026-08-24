import {
  Button,
  Collapsible,
  IconComponent,
  NavigationMenuGroup,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  cn,
  useMultiQueryState,
} from 'erxes-ui';
import {
  IconCaretRightFilled,
  IconCheck,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';
import type { IUser } from 'ui-modules';

import { ChannelScope, IChannel } from '@/channels/types';
import { channelScopeOf } from '@/channels/utils/channelScope';
import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { useGetMyChannels } from '@/channels/hooks/useGetMyChannels';
import { CreateChannel } from '@/channels/components/settings/channels-list/CreateChannel';
import type { IIntegration } from '@/integrations/types/Integration';
import { useIntegrations } from '@/integrations/hooks/useIntegrations';
import { useConversationCountsByIntegration } from '@/inbox/conversations/hooks/useConversationCounts';
import { useChannelUnreadUpdates } from '@/inbox/channel/hooks/useChannelUnreadUpdates';
import { NavigationGroupActions } from '@/NavigationGroupActions';
import { InboxIntegrationItem } from '@/inbox/channel/components/InboxIntegrationItem';
import {
  CLEARED_INBOX_NAVIGATION_FILTERS,
  INBOX_NAVIGATION_FILTER_KEYS,
  TInboxNavigationFilters,
} from '@/inbox/types/InboxNavigation';

/**
 * The "Team inbox" group: every team channel this user belongs to, each one
 * collapsible over the actual inboxes and mailboxes connected to it. Channels
 * carry their unread count, order follows the name order the API returns, and
 * channels with nothing waiting fold behind a single "quiet teams" row.
 */
export const TeamChannelsNav = () => {
  const { t } = useTranslation('frontline');
  const { channels, loading } = useGetMyChannels();
  const [showQuiet, setShowQuiet] = useState(false);

  // An incoming customer message changes an unread count, so the badges follow
  // the inbox live instead of waiting for a navigation.
  useChannelUnreadUpdates();
  const [{ channelId }] = useMultiQueryState<{ channelId: string }>([
    'channelId',
  ]);

  const teamChannels = useMemo(
    () =>
      (channels ?? []).filter(
        (channel) => channelScopeOf(channel) === ChannelScope.TEAM,
      ),
    [channels],
  );

  const { members } = useGetChannelMembers({
    channelIds: teamChannels.map((channel) => channel._id),
  });

  const membersByChannel = useMemo(() => {
    const grouped = new Map<string, IUser[]>();
    for (const { channelId: id, member } of members ?? []) {
      if (!member) continue;
      grouped.set(id, [...(grouped.get(id) ?? []), member]);
    }
    return grouped;
  }, [members]);

  const busyChannels = teamChannels.filter(
    (channel) =>
      (channel.unreadConversationCount || 0) > 0 || channel._id === channelId,
  );
  const quietChannels = teamChannels.filter(
    (channel) => !busyChannels.includes(channel),
  );
  // Folding every channel away would leave an empty group, so a fully quiet
  // team inbox stays fully expanded.
  const foldQuiet = busyChannels.length > 0 && quietChannels.length > 0;
  const visibleChannels = foldQuiet
    ? [...busyChannels, ...(showQuiet ? quietChannels : [])]
    : teamChannels;

  const renderContent = () => {
    if (loading && !channels) {
      return (
        <div className="flex flex-col gap-1">
          <Skeleton className="w-32 h-4 mt-1" />
          <Skeleton className="w-36 h-4 mt-1" />
          <Skeleton className="w-32 h-4 mt-1" />
        </div>
      );
    }

    if (!teamChannels.length) {
      return (
        <div className="text-sm text-accent-foreground ml-3 my-4">
          {t('no-channels-found')}
        </div>
      );
    }

    return (
      <>
        {visibleChannels.map((channel) => (
          <TeamChannelItem
            key={channel._id}
            channel={channel}
            members={membersByChannel.get(channel._id) ?? []}
            unreadCount={channel.unreadConversationCount || 0}
            defaultOpen={channelId === channel._id}
          />
        ))}
        {foldQuiet && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 pl-2 font-medium text-muted-foreground"
            onClick={() => setShowQuiet((prev) => !prev)}
          >
            {showQuiet ? (
              <IconMinus className="size-4 shrink-0" />
            ) : (
              <IconPlus className="size-4 shrink-0" />
            )}
            <TextOverflowTooltip
              className="flex-1 min-w-0"
              value={
                showQuiet
                  ? t('hide-quiet-teams')
                  : t('quiet-teams', { count: quietChannels.length })
              }
            />
          </Button>
        )}
      </>
    );
  };

  return (
    <NavigationMenuGroup
      name={t('team-inbox')}
      separate={false}
      actions={
        <NavigationGroupActions>
          <CreateChannel isIconOnly />
        </NavigationGroupActions>
      }
    >
      {renderContent()}
    </NavigationMenuGroup>
  );
};

const TeamChannelItem = ({
  channel,
  members,
  unreadCount,
  defaultOpen,
}: {
  channel: IChannel;
  members: IUser[];
  unreadCount: number;
  defaultOpen: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(defaultOpen);
  const [{ brandId, channelId }, setFilters] =
    useMultiQueryState<TInboxNavigationFilters>(INBOX_NAVIGATION_FILTER_KEYS);

  // Only the expanded channels cost a request; collapsed ones stay silent.
  const { integrations, loading, error, counts, awaitingCounts } =
    useChannelIntegrations({ channelId: channel._id, skip: !open });

  const isActive = channelId === channel._id;

  const handleSelectChannel = () => {
    setFilters({
      ...CLEARED_INBOX_NAVIGATION_FILTERS,
      brandId,
      channelId: isActive ? null : channel._id,
    });
    setOpen(!isActive);
  };

  return (
    <Collapsible className="group/channel" open={open} onOpenChange={setOpen}>
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          'w-full min-w-0 justify-start gap-2 overflow-hidden px-2 text-left',
          unreadCount === 0 && !isActive && 'text-muted-foreground',
        )}
        onClick={handleSelectChannel}
        aria-expanded={open}
      >
        <IconCaretRightFilled className="size-3 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/channel:rotate-90" />
        {isActive ? (
          <IconCheck className="size-3.5 shrink-0" />
        ) : (
          <IconComponent
            name={channel.icon}
            className="size-3.5 text-accent-foreground shrink-0"
          />
        )}
        <TextOverflowTooltip
          className="flex-1 min-w-0 font-semibold"
          value={channel.name}
        />
        {open && members.length > 0 && (
          <MembersInline.Provider members={members} size="sm">
            <MembersInline.Avatar size="sm" />
          </MembersInline.Provider>
        )}
        {unreadCount > 0 && (
          <span
            className={cn(
              'min-w-5 shrink-0 rounded-sm px-1 text-center text-xs tabular-nums',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground',
            )}
          >
            {unreadCount}
          </span>
        )}
      </Button>
      <Collapsible.Content>
        <Sidebar.Menu>
          {loading && !integrations.length && (
            <Skeleton className="w-28 h-4 ml-8 my-1" />
          )}
          {!loading && error && (
            <div className="ml-8 my-2 text-xs text-destructive">
              {t('error')}
            </div>
          )}
          {!loading && !error && !integrations.length && (
            <div className="text-sm text-accent-foreground ml-8 my-2">
              {t('no-integration-found')}
            </div>
          )}
          {integrations.map((integration) => (
            <InboxIntegrationItem
              key={integration._id}
              {...integration}
              count={counts[integration._id] || 0}
              awaitingCount={awaitingCounts[integration._id] || 0}
            />
          ))}
        </Sidebar.Menu>
      </Collapsible.Content>
    </Collapsible>
  );
};

const useChannelIntegrations = ({
  channelId,
  skip,
}: {
  channelId: string;
  skip: boolean;
}): {
  integrations: IIntegration[];
  loading: boolean;
  error?: Error;
  counts: Record<string, number>;
  awaitingCounts: Record<string, number>;
} => {
  const {
    integrations = [],
    loading,
    error,
  } = useIntegrations({
    variables: { channelId, limit: 100 },
    skip,
    fetchPolicy: 'cache-and-network',
  });
  const { counts, awaitingCounts } = useConversationCountsByIntegration({
    channelId,
    skip,
  });

  return {
    integrations: integrations.filter(
      (integration) => integration.isActive !== false,
    ),
    loading,
    error,
    counts,
    awaitingCounts,
  };
};

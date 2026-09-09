import {
  Button,
  IconComponent,
  NavigationMenuGroup,
  Skeleton,
  TextOverflowTooltip,
  useMultiQueryState,
} from 'erxes-ui';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IUser } from 'ui-modules';

import { ChannelScope, IChannel } from '@/channels/types';
import { channelScopeOf } from '@/channels/utils/channelScope';
import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { useGetMyChannels } from '@/channels/hooks/useGetMyChannels';
import { CreateChannel } from '@/channels/components/settings/channels-list/CreateChannel';
import { IntegrationTypeItem } from '@/integrations/components/ChooseIntegrationType';
import type { IIntegrationType } from '@/integrations/types/Integration';
import { useUsedIntegrationTypesByChannel } from '@/integrations/hooks/useUsedIntegrationTypes';
import {
  TConversationCounts,
  useAwaitingCountsByIntegrationType,
} from '@/inbox/conversations/hooks/useConversationCounts';
import { useChannelUnreadUpdates } from '@/inbox/channel/hooks/useChannelUnreadUpdates';
import { ChannelNavItem } from '@/inbox/channel/components/ChannelNavItem';
import { ChannelPollNavItem } from '@/poll/components/ChannelPollNavItem';
import {
  INBOX_TARGET_KEYS,
  InboxTarget,
} from '@/inbox/conversations/constants/inboxTarget';
import { NavigationGroupActions } from '@/NavigationGroupActions';

/**
 * The "Team inbox" group: every team channel this user belongs to, each one
 * collapsible over the integration types in use inside it. Channels carry their
 * unread count, order follows the name order the API returns, and channels with
 * nothing waiting fold away behind a single "quiet teams" row.
 */
export const TeamChannelsNav = () => {
  const { t } = useTranslation('frontline');
  const { channels, loading, refetch } = useGetMyChannels();
  const [showQuiet, setShowQuiet] = useState(false);

  // An incoming customer message changes an unread count, so the badges follow
  // the inbox live instead of waiting for a navigation.
  useChannelUnreadUpdates(refetch);
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
  const [{ channelId }, setFilters] =
    useMultiQueryState<InboxTarget>(INBOX_TARGET_KEYS);

  // Only the expanded channels cost a request; collapsed ones stay silent.
  const { integrationTypes, loading, awaitingCounts } =
    useChannelIntegrationTypes({ channelId: channel._id, skip: !open });

  const isActive = channelId === channel._id;

  const handleSelectChannel = () => {
    setFilters({
      channelId: isActive ? null : channel._id,
      integrationId: null,
      integrationType: null,
    });
    if (!isActive) setOpen(true);
  };

  return (
    <ChannelNavItem
      name={channel.name}
      icon={
        <IconComponent
          name={channel.icon}
          className="size-3.5 text-accent-foreground shrink-0"
        />
      }
      isActive={isActive}
      onSelect={handleSelectChannel}
      open={open}
      onOpenChange={setOpen}
      unreadCount={unreadCount}
      members={members}
    >
      {loading && !integrationTypes.length && (
        <Skeleton className="w-28 h-4 ml-8 my-1" />
      )}
      {!loading && !integrationTypes.length && (
        <div className="text-sm text-accent-foreground ml-8 my-2">
          {t('no-integration-found')}
        </div>
      )}
      {integrationTypes.map((integrationType) => (
        <IntegrationTypeItem
          key={integrationType._id}
          {...integrationType}
          channelId={channel._id}
          count={integrationType.unreadConversationCount || 0}
          awaitingCount={awaitingCounts[integrationType._id] || 0}
          nested
        />
      ))}
      {open && <ChannelPollNavItem channelId={channel._id} />}
    </ChannelNavItem>
  );
};

const useChannelIntegrationTypes = ({
  channelId,
  skip,
}: {
  channelId: string;
  skip: boolean;
}): {
  integrationTypes: IIntegrationType[];
  loading: boolean;
  awaitingCounts: TConversationCounts;
} => {
  const { integrationTypes, loading } = useUsedIntegrationTypesByChannel({
    channelId,
    skip,
  });
  const { awaitingCounts } = useAwaitingCountsByIntegrationType({
    channelId,
    skip,
  });

  return { integrationTypes, loading, awaitingCounts };
};

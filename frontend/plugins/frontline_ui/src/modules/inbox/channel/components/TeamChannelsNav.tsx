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
import { IntegrationTypeItem } from '@/integrations/components/ChooseIntegrationType';
import { useUsedIntegrationTypesByChannel } from '@/integrations/hooks/useUsedIntegrationTypes';
import {
  TConversationCounts,
  useConversationCountsByIntegrationType,
} from '@/inbox/conversations/hooks/useConversationCounts';
import { useChannelUnreadUpdates } from '@/inbox/channel/hooks/useChannelUnreadUpdates';
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
  const [{ channelId }, setFilters] = useMultiQueryState<{
    channelId: string;
    integrationType: string;
  }>(['channelId', 'integrationType']);

  // Only the expanded channels cost a request; collapsed ones stay silent.
  const { integrationTypes, loading, counts, awaitingCounts } =
    useChannelIntegrationTypes({ channelId: channel._id, skip: !open });

  const isActive = channelId === channel._id;

  const handleSelectChannel = () => {
    setFilters({
      channelId: isActive ? null : channel._id,
      integrationType: null,
    });
    if (!isActive) setOpen(true);
  };

  return (
    <Collapsible className="group/channel" open={open} onOpenChange={setOpen}>
      <div className="flex items-center w-full">
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn(
            'justify-start gap-2 overflow-hidden text-left flex-auto min-w-0 py-2 pl-2 pr-2',
            unreadCount === 0 && !isActive && 'text-muted-foreground',
          )}
          onClick={handleSelectChannel}
        >
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
          {members.length > 0 && (
            <MembersInline.Provider members={members} size="sm">
              <MembersInline.Avatar size="sm" />
            </MembersInline.Provider>
          )}
          {unreadCount > 0 && (
            <span className="shrink-0 px-1 text-xs rounded-sm bg-primary text-primary-foreground tabular-nums">
              {unreadCount}
            </span>
          )}
        </Button>
        <Collapsible.Trigger asChild>
          <Button
            variant="ghost"
            className="shrink-0 size-6 p-0"
            aria-label={channel.name}
            aria-expanded={open}
          >
            <IconCaretRightFilled className="size-3 transition-transform group-data-[state=open]/channel:rotate-90 text-accent-foreground" />
          </Button>
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content>
        <Sidebar.Menu>
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
              count={counts[integrationType._id] || 0}
              awaitingCount={awaitingCounts[integrationType._id] || 0}
              nested
            />
          ))}
        </Sidebar.Menu>
      </Collapsible.Content>
    </Collapsible>
  );
};

const useChannelIntegrationTypes = ({
  channelId,
  skip,
}: {
  channelId: string;
  skip: boolean;
}): {
  integrationTypes: { _id: string; name: string }[];
  loading: boolean;
  counts: TConversationCounts;
  awaitingCounts: TConversationCounts;
} => {
  const { integrationTypes, loading } = useUsedIntegrationTypesByChannel({
    channelId,
    skip,
  });
  const { counts, awaitingCounts } = useConversationCountsByIntegrationType({
    channelId,
    skip,
  });

  return { integrationTypes, loading, counts, awaitingCounts };
};

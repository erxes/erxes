import { NavigationMenuGroup, Skeleton, useMultiQueryState } from 'erxes-ui';
import { IconUser } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { ChannelScope } from '@/channels/types';
import { channelScopeOf } from '@/channels/utils/channelScope';
import { useGetMyChannels } from '@/channels/hooks/useGetMyChannels';
import { IntegrationTypeItem } from '@/integrations/components/ChooseIntegrationType';
import { useUsedIntegrationTypesByChannel } from '@/integrations/hooks/useUsedIntegrationTypes';
import { useAwaitingCountsByIntegrationType } from '@/inbox/conversations/hooks/useConversationCounts';
import { ChannelNavItem } from '@/inbox/channel/components/ChannelNavItem';

export const PersonalInboxNav = () => {
  const { t } = useTranslation('frontline');
  const { channels } = useGetMyChannels();
  const { integrationTypes, loading } = useUsedIntegrationTypesByChannel({
    scope: ChannelScope.PERSONAL,
  });
  const [{ channelId }, setFilters] = useMultiQueryState<{
    channelId: string;
    integrationType: string;
  }>(['channelId', 'integrationType']);

  const personalChannel = channels?.find(
    (channel) => channelScopeOf(channel) === ChannelScope.PERSONAL,
  );

  const { awaitingCounts } = useAwaitingCountsByIntegrationType({
    channelId: personalChannel?._id,
  });

  const isActive = !!personalChannel && channelId === personalChannel._id;

  const handleSelectChannel = () => {
    if (!personalChannel) return;

    setFilters({
      channelId: isActive ? null : personalChannel._id,
      integrationType: null,
    });
  };

  const renderContent = () => {
    if (loading && !integrationTypes.length) {
      return <Skeleton className="w-28 h-4 ml-8 my-1" />;
    }

    if (!integrationTypes.length) {
      return (
        <div className="text-sm text-accent-foreground ml-8 my-2">
          {t('no-personal-inbox')}
        </div>
      );
    }

    return integrationTypes.map((integrationType) => (
      <IntegrationTypeItem
        key={integrationType._id}
        {...integrationType}
        channelId={personalChannel?._id}
        count={integrationType.unreadConversationCount || 0}
        awaitingCount={awaitingCounts[integrationType._id] || 0}
        nested
      />
    ));
  };

  return (
    <NavigationMenuGroup name={t('me')}>
      <ChannelNavItem
        name={t('personal-channel')}
        icon={<IconUser className="size-3.5 text-accent-foreground shrink-0" />}
        isActive={isActive}
        onSelect={handleSelectChannel}
        unreadCount={personalChannel?.unreadConversationCount || 0}
        collapsible={false}
      >
        {renderContent()}
      </ChannelNavItem>
    </NavigationMenuGroup>
  );
};

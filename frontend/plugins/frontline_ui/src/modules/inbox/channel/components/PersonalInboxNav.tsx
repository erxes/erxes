import { NavigationMenuGroup, Skeleton, useMultiQueryState } from 'erxes-ui';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { ChannelScope } from '@/channels/types';
import { channelScopeOf } from '@/channels/utils/channelScope';
import { useGetMyChannels } from '@/channels/hooks/useGetMyChannels';
import { IntegrationTypeItem } from '@/integrations/components/ChooseIntegrationType';
import { useUsedIntegrationTypesByChannel } from '@/integrations/hooks/useUsedIntegrationTypes';
import { useAwaitingCountsByIntegrationType } from '@/inbox/conversations/hooks/useConversationCounts';
import {
  INBOX_TARGET_KEYS,
  InboxTarget,
} from '@/inbox/conversations/constants/inboxTarget';

export const PersonalInboxNav = () => {
  const { t } = useTranslation('frontline');
  const { channels } = useGetMyChannels();
  const { integrationTypes, loading } = useUsedIntegrationTypesByChannel({
    scope: ChannelScope.PERSONAL,
  });
  const [{ channelId }, setFilters] =
    useMultiQueryState<InboxTarget>(INBOX_TARGET_KEYS);
  const personalChannel = channels?.find(
    (channel) => channelScopeOf(channel) === ChannelScope.PERSONAL,
  );

  const { awaitingCounts } = useAwaitingCountsByIntegrationType({
    channelId: personalChannel?._id,
  });

  const handleGroupClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element;

    if (!target.closest('[data-sidebar="group-label"]')) {
      return;
    }

    // The caret remains the sole control that can close the group. Clicking
    // the label opens a closed group, but never closes an open one.
    if (target.closest('svg')) {
      return;
    }

    const groupLabel = target.closest('[data-sidebar="group-label"]');

    if (groupLabel?.getAttribute('aria-expanded') !== 'false') {
      event.stopPropagation();
    }

    if (!personalChannel) {
      return;
    }

    const isActive = channelId === personalChannel._id;

    setFilters({
      channelId: isActive ? null : personalChannel._id,
      integrationId: null,
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
      />
    ));
  };

  return (
    <NavigationMenuGroup
      name={t('my-inbox', { defaultValue: 'My Inbox' })}
      onClickCapture={handleGroupClickCapture}
    >
      {renderContent()}
    </NavigationMenuGroup>
  );
};

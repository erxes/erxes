import { NavigationMenuGroup, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { ChannelScope } from '@/channels/types';
import { channelScopeOf } from '@/channels/utils/channelScope';
import { useGetMyChannels } from '@/channels/hooks/useGetMyChannels';
import { IntegrationTypeItem } from '@/integrations/components/ChooseIntegrationType';
import { useUsedIntegrationTypesByChannel } from '@/integrations/hooks/useUsedIntegrationTypes';
import { useConversationCountsByIntegrationType } from '@/inbox/conversations/hooks/useConversationCounts';
import { UnreadSummary } from '@/inbox/channel/components/UnreadSummary';

/**
 * The "Me" group: the integration types connected to this user's own personal
 * channel, listed flat because a personal inbox is a single channel. Each row
 * carries its open count, and the group header carries their total.
 */
export const PersonalInboxNav = () => {
  const { t } = useTranslation('frontline');
  const { channels } = useGetMyChannels();
  const { integrationTypes, loading } = useUsedIntegrationTypesByChannel({
    scope: ChannelScope.PERSONAL,
  });

  const personalChannel = channels?.find(
    (channel) => channelScopeOf(channel) === ChannelScope.PERSONAL,
  );

  const { counts, awaitingCounts } = useConversationCountsByIntegrationType({
    channelId: personalChannel?._id,
  });

  const total = integrationTypes.reduce(
    (sum, integrationType) => sum + (counts[integrationType._id] || 0),
    0,
  );

  return (
    <NavigationMenuGroup name={t('me')} actions={<UnreadSummary count={total} />}>
      {loading && !integrationTypes.length && (
        <Skeleton className="w-32 h-4 mt-1" />
      )}
      {!loading && !integrationTypes.length && (
        <div className="text-sm text-accent-foreground ml-3 my-4">
          {t('no-personal-inbox')}
        </div>
      )}
      {integrationTypes.map((integrationType) => (
        <IntegrationTypeItem
          key={integrationType._id}
          {...integrationType}
          channelId={personalChannel?._id}
          count={counts[integrationType._id] || 0}
          awaitingCount={awaitingCounts[integrationType._id] || 0}
        />
      ))}
    </NavigationMenuGroup>
  );
};

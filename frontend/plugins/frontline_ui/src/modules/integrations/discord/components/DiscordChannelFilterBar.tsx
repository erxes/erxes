import { IconBrandDiscord } from '@tabler/icons-react';
import { Filter, TextOverflowTooltip, useQueryState } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { IntegrationType } from '@/types/Integration';
import {
  INTEGRATIONS_PER_PAGE,
  useIntegrations,
} from '@/integrations/hooks/useIntegrations';
import { channelLabelFromIntegration } from '@/inbox/conversations/utils/channelGroups';

export const DiscordChannelFilterBar = ({
  iconOnly,
}: {
  iconOnly?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [integrationId] = useQueryState<string>('integrationId');

  const selectedIds = useMemo(
    () => (integrationId ? integrationId.split(',').filter(Boolean) : []),
    [integrationId],
  );

  const { integrations } = useIntegrations({
    variables: {
      kind: IntegrationType.DISCORD_MESSENGER,
      channelId: '',
      limit: INTEGRATIONS_PER_PAGE,
    },
    fetchPolicy: 'cache-first',
    skip: !selectedIds.length,
  });

  const label = useMemo(() => {
    if (!selectedIds.length) {
      return '';
    }

    const first = (integrations || []).find(
      (integration) => integration._id === selectedIds[0],
    );
    const name = first ? channelLabelFromIntegration(first) : selectedIds[0];

    return selectedIds.length > 1 ? `${name} +${selectedIds.length - 1}` : name;
  }, [integrations, selectedIds]);

  if (!selectedIds.length) {
    return null;
  }

  return (
    <Filter.BarItem queryKey="integrationId">
      <Filter.BarName>
        <IconBrandDiscord />
        {!iconOnly && t('channel')}
      </Filter.BarName>
      <Filter.BarButton filterKey="integrationId">
        <TextOverflowTooltip value={label} />
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

import { IconCheck, IconInbox } from '@tabler/icons-react';
import {
  Button,
  Sidebar,
  TextOverflowTooltip,
  cn,
  useMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { FacebookPostSheet } from '@/integrations/facebook/components/FacebookPostSheet';
import { INTEGRATION_ICONS } from '@/integrations/constants/integrationImages';
import type { IIntegration } from '@/integrations/types/Integration';
import { IntegrationType } from '@/types/Integration';
import {
  CLEARED_INBOX_NAVIGATION_FILTERS,
  INBOX_NAVIGATION_FILTER_KEYS,
  TInboxNavigationFilters,
} from '@/inbox/types/InboxNavigation';

type InboxIntegrationItemProps = Pick<
  IIntegration,
  '_id' | 'channelId' | 'kind' | 'name'
> & {
  awaitingCount?: number;
  count?: number;
};

export const InboxIntegrationItem = ({
  _id,
  awaitingCount = 0,
  channelId,
  count = 0,
  kind,
  name,
}: InboxIntegrationItemProps) => {
  const { t } = useTranslation('frontline');
  const [{ channelId: selectedChannelId, integrationId }, setFilters] =
    useMultiQueryState<TInboxNavigationFilters>(INBOX_NAVIGATION_FILTER_KEYS);
  const isActive = integrationId === _id && selectedChannelId === channelId;
  const Icon = INTEGRATION_ICONS[kind] ?? IconInbox;

  const selectIntegration = () => {
    setFilters({
      ...CLEARED_INBOX_NAVIGATION_FILTERS,
      channelId: isActive ? null : channelId,
      integrationId: isActive ? null : _id,
    });
  };

  const trigger = (
    <Button
      aria-pressed={isActive}
      className="w-full justify-start gap-2 overflow-hidden pl-7 text-left"
      onClick={selectIntegration}
      variant={isActive ? 'secondary' : 'ghost'}
    >
      {isActive ? (
        <IconCheck className="size-4 shrink-0" />
      ) : (
        <Icon
          className={cn(
            'size-4 shrink-0',
            count === 0 ? 'text-muted-foreground/70' : 'text-accent-foreground',
          )}
        />
      )}
      <TextOverflowTooltip className="min-w-0 flex-1" value={name} />
      {awaitingCount > 0 && (
        <span
          aria-label={t('awaiting-your-reply')}
          className="size-1.5 shrink-0 rounded-full bg-warning"
          role="img"
          title={t('awaiting-your-reply')}
        />
      )}
      {count > 0 && (
        <span className="shrink-0 text-xs tabular-nums">{count}</span>
      )}
    </Button>
  );

  return (
    <Sidebar.MenuItem>
      {trigger}
      {kind === IntegrationType.FACEBOOK_POST && <FacebookPostSheet />}
    </Sidebar.MenuItem>
  );
};

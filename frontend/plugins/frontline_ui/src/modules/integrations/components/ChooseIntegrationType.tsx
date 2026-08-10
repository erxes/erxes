import {
  Button,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  cn,
  useMultiQueryState,
} from 'erxes-ui';
import { INTEGRATION_ICONS } from '../constants/integrationImages';
import { IconCheck, IconInbox } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUsedIntegrationTypes } from '../hooks/useUsedIntegrationTypes';
import { IIntegrationType } from '../types/Integration';
import { IntegrationType } from '@/types/Integration';
import { FacebookPostSheet } from '../facebook/components/FacebookPostSheet';

type Props = {
  allowedIntegrationTypes?: string[];
  emptyMessage?: string;
};

export const ChooseIntegrationTypeContent = ({
  allowedIntegrationTypes: types,
  emptyMessage,
}: Props) => {
  const { integrationTypes, loading } = useUsedIntegrationTypes();

  const filteredIntegrationTypes = useMemo(
    () =>
      types
        ? integrationTypes.filter((item) => types.includes(item.name))
        : integrationTypes,
    [types, integrationTypes],
  );

  if (loading) return <Skeleton className="w-32 h-4 mt-1" />;

  if (!filteredIntegrationTypes.length)
    return (
      <div className="text-sm text-accent-foreground ml-3 my-4">
        {emptyMessage}
      </div>
    );

  return filteredIntegrationTypes.map((integrationType: IIntegrationType) => (
    <IntegrationTypeItem key={integrationType._id} {...integrationType} />
  ));
};

export const IntegrationTypeItem = ({
  _id,
  name,
  channelId,
  nested,
  count = 0,
  awaitingCount = 0,
}: IIntegrationType & {
  // Set when the type is listed under one channel: selecting it filters the
  // conversation list by that channel as well.
  channelId?: string;
  // Indented one level, for types listed inside a collapsible channel.
  nested?: boolean;
  // Open conversations reaching the inbox through this type.
  count?: number;
  // How many of those are waiting on a reply from us.
  awaitingCount?: number;
}) => {
  const { t } = useTranslation('frontline');
  const [{ channelId: selectedChannelId, integrationType }, setFilters] =
    useMultiQueryState<{
      channelId: string;
      integrationType: string;
    }>(['channelId', 'integrationType']);

  const isActive =
    integrationType === _id && (!channelId || selectedChannelId === channelId);

  const handleClick = () => {
    setFilters({
      integrationType: isActive ? null : _id,
      ...(channelId ? { channelId: isActive ? null : channelId } : {}),
    });
  };

  const canCreatePost = _id === IntegrationType.FACEBOOK_POST;
  const Icon = INTEGRATION_ICONS[_id] ?? IconInbox;
  // A source with nothing waiting recedes, so a scan of the group lands on the
  // rows that still need someone.
  const isQuiet = count === 0 && !isActive;

  const trigger = (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="justify-start pl-7 relative overflow-hidden text-left w-full"
      onClick={handleClick}
    >
      {isActive ? (
        <IconCheck className="size-4 shrink-0" />
      ) : (
        <Icon
          className={cn(
            'size-4 shrink-0',
            isQuiet ? 'text-muted-foreground/70' : 'text-accent-foreground',
          )}
        />
      )}
      <TextOverflowTooltip className="flex-1 min-w-0" value={name} />
      {awaitingCount > 0 && (
        <span
          className="size-1.5 shrink-0 rounded-full bg-warning"
          role="img"
          aria-label={t('awaiting-your-reply')}
          title={t('awaiting-your-reply')}
        />
      )}
      {count > 0 && (
        <span className="shrink-0 text-xs tabular-nums">{count}</span>
      )}
    </Button>
  );

  if (!canCreatePost) {
    return trigger;
  }

  return (
    <Sidebar.MenuItem>
      {trigger}
      <FacebookPostSheet />
    </Sidebar.MenuItem>
  );
};

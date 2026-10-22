import { IconChevronDown, IconDots } from '@tabler/icons-react';
import {
  Badge,
  Button,
  cn,
  getPluginAssetsUrl,
  isDefined,
  Popover,
  RecordTableInlineCell,
  Skeleton,
  Tooltip,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useChannelIntegrationsPeek } from '@/channels/hooks/useChannelIntegrationsPeek';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { FacebookPageLink } from '@/integrations/facebook/components/FacebookPageLink';
import {
  IntegrationActionsMenu,
  IntegrationRepairAction,
  isRepairableIntegration,
} from '@/integrations/components/IntegrationMoreColumn';
import type { ChannelIntegrationsPeekQuery } from '~/gql/graphql';
import { IntegrationChips } from './IntegrationChips';

type TPeekIntegration = NonNullable<
  NonNullable<
    NonNullable<ChannelIntegrationsPeekQuery['integrations']>['list']
  >[number]
>;

const kindMeta = (kind: string) =>
  INTEGRATIONS[kind as keyof typeof INTEGRATIONS];

const PeekRow = ({
  integration,
  broken,
}: {
  integration: TPeekIntegration;
  broken: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const meta = kindMeta(integration.kind);
  const pages = (integration.facebookPage ?? []).filter(isDefined);
  const inactive = integration.isActive === false;
  const status = integration.healthStatus?.status;

  return (
    <div
      className={cn(
        'flex flex-col gap-1 border-b px-3 py-2 last:border-b-0',
        broken && 'bg-destructive/5',
        inactive && 'opacity-60',
      )}
    >
      <div className="flex items-center gap-2">
        {meta && (
          <IntegrationLogo
            img={getPluginAssetsUrl('frontline', meta.img)}
            name={meta.name}
            className="size-5 p-0.5 shadow-none"
          />
        )}
        <span
          className={cn(
            'flex-1 truncate text-sm font-medium',
            broken && 'text-destructive',
          )}
        >
          {integration.name}
        </span>
        {broken && isRepairableIntegration(integration.kind) && (
          <div className="flex h-6 cursor-pointer items-center rounded-md border border-destructive/40 px-2 text-xs text-destructive hover:bg-destructive/10">
            <IntegrationRepairAction integration={integration} />
          </div>
        )}
        {!broken && (
          <Badge variant={inactive ? 'secondary' : 'success'}>
            {inactive
              ? t('inactive', { defaultValue: 'Inactive' })
              : t('healthy', { defaultValue: 'Healthy' })}
          </Badge>
        )}
        {broken && !isRepairableIntegration(integration.kind) && (
          <Badge variant="destructive">{status}</Badge>
        )}
        <IntegrationActionsMenu
          integration={integration}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              aria-label={t('actions', { defaultValue: 'Actions' })}
            >
              <IconDots className="text-muted-foreground" />
            </Button>
          }
        />
      </div>
      <div className="flex min-w-0 items-center gap-2 pl-7 text-xs text-muted-foreground">
        <span className="shrink-0">
          {meta?.name ??
            (integration.kind === 'lead'
              ? t('form', { defaultValue: 'Form' })
              : integration.kind)}
        </span>
        {pages.map((page) => (
          <FacebookPageLink
            key={page.pageId}
            pageId={page.pageId}
            name={page.name}
          />
        ))}
      </div>
      {broken && integration.healthStatus?.error && (
        <Tooltip.Provider>
          <Tooltip delayDuration={0}>
            <Tooltip.Trigger asChild>
              <div className="pl-7 text-xs text-destructive truncate">
                {integration.healthStatus.error}
              </div>
            </Tooltip.Trigger>
            <Tooltip.Content className="max-w-80 whitespace-pre-wrap break-words">
              {integration.healthStatus.error}
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      )}
    </div>
  );
};

/** Every integration of a channel with its health and actions, in place. */
export const ChannelIntegrationsPeek = ({
  channelId,
  channelName,
}: {
  channelId: string;
  channelName: string;
}) => {
  const { t } = useTranslation('frontline');
  const {
    integrations,
    brokenCount,
    totalCount,
    loading,
    error,
    needsAttention,
  } = useChannelIntegrationsPeek(channelId);

  return (
    <div className="flex max-h-[28rem] flex-col">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <span className="truncate text-sm font-medium">
          {channelName} ·{' '}
          {t('integrations-count', {
            defaultValue: '{{count}} integrations',
            count: totalCount,
          })}
        </span>
        {brokenCount > 0 && (
          <Badge variant="destructive">
            {t('broken-count', {
              defaultValue: '{{count}} broken',
              count: brokenCount,
            })}
          </Badge>
        )}
      </div>
      <div className="overflow-y-auto">
        {loading && (
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {!loading && error && (
          <p className="p-3 text-sm text-destructive">{error.message}</p>
        )}
        {!loading && !error && !integrations.length && (
          <p className="p-3 text-sm text-muted-foreground">
            {t('no-channel-integrations', {
              defaultValue: 'No integration is connected to this channel.',
            })}
          </p>
        )}
        {integrations.map((integration) => (
          <PeekRow
            key={integration._id}
            integration={integration}
            broken={needsAttention(integration.healthStatus?.status)}
          />
        ))}
      </div>
    </div>
  );
};

/** The channel list's integrations cell, opening the peek in place. */
export const ChannelIntegrationsCell = ({
  channelId,
  channelName,
  count,
  kinds,
}: {
  channelId: string;
  channelName: string;
  count: number;
  kinds: string[];
}) => {
  if (!count) {
    return (
      <RecordTableInlineCell className="gap-2">{count}</RecordTableInlineCell>
    );
  }

  return (
    <Popover>
      <RecordTableInlineCell.Trigger
        className="gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {count}
        <IntegrationChips kinds={kinds} />
        <IconChevronDown className="size-3.5 text-muted-foreground" />
      </RecordTableInlineCell.Trigger>
      <Popover.Content
        align="start"
        className="w-[26rem] p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <ChannelIntegrationsPeek
          channelId={channelId}
          channelName={channelName}
        />
      </Popover.Content>
    </Popover>
  );
};

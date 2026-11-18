import { WorkspaceRail } from '@/channels/components/settings/channel-workspace/ChannelWorkspaceFrame';
import { ChannelIntegrationNavGroup } from '@/channels/components/settings/channel-workspace/ChannelIntegrationNav';
import { ChannelSectionNav } from '@/channels/components/settings/channel-workspace/ChannelSectionNav';
import {
  TChannelSection,
  TChannelWorkspacePaths,
} from '@/channels/constants/channelSections';
import { useChannelIntegrationKinds } from '@/channels/hooks/useChannelIntegrationKinds';
import { IChannelDetail } from '@/channels/types';
import { cn, IconComponent, Skeleton } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type TWorkspaceChannel = Pick<
  IChannelDetail,
  '_id' | 'name' | 'description' | 'icon'
>;

const ChannelWorkspaceHeader = ({
  channel,
  badge,
}: {
  channel: TWorkspaceChannel;
  badge?: ReactNode;
}) => (
  <div className="flex items-start gap-2 border-b p-3">
    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent">
      <IconComponent
        name={channel.icon ?? undefined}
        className="size-4 text-accent-foreground"
      />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex h-8 items-center gap-1.5">
        <h1 className="truncate text-sm font-semibold">{channel.name}</h1>
        {badge}
      </div>
      {channel.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {channel.description}
        </p>
      )}
    </div>
  </div>
);

const ChannelIntegrationSummary = ({
  connected,
  total,
  loading,
  failed,
  partialCount,
}: {
  connected: number;
  total: number;
  loading: boolean;
  failed: boolean;
  partialCount: number;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });

  const renderContent = () => {
    if (loading) return <Skeleton className="h-3 w-28" />;
    if (failed) {
      return (
        <span className="truncate text-destructive">
          {t('integrations-load-error', 'Could not load integrations')}
        </span>
      );
    }
    return (
      <>
        <span
          aria-hidden
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            connected > 0 ? 'bg-success' : 'bg-muted-foreground/40',
          )}
        />
        <span className="truncate">
          {t('integrations-connected-count', {
            defaultValue: '{{connected}} of {{total}} connected',
            connected,
            total,
          })}
        </span>
        {partialCount > 0 && (
          <span className="ml-auto shrink-0 text-warning">
            {t('integrations-partial', {
              defaultValue: 'First {{count}} only',
              count: partialCount,
            })}
          </span>
        )}
      </>
    );
  };

  return (
    <div className="flex h-9 shrink-0 items-center gap-2 border-t px-3 text-xs text-muted-foreground">
      {renderContent()}
    </div>
  );
};

export const ChannelWorkspaceNav = ({
  channel,
  sections,
  paths,
  counts,
  rootSegment,
  badge,
}: {
  channel: TWorkspaceChannel;
  sections: readonly TChannelSection[];
  paths: TChannelWorkspacePaths;
  counts?: Partial<Record<string, number>>;
  rootSegment?: string;
  badge?: ReactNode;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { connected, available, totalKinds, partialCount, loading, error } =
    useChannelIntegrationKinds(channel._id);

  return (
    <WorkspaceRail
      header={<ChannelWorkspaceHeader channel={channel} badge={badge} />}
      footer={
        <ChannelIntegrationSummary
          connected={connected.length}
          total={totalKinds}
          loading={loading}
          failed={Boolean(error)}
          partialCount={partialCount}
        />
      }
    >
      <ChannelSectionNav
        sections={sections}
        basePath={paths.sections}
        counts={counts}
        rootSegment={rootSegment}
      />
      {loading ? (
        <ChannelIntegrationNavGroup
          basePath={paths.integrations}
          label={t('integrations', 'Integrations')}
          kinds={[]}
          loading
        />
      ) : (
        <>
          <ChannelIntegrationNavGroup
            basePath={paths.integrations}
            label={t('connected', 'Connected')}
            kinds={connected}
          />
          <ChannelIntegrationNavGroup
            basePath={paths.integrations}
            label={t('available', 'Available')}
            kinds={available}
          />
        </>
      )}
    </WorkspaceRail>
  );
};

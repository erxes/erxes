import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import {
  Button,
  cn,
  Collapsible,
  Empty,
  IconComponent,
  NavigationMenuGroup,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { IChannel } from '@/channels/types';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { IconGitBranch, IconMinus, IconPlus } from '@tabler/icons-react';

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-full h-4" />
      ))}
    </div>
  );
}

interface ChannelItemProps {
  channel: IChannel;
  pipelineId?: string;
}

function ChannelItem({ channel, pipelineId }: Readonly<ChannelItemProps>) {
  const [channelId] = useQueryState<string | null>('channelId');
  const isActive = channelId === channel._id;
  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link
          to={`frontline/tickets?channelId=${channel._id}${
            pipelineId ? `&pipelineId=${pipelineId}` : ''
          }`}
        >
          {!!channel.icon && (
            <IconComponent
              name={channel.icon}
              className={cn(
                'flex-none text-accent-foreground',
                isActive && 'text-primary',
              )}
            />
          )}
          <span className="flex-1 min-w-0 truncate">{channel.name}</span>
        </Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
}

export function TicketNavigations() {
  const { t } = useTranslation('frontline');
  const { channels, loading } = useGetChannels();
  const { pipelines, loading: pipelinesLoading } = useGetPipelines({
    variables: {
      filter: {
        applyVisibilityFilter: true,
        direction: 'forward',
        limit: 1000,
      },
    },
  });
  const [channelId, setChannelId] = useQueryState<string | null>('channelId');
  const [showUnconfigured, setShowUnconfigured] = useState(false);

  const channelPipelineIds = useMemo(
    () =>
      (pipelines ?? []).reduce<Record<string, string>>((result, pipeline) => {
        if (pipeline.channelId && !result[pipeline.channelId]) {
          result[pipeline.channelId] = pipeline._id;
        }

        return result;
      }, {}),
    [pipelines],
  );

  const { configuredChannels, unconfiguredChannels } = useMemo(() => {
    const availableChannels = channels ?? [];

    return {
      configuredChannels: availableChannels.filter((channel) =>
        Boolean(channelPipelineIds[channel._id]),
      ),
      unconfiguredChannels: availableChannels.filter(
        (channel) => !channelPipelineIds[channel._id],
      ),
    };
  }, [channelPipelineIds, channels]);

  const navigationLoading = loading || pipelinesLoading;

  const visibleUnconfiguredChannels = showUnconfigured
    ? unconfiguredChannels
    : [];

  const handleToggleUnconfigured = () => {
    const nextShowUnconfigured = !showUnconfigured;

    if (
      !nextShowUnconfigured &&
      unconfiguredChannels.some((channel) => channel._id === channelId)
    ) {
      setChannelId(configuredChannels[0]?._id || null);
    }

    setShowUnconfigured(nextShowUnconfigured);
  };

  useEffect(() => {
    if (!channels || navigationLoading) {
      return;
    }

    const hasSelectedChannel = channels.some(
      (channel) => channel._id === channelId,
    );

    if (!channelId || !hasSelectedChannel) {
      setChannelId(configuredChannels[0]?._id || null);
    }
  }, [
    channels,
    configuredChannels,
    navigationLoading,
    setChannelId,
    channelId,
  ]);

  useEffect(() => {
    if (
      !navigationLoading &&
      !showUnconfigured &&
      unconfiguredChannels.some((channel) => channel._id === channelId)
    ) {
      setChannelId(configuredChannels[0]?._id || null);
    }
  }, [
    channelId,
    configuredChannels,
    navigationLoading,
    setChannelId,
    showUnconfigured,
    unconfiguredChannels,
  ]);

  return (
    <>
      <NavigationMenuGroup name="Channels">
        {navigationLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {configuredChannels.map((channel) => (
              <ChannelItem
                key={channel._id}
                channel={channel}
                pipelineId={channelPipelineIds[channel._id] || undefined}
              />
            ))}
            {visibleUnconfiguredChannels.map((channel) => (
              <ChannelItem key={channel._id} channel={channel} />
            ))}
            {unconfiguredChannels.length > 0 && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-2 font-medium text-muted-foreground"
                onClick={handleToggleUnconfigured}
                aria-expanded={showUnconfigured}
              >
                {showUnconfigured ? (
                  <IconMinus className="size-4 shrink-0" />
                ) : (
                  <IconPlus className="size-4 shrink-0" />
                )}
                <TextOverflowTooltip
                  className="min-w-0 flex-1 text-left"
                  value={
                    showUnconfigured
                      ? t('hide-not-configured-tickets', {
                          defaultValue: 'Hide not configured tickets',
                        })
                      : t('not-configured-tickets', {
                          count: unconfiguredChannels.length,
                          defaultValue_one: '{{count}} not configured ticket',
                          defaultValue_other:
                            '{{count}} not configured tickets',
                        })
                  }
                />
              </Button>
            )}
          </>
        )}
      </NavigationMenuGroup>
      {channelId && (
        <NavigationMenuGroup name="Pipelines">
          <Pipelines />
        </NavigationMenuGroup>
      )}
    </>
  );
}

const Pipelines = () => {
  const { t } = useTranslation('frontline');
  const [channelId] = useQueryState<string | null>('channelId');
  const [pipelineId, setPipelineId] = useQueryState<string | null>(
    'pipelineId',
  );
  const { pipelines, loading } = useGetPipelines({
    variables: {
      filter: { channelId: channelId || '', applyVisibilityFilter: true },
    },
  });
  useEffect(() => {
    if (!channelId || !pipelines) {
      return;
    }

    const hasSelectedPipeline = pipelines.some(
      (pipeline) => pipeline._id === pipelineId,
    );

    if (!pipelineId || !hasSelectedPipeline) {
      setPipelineId(pipelines[0]?._id || null);
    }
  }, [channelId, pipelines, pipelineId, setPipelineId]);
  return (
    <Collapsible.Content className="pt-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            pipelines?.map((pipeline) => (
              <Sidebar.MenuItem key={pipeline._id}>
                <Sidebar.MenuButton
                  isActive={pipelineId === pipeline._id}
                  onClick={() => {
                    setPipelineId(pipeline._id);
                  }}
                >
                  <span className="capitalize min-w-0 truncate">
                    {pipeline.name}
                  </span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))
          )}
          {!loading && !pipelines?.length && (
            <Empty className="py-6">
              <Empty.Header>
                <Empty.Media>
                  <IconGitBranch />
                </Empty.Media>
                <Empty.Title>{t('no-pipelines')}</Empty.Title>
              </Empty.Header>
            </Empty>
          )}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Collapsible.Content>
  );
};

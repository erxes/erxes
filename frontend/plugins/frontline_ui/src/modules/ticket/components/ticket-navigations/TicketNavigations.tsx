import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import {
  cn,
  Collapsible,
  IconComponent,
  NavigationMenuGroup,
  Sidebar,
  Skeleton,
  useQueryState,
} from 'erxes-ui';
import { IChannel } from '@/channels/types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
}

function ChannelItem({ channel }: ChannelItemProps) {
  const [channelId] = useQueryState<string | null>('channelId');
  const isActive = channelId === channel._id;
  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={`frontline/tickets?channelId=${channel._id}`}>
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
  const { channels, loading } = useGetChannels();
  const [channelId, setChannelId] = useQueryState<string | null>('channelId');

  useEffect(() => {
    if (!channels?.length || !channels[0]?._id) {
      return;
    }

    const hasSelectedChannel = channels.some(
      (channel) => channel._id === channelId,
    );

    if (!channelId || !hasSelectedChannel) {
      setChannelId(channels[0]._id);
    }
  }, [channels, setChannelId, channelId]);
  return (
    <>
      <NavigationMenuGroup name="Channels">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          channels?.map((channel) => (
            <ChannelItem key={channel._id} channel={channel} />
          ))
        )}
      </NavigationMenuGroup>
      <NavigationMenuGroup name="Pipelines">
        {channelId && <Pipelines />}
      </NavigationMenuGroup>
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
            <Sidebar.MenuItem>
              <Sidebar.MenuButton disabled={true}>
                <span className="capitalize text-foreground">{t('no-pipelines')}</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          )}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Collapsible.Content>
  );
};

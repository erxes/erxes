import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import {
  cn,
  Collapsible,
  IconComponent,
  NavigationMenuGroup,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { IChannel } from '@/channels/types';
import { useEffect } from 'react';

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
  const [channelId, setChannelId] = useQueryState<string | null>('channelId');
  const isActive = channelId === channel._id;
  return (
    <Sidebar.Group className="p-0">
      <div className="w-full relative group/trigger hover:cursor-pointer">
        <div className="w-full flex items-center justify-between">
          <Sidebar.MenuButton
            isActive={isActive}
            onClick={() => {
              setChannelId(channel._id);
            }}
          >
            <div className="flex items-center gap-2">
              <IconComponent
                name={channel.icon}
                className={cn(
                  'text-accent-foreground flex-shrink-0 size-4',
                  isActive && 'text-primary',
                )}
              />
              <TextOverflowTooltip
                className="font-sans font-semibold normal-case flex-1 min-w-0"
                value={channel.name}
              />
            </div>
          </Sidebar.MenuButton>
        </div>
      </div>
    </Sidebar.Group>
  );
}

export function TicketNavigations() {
  const { channels, loading } = useGetChannels();
  const [channelId, setChannelId] = useQueryState<string | null>('channelId');

  useEffect(() => {
    !channelId && channels?.[0]?._id && setChannelId(channels[0]._id);
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
  const [channelId] = useQueryState<string | null>('channelId');
  const [pipelineId, setPipelineId] = useQueryState<string | null>(
    'pipelineId',
  );
  const { pipelines, loading } = useGetPipelines({
    variables: { filter: { channelId: channelId || '' } },
  });
  useEffect(() => {
    channelId &&
      pipelineId !== pipelines?.[0]?._id &&
      setPipelineId(pipelines?.[0]?._id || null);
  }, [pipelines, setPipelineId, pipelineId, channelId]);
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
                  <span className="capitalize">{pipeline.name}</span>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))
          )}
          {!loading && !pipelines?.length && (
            <Sidebar.MenuItem>
              <Sidebar.MenuButton disabled={true}>
                <span className="capitalize text-foreground">No pipelines</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          )}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Collapsible.Content>
  );
};

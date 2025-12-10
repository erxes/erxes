import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import {
  Button,
  Collapsible,
  IconComponent,
  NavigationMenuGroup,
  NavigationMenuLinkItem,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
} from 'erxes-ui';
import { IconCaretRightFilled } from '@tabler/icons-react';
import { IChannel } from '@/channels/types';

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
  return (
    <Collapsible className="group/collapsible">
      <Sidebar.Group className="p-0">
        <div className="w-full relative group/trigger hover:cursor-pointer">
          <Collapsible.Trigger asChild>
            <div className="w-full flex items-center justify-between">
              <Button
                variant="ghost"
                className="px-2 flex min-w-0 justify-start"
                disabled={channel.pipelineCount === 0}
              >
                <IconComponent
                  name={channel.icon}
                  className="text-accent-foreground shrink-0"
                />
                <TextOverflowTooltip
                  className="font-sans font-semibold normal-case flex-1 min-w-0"
                  value={channel.name}
                />
                <span className="ml-auto shrink-0">
                  <IconCaretRightFilled className="size-3 transition-transform group-data-[state=open]/collapsible:rotate-90 text-accent-foreground" />
                </span>
              </Button>
              <div className="size-5 min-w-5 mr-2"></div>
            </div>
          </Collapsible.Trigger>
        </div>
        <PipelineItem channelId={channel._id} key={channel._id} />
      </Sidebar.Group>
    </Collapsible>
  );
}

export function TicketNavigations() {
  const { channels, loading } = useGetChannels();

  return (
    <NavigationMenuGroup name="Channels" className="p-0">
      {loading ? (
        <LoadingSkeleton />
      ) : (
        channels?.map((channel) => (
          <ChannelItem key={channel._id} channel={channel} />
        ))
      )}
    </NavigationMenuGroup>
  );
}

const PipelineItem = ({ channelId }: { channelId: string }) => {
  const { pipelines } = useGetPipelines({
    variables: { filter: { channelId } },
  });
  return (
    <Collapsible.Content className="pt-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <span className="font-sans text-xs font-semibold normal-case text-accent-foreground pl-6 px-4">
            Pipelines
          </span>
          <div className="pl-2">
            {pipelines?.map((pipeline) => (
              <NavigationMenuLinkItem
                name={pipeline.name}
                pathPrefix="frontline"
                className="pl-6 font-medium"
                path={`channels/${channelId}/pipelines/${pipeline._id}/tickets`}
                key={pipeline._id}
              />
            ))}
          </div>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Collapsible.Content>
  );
};

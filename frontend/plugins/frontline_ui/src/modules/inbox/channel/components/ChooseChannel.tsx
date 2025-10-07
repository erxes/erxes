import {
  cn,
  Collapsible,
  Command,
  Input,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { IChannel } from '@/inbox/types/Channel';
import { IconCheck } from '@tabler/icons-react';
import { channelCollapsibleState } from '@/inbox/channel/states/channelCollapsibleState';
import { useGetChannels } from '@/channels/hooks/useGetChannels';

export const ChooseChannel = () => {
  const [open, setOpen] = useAtom(channelCollapsibleState);

  return (
    <Collapsible
      className="group/channel flex-auto overflow-hidden flex flex-col"
      open={open}
      onOpenChange={setOpen}
    >
      <Collapsible.TriggerButton className="flex-none">
        <Collapsible.TriggerIcon className="group-data-[state=open]/channel:rotate-180" />
        {'Channels'}
      </Collapsible.TriggerButton>
      <Collapsible.Content className=" flex flex-col gap-1 overflow-hidden">
        <ChooseChannelContent open={open} />
      </Collapsible.Content>
    </Collapsible>
  );
};

const ChooseChannelContent = ({ open }: { open: boolean }) => {
  const { channels, loading } = useGetChannels({
    skip: !open,
  });

  if (loading)
    return (
      <>
        <Skeleton className="w-32 h-4 mt-1" />
        <Skeleton className="w-36 h-4 mt-1" />
        <Skeleton className="w-32 h-4 mt-1" />
      </>
    );

  if (!channels?.length)
    return (
      <div className="text-sm text-accent-foreground ml-3 my-4">
        No channels found
      </div>
    );

  return (
    <Command>
      <div className="p-1 pb-2">
        <Command.Primitive.Input placeholder="Search channels" asChild>
          <Input variant="secondary" />
        </Command.Primitive.Input>
      </div>

      <Command.List className="max-h-none overflow-y-auto">
        {channels?.map((channel: IChannel) => (
          <ChannelItem key={channel._id} {...channel} />
        ))}
      </Command.List>
    </Command>
  );
};

const ChannelItem = ({ _id, name }: IChannel) => {
  const [channelId, setChannelId] = useQueryState<string>('channelId');

  const isActive = channelId === _id;

  const handleClick = () => {
    setChannelId(_id === channelId ? null : _id);
  };

  return (
    <Command.Item
      value={name}
      onSelect={handleClick}
      className={cn(
        'w-full justify-start pl-7 pr-2 relative text-left',
        isActive && 'bg-muted',
      )}
    >
      {isActive && <IconCheck className="absolute left-1.5" />}
      <TextOverflowTooltip value={name} />
    </Command.Item>
  );
};

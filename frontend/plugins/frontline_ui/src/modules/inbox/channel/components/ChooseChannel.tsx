import {
  Button,
  IconComponent,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { IChannel } from '@/inbox/types/Channel';
import { IconCheck } from '@tabler/icons-react';
import { useGetChannels } from '@/channels/hooks/useGetChannels';

export const ChooseChannel = () => {
  const { channels, loading } = useGetChannels();

  if (loading)
    return (
      <div className="flex flex-col gap-1">
        <Skeleton className="w-32 h-4 mt-1" />
        <Skeleton className="w-36 h-4 mt-1" />
        <Skeleton className="w-32 h-4 mt-1" />
      </div>
    );

  if (!channels?.length)
    return (
      <div className="text-sm text-accent-foreground ml-3 my-4">
        No channels found
      </div>
    );

  return channels?.map((channel: IChannel) => (
    <ChannelItem key={channel._id} {...channel} />
  ));
};

const ChannelItem = ({ _id, name, icon }: IChannel) => {
  const [channelId, setChannelId] = useQueryState<string>('channelId');

  const isActive = channelId === _id;

  const handleClick = () => {
    setChannelId(_id === channelId ? null : _id);
  };

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="justify-start relative overflow-hidden text-left flex-auto"
      onClick={handleClick}
    >
      {isActive ? (
        <IconCheck className="" />
      ) : (
        <IconComponent
          name={icon}
          className="size-3 text-accent-foreground flex-shrink-0"
        />
      )}
      <TextOverflowTooltip value={name} />
    </Button>
  );
};

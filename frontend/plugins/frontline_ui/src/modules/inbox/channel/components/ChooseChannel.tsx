import {
  Button,
  IconComponent,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { IconCheck } from '@tabler/icons-react';
import {
  IFormsChannel,
  useFormsChannelList,
} from '@/forms/hooks/useFormsChannelList';
import { useFormsFilterCounts } from '@/forms/hooks/useFormsFilterCounts';
import { ChannelScope } from '@/channels/types';
import { channelScopeOf } from '@/channels/utils/channelScope';
import { useTranslation } from 'react-i18next';

export const ChooseChannel = ({
  scope,
  emptyMessage,
}: {
  scope?: ChannelScope;
  emptyMessage?: string;
}) => {
  const { t } = useTranslation('frontline');
  const { channels, loading } = useFormsChannelList();
  const { byChannel } = useFormsFilterCounts();

  if (loading)
    return (
      <div className="flex flex-col gap-1">
        <Skeleton className="w-32 h-4 mt-1" />
        <Skeleton className="w-36 h-4 mt-1" />
        <Skeleton className="w-32 h-4 mt-1" />
      </div>
    );

  const visibleChannels = scope
    ? channels?.filter((channel) => channelScopeOf(channel) === scope)
    : channels;

  if (!visibleChannels?.length)
    return (
      <div className="text-sm text-accent-foreground ml-3 my-4">
        {emptyMessage ?? t('no-channels-found', 'No channels found')}
      </div>
    );

  return visibleChannels?.map((channel) => (
    <ChannelItem
      key={channel._id}
      {...channel}
      count={byChannel[channel._id] ?? 0}
    />
  ));
};

const ChannelItem = ({
  _id,
  name,
  icon,
  count,
}: IFormsChannel & { count: number }) => {
  const [channelId, setChannelId] = useQueryState<string>('channelId');

  const isActive = channelId === _id;

  const handleClick = () => {
    setChannelId(_id === channelId ? null : _id);
  };

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="justify-start relative overflow-hidden text-left flex-auto p-2"
      onClick={handleClick}
    >
      {isActive ? (
        <IconCheck className="" />
      ) : (
        <IconComponent
          name={icon ?? undefined}
          className="size-3 text-accent-foreground shrink-0"
        />
      )}
      <TextOverflowTooltip className="flex-1 min-w-0" value={name} />
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {count}
      </span>
    </Button>
  );
};

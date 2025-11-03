import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { format } from 'date-fns';
import {
  Skeleton,
  Table,
  ScrollArea,
  TextOverflowTooltip,
  IconComponent,
  Button,
  useConfirm,
  Spinner,
  Tooltip,
} from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { type IChannel } from '@/channels/types';
import { IconBrandTrello, IconTrash } from '@tabler/icons-react';
import { useChannelRemove } from '@/channels/hooks/useChannelRemove';

export function Channels() {
  const { channels, loading } = useGetChannels();
  const navigate = useNavigate();
  const onClick = (channelId: string) => {
    navigate(`/settings/frontline/channels/details/${channelId}`);
  };
  if (!loading && (!channels || channels.length === 0)) {
    return (
      <div className="overflow-hidden h-full px-8 flex flex-col">
        <div className="bg-sidebar size-full border border-sidebar pl-1 border-t-4 border-l-4 pb-2 pr-2 rounded-lg">
          <div className="size-full flex flex-col items-center justify-center">
            <IconBrandTrello size={64} stroke={1.5} className="text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-600">
              No channels found
            </h2>
            <p className="text-md text-gray-500 mb-4">
              Create a channel to start organizing your team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden h-full px-8">
      <div className="bg-sidebar size-full border border-sidebar pl-1 border-t-4 border-l-4 pb-2 pr-2 rounded-lg">
        <Table>
          <Table.Header>
            <Table.Row className="rounded-t-md">
              <Table.Head className="w-auto rounded-tl-md pl-2">
                Title
              </Table.Head>
              <Table.Head className="w-20">Members</Table.Head>
              <Table.Head className="w-32">Created At</Table.Head>
              <Table.Head className="w-32">Updated At</Table.Head>
              <Table.Head className="w-10"></Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <Table>
            <Table.Body>
              {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))
                : channels?.map((channel: IChannel) => (
                    <Table.Row
                      key={channel._id}
                      onClick={() => onClick(channel._id)}
                      className="hover:cursor-pointer shadow-xs group/row"
                    >
                      <Table.Cell className="font-medium border-none pl-2 w-auto ">
                        <span className="w-full flex gap-2 text-base font-medium">
                          <span className="[1lh] flex items-center">
                            <IconComponent
                              name={channel.icon}
                              className="size-4"
                            />
                          </span>
                          <TextOverflowTooltip value={channel.name} />
                        </span>
                      </Table.Cell>

                      <Table.Cell className="border-none px-2 w-20 text-center">
                        {channel.memberCount}
                      </Table.Cell>
                      <Table.Cell className="border-none px-2 w-32 text-muted-foreground">
                        <DateDisplay date={channel.createdAt} />
                      </Table.Cell>
                      <Table.Cell className="border-none px-2 w-32 text-muted-foreground">
                        <DateDisplay date={channel.updatedAt} />
                      </Table.Cell>
                      <Table.Cell className="border-none px-2 w-10">
                        <DeleteChannel channelId={channel._id} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
            </Table.Body>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}

const TableRowSkeleton = () => (
  <Table.Row className="shadow-xs">
    <Table.Cell className="w-10 border-none pl-3">
      <Skeleton className="h-4 w-4" />
    </Table.Cell>

    <Table.Cell className="w-auto pl-8 border-none">
      <Skeleton className="h-4 w-10" />
    </Table.Cell>
    <Table.Cell className="w-20 border-none">
      <Skeleton className="h-4 w-5" />
    </Table.Cell>
    <Table.Cell className="w-32 pr-8 border-none">
      <Skeleton className="h-4 w-16" />
    </Table.Cell>
    <Table.Cell className="w-32 border-none">
      <Skeleton className="h-4 w-16" />
    </Table.Cell>
    <Table.Cell className="w-10 border-none">
      <Skeleton className="h-4 w-4" />
    </Table.Cell>
  </Table.Row>
);

export const DeleteChannel = ({ channelId }: { channelId: string }) => {
  const confirmationValue = 'delete';
  const confirmationMessage = 'Are you sure you want to delete this channel?';
  const { removeChannel, loading } = useChannelRemove();
  const { confirm } = useConfirm();
  const onDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    confirm({
      message: confirmationMessage,
      options: { confirmationValue },
    }).then(() => {
      removeChannel({ variables: { id: channelId } });
    });
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      className="aspect-square text-muted-foreground hover:text-destructive hover:bg-transparent group-hover/row:visible invisible transition-all duration-[50ms] ease-linear"
      onClick={onDelete}
      disabled={loading}
    >
      {loading ? <Spinner size={'sm'} /> : <IconTrash />}
    </Button>
  );
};

export const DateDisplay = ({ date }: { date: string }) => {
  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger>
          <div className="text-muted-foreground text-xs">
            {date ? format(new Date(date), 'MMM d, yyyy') : ''}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {format(new Date(date), 'MMM d, yyyy HH:mm')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

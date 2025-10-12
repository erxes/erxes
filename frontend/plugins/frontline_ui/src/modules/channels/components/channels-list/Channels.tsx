import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { format } from 'date-fns';
import {
  Skeleton,
  Table,
  ScrollArea,
  TextOverflowTooltip,
  IconComponent,
} from 'erxes-ui';
import { useNavigate } from 'react-router-dom';

export function Channels() {
  const { channels, loading } = useGetChannels();
  const navigate = useNavigate();
  const onClick = (channelId: string) => {
    navigate(`/settings/frontline/channels/details/${channelId}`);
  };
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
                : channels?.map((channel) => (
                    <Table.Row
                      key={channel._id}
                      onClick={() => onClick(channel._id)}
                      className="hover:cursor-pointer shadow-xs"
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

                      <Table.Cell className="border-none px-2 w-20">
                        {channel.memberCount}
                      </Table.Cell>
                      <Table.Cell className="border-none px-2 w-32 text-muted-foreground">
                        {channel.createdAt
                          ? format(new Date(channel.createdAt), 'MMM d, yyyy')
                          : ''}
                      </Table.Cell>
                      <Table.Cell className="border-none px-2 w-32 text-muted-foreground">
                        {channel.updatedAt
                          ? format(new Date(channel.updatedAt), 'MMM d, yyyy')
                          : ''}
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

const TableRowSkeleton = () => {
  return (
    <Table.Row className="shadow-xs">
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
    </Table.Row>
  );
};

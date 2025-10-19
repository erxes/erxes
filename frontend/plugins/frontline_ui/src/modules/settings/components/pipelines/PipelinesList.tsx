import { Skeleton, Table, TextOverflowTooltip } from 'erxes-ui';
import { format } from 'date-fns';
import { useGetPipelines } from '@/settings/hooks/usePipelines';
import { useNavigate } from 'react-router-dom';
import { MembersInline } from 'ui-modules';

export const PipelinesList = ({ channelId }: { channelId: string }) => {
  const { pipelines, loading } = useGetPipelines({
    variables: {
      filter: { channelId },
    },
  });

  const navigate = useNavigate();

  const onClick = (pipelineId: string) => {
    navigate(
      `/settings/frontline/channels/${channelId}/pipelines/${pipelineId}`,
    );
  };

  return (
    <div className="overflow-auto h-full px-8">
      <div className="bg-sidebar border border-sidebar pl-1 border-t-4 border-l-4 pb-2 pr-2 rounded-lg">
        <Table>
          <Table.Header>
            <Table.Row className="rounded-t-md">
              <Table.Head className="w-auto rounded-tl-md pl-2">
                Name
              </Table.Head>
              <Table.Head className="w-64">Created By</Table.Head>
              <Table.Head className="w-32">Updated At</Table.Head>
              <Table.Head className="w-32">Created At</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))
              : pipelines?.map((pipeline) => (
                  <Table.Row
                    key={pipeline._id}
                    onClick={() => onClick(pipeline._id)}
                    className="hover:cursor-pointer shadow-xs "
                  >
                    <Table.Cell className="font-medium border-none pl-2 w-auto ">
                      <span className="w-full flex gap-2 text-base font-medium">
                        {/* <span className="[1lh] flex items-center">
                          <IconComponent name={team.icon} className="size-4" />
                        </span> */}
                        <TextOverflowTooltip value={pipeline.name} />
                      </span>
                    </Table.Cell>
                    <Table.Cell className="border-none px-2 ">
                      <div className="flex items-center gap-2 text-base font-medium">
                        <MembersInline members={[pipeline.createdUser]} />
                      </div>
                    </Table.Cell>
                    <Table.Cell className="border-none px-2 ">
                      {format(pipeline.updatedAt, 'MMM d, yyyy')}
                    </Table.Cell>
                    <Table.Cell className="border-none px-2 text-muted-foreground">
                      {format(pipeline.createdAt, 'MMM d, yyyy')}
                    </Table.Cell>
                  </Table.Row>
                ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

const TableRowSkeleton = () => {
  return (
    <Table.Row className="shadow-xs">
      <Table.Cell className="w-auto pl-8 border-none">
        <Skeleton className="h-4 w-10" />
      </Table.Cell>
      <Table.Cell className="w-20 border-none">
        <Skeleton className="h-4 w-5" />
      </Table.Cell>
      <Table.Cell className="w-20 border-none">
        <Skeleton className="h-4 w-5" />
      </Table.Cell>
      <Table.Cell className="w-32 pr-8 border-none">
        <Skeleton className="h-4 w-16" />
      </Table.Cell>
    </Table.Row>
  );
};

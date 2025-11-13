import { Skeleton, Table, TextOverflowTooltip } from 'erxes-ui';
import { format } from 'date-fns';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import { useNavigate } from 'react-router-dom';
import { MembersInline } from 'ui-modules';
import { IconGitBranch } from '@tabler/icons-react';
import { CreatePipeline } from '@/pipelines/components/CreatePipeline';

export const PipelinesList = ({ channelId }: { channelId: string }) => {
  const { pipelines, loading } = useGetPipelines({
    variables: {
      filter: { channelId },
    },
  });
  const navigate = useNavigate();
  console.log('pipelines1:', pipelines);
  const onClick = (pipelineId: string) => {
    navigate(
      `/settings/frontline/channels/${channelId}/pipelines/${pipelineId}`,
    );
  };

  return (
    <div className="h-full px-8">
      <div className="bg-sidebar border border-sidebar pl-1 border-t-4 border-l-4 pb-2 pr-2 rounded-lg ">
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
              : pipelines?.filter(Boolean).map((pipeline) => (
                  <Table.Row
                    key={pipeline._id}
                    onClick={() => onClick(pipeline._id)}
                    className="hover:cursor-pointer shadow-xs "
                  >
                    <Table.Cell className="font-medium border-none pl-2 w-auto ">
                      <span className="w-full flex gap-2 text-base font-medium">
                        <TextOverflowTooltip
                          value={pipeline.name || 'Unnamed'}
                        />
                      </span>
                    </Table.Cell>
                    <Table.Cell className="border-none px-2 ">
                      <div className="flex items-center gap-2 text-base font-medium">
                        <MembersInline
                          members={
                            pipeline.createdUser ? [pipeline.createdUser] : []
                          }
                        />
                      </div>
                    </Table.Cell>
                    <Table.Cell className="border-none px-2 ">
                      {pipeline.updatedAt
                        ? format(new Date(pipeline.updatedAt), 'MMM d, yyyy')
                        : '-'}
                    </Table.Cell>
                    <Table.Cell className="border-none px-2 text-muted-foreground">
                      {pipeline.createdAt
                        ? format(new Date(pipeline.createdAt), 'MMM d, yyyy')
                        : '-'}
                    </Table.Cell>
                  </Table.Row>
                ))}
          </Table.Body>
        </Table>
        {!loading && (!pipelines || pipelines.length === 0) && (
          <div className=" h-full w-full px-8 flex justify-center">
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="mb-6">
                <IconGitBranch
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">No pipelines yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Get started by creating your first pipeline to organize and
                  manage your workflow processes.
                </p>
              </div>
              <CreatePipeline />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TableRowSkeleton = () => {
  return (
    <Table.Row className="shadow-xs">
      <Table.Cell className="w-auto pl-2 border-none">
        <Skeleton className="h-4 w-20" />
      </Table.Cell>
      <Table.Cell className="w-64 border-none pl-2">
        <Skeleton className="h-4 w-32" />
      </Table.Cell>
      <Table.Cell className="w-32 border-none pl-2">
        <Skeleton className="h-4 w-20" />
      </Table.Cell>
      <Table.Cell className="w-32 pl-2 border-none">
        <Skeleton className="h-4 w-20" />
      </Table.Cell>
    </Table.Row>
  );
};

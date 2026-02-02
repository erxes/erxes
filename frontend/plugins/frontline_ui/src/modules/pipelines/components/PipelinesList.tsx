import {
  Skeleton,
  Table,
  TextOverflowTooltip,
  Button,
  Spinner,
  useConfirm,
  ScrollArea,
  Tooltip,
  IconComponent,
} from 'erxes-ui';
import { format } from 'date-fns';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import { useNavigate } from 'react-router-dom';
import { MembersInline } from 'ui-modules';
import { IconGitBranch, IconTrash } from '@tabler/icons-react';
import { CreatePipeline } from '@/pipelines/components/CreatePipeline';
import { usePipelineRemove } from '@/pipelines/hooks/usePipelineRemove';

export const DeletePipeline = ({ pipelineId }: { pipelineId: string }) => {
  const confirmationValue = 'delete';
  const confirmationMessage = 'Are you sure you want to delete this pipeline?';
  const { removePipeline, loading } = usePipelineRemove();
  const { confirm } = useConfirm();
  const onDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    confirm({
      message: confirmationMessage,
      options: { confirmationValue },
    }).then(() => {
      removePipeline({ variables: { id: pipelineId } });
    });
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      className="aspect-square text-muted-foreground hover:text-destructive hover:bg-transparent group-hover/row:visible invisible transition-all duration-50 ease-linear"
      onClick={onDelete}
      disabled={loading}
    >
      {loading ? <Spinner size={'sm'} /> : <IconTrash />}
    </Button>
  );
};
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

  if (!loading && (!pipelines || pipelines.length === 0)) {
    return (
      <div className=" h-full w-full px-8 flex justify-center">
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
          <div className="mb-6">
            <IconGitBranch
              size={64}
              className="text-muted-foreground mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">No pipelines yet</h3>
            <p className="text-muted-foreground max-w-md">
              Get started by creating your first pipeline to organize and manage
              your workflow processes.
            </p>
          </div>
          <CreatePipeline />
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
              <Table.Head className="pl-2">Title</Table.Head>
              <Table.Head className="w-32 whitespace-nowrap">
                Created By
              </Table.Head>
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
                : pipelines?.map((pipeline: any) => (
                    <Table.Row
                      key={pipeline._id}
                      onClick={() => onClick(pipeline._id)}
                      className="hover:cursor-pointer shadow-xs group/row"
                    >
                      <Table.Cell className="font-medium border-none pl-2">
                        <span className="w-full flex gap-2 text-base font-medium">
                          <IconComponent
                            name={pipeline.icon}
                            className="size-4"
                          />
                          <TextOverflowTooltip value={pipeline.name} />
                        </span>
                      </Table.Cell>

                      <Table.Cell className="font-medium border-none pl-2 w-32">
                        {pipeline.createdUser ? (
                          <MembersInline.Provider
                            memberIds={[pipeline.createdUser._id]}
                          >
                            <span className="w-full flex gap-2 items-center">
                              <MembersInline.Avatar />
                              <MembersInline.Title />
                            </span>
                          </MembersInline.Provider>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </Table.Cell>

                      <Table.Cell className="border-none px-2 w-32 text-muted-foreground">
                        <DateDisplay date={pipeline.createdAt} />
                      </Table.Cell>
                      <Table.Cell className="pipeline-none px-2 w-32 text-muted-foreground">
                        <DateDisplay date={pipeline.updatedAt} />
                      </Table.Cell>
                      <Table.Cell className="border-none px-2 w-10">
                        <DeletePipeline pipelineId={pipeline._id} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
            </Table.Body>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};

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

export const DateDisplay = ({ date }: { date: string }) => (
  <Tooltip.Provider>
    <Tooltip>
      <Tooltip.Trigger asChild>
        <div className="text-muted-foreground text-xs cursor-default">
          {date ? format(new Date(date), 'MMM d, yyyy') : ''}
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content>
        {date ? format(new Date(date), 'MMM d, yyyy HH:mm') : ''}
      </Tooltip.Content>
    </Tooltip>
  </Tooltip.Provider>
);

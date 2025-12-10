import {
  Skeleton,
  Table,
  TextOverflowTooltip,
  ScrollArea,
  Tooltip,
  Button,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { format } from 'date-fns';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import { useNavigate } from 'react-router-dom';
import { IconGitBranch, IconTrash } from '@tabler/icons-react';
import { CreateResponse } from '@/responseTemplate/components/CreateResponse';
import { useRemoveResponse } from '../hooks/useRemoveResponse';
import React from 'react';

export const ResponseList = ({ channelId }: { channelId: string }) => {
  const { responses, loading } = useGetResponses({
    variables: {
      filter: { channelId },
    },
  });
  const navigate = useNavigate();

  const onClick = (responseId: string) => {
    navigate(
      `/settings/frontline/channels/${channelId}/response/${responseId}`,
    );
  };

  const hasData = !loading && (responses?.length ?? 0) > 0;

  return (
    <div className="bg-sidebar border border-sidebar border-t-4 border-l-4 rounded-lg">
      <Table>
        <Table.Header>
          <Table.Row className="rounded-t-md">
            <Table.Head className="pl-2 rounded-tl-md">Name</Table.Head>
            <Table.Head className="pl-2">Updated At</Table.Head>
            <Table.Head className="pl-2">Created At</Table.Head>
            <Table.Head className="w-10 rounded-tr-md"></Table.Head>
          </Table.Row>
        </Table.Header>
      </Table>

      <ScrollArea className="h-[calc(100vh-260px)]">
        <Table>
          <Table.Body>
            {loading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))}

            {hasData &&
              responses?.map((response) => (
                <Table.Row
                  key={response._id}
                  onClick={() => onClick(response._id)}
                  className="hover:bg-muted/50 cursor-pointer shadow-xs group/row"
                >
                  <Table.Cell className="pl-2 border-none font-medium">
                    <TextOverflowTooltip value={response.name || 'Unnamed'} />
                  </Table.Cell>

                  <Table.Cell className="border-none">
                    <DateDisplay date={response.updatedAt} />
                  </Table.Cell>

                  <Table.Cell className="border-none text-muted-foreground">
                    <DateDisplay date={response.createdAt} />
                  </Table.Cell>

                  <Table.Cell className="border-none">
                    <DeleteResponse responseId={response._id} />
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>

          {!loading && !hasData && (
            <div className="w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <IconGitBranch
                  size={64}
                  className="text-muted-foreground mb-4"
                />

                <h3 className="text-xl font-semibold mb-2">No responses yet</h3>

                <p className="text-muted-foreground max-w-md mb-6">
                  Get started by creating your first response to organize and
                  manage your workflow processes.
                </p>

                <CreateResponse />
              </div>
            </div>
          )}
        </Table>
      </ScrollArea>
    </div>
  );
};

const TableRowSkeleton = () => (
  <Table.Row className="shadow-xs">
    <Table.Cell className="pl-2 border-none">
      <Skeleton className="h-4 w-24" />
    </Table.Cell>
    <Table.Cell className="border-none">
      <Skeleton className="h-4 w-10" />
    </Table.Cell>
    <Table.Cell className="border-none">
      <Skeleton className="h-4 w-10" />
    </Table.Cell>
    <Table.Cell className="border-none">
      <Skeleton className="h-4 w-4" />
    </Table.Cell>
  </Table.Row>
);

export const DeleteResponse = ({ responseId }: { responseId: string }) => {
  const confirmationValue = 'delete';
  const confirmationMessage = 'Are you sure you want to delete this response?';
  const { removeResponse, loading } = useRemoveResponse();
  const { confirm } = useConfirm();
  const [error, setError] = React.useState<string | null>(null);

  const onDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    confirm({
      message: confirmationMessage,
      options: { confirmationValue },
    })
      .then(() => {
        removeResponse({
          variables: { id: responseId },
        }).catch((err) => {
          setError(err.message || 'Something went wrong');
        });
      })
      .catch(() => {
        setError('Something went wrong');
      });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="aspect-square text-muted-foreground hover:text-destructive hover:bg-transparent group-hover/row:visible invisible transition-all duration-50 ease-linear"
        onClick={onDelete}
        disabled={loading}
      >
        {loading ? <Spinner size="sm" /> : <IconTrash />}
      </Button>
      {error && <div className="text-destructive text-xs mt-1">{error}</div>}
    </>
  );
};

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

import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import {
  DropdownMenu,
  Empty,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Spinner,
  useConfirm,
} from 'erxes-ui';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { IResponseTemplate } from '../types';
import {
  IconCalendarEvent,
  IconClock,
  IconEdit,
  IconGitBranch,
  IconLabel,
  IconTrash,
} from '@tabler/icons-react';
import { CreateResponse } from '@/responseTemplate/components/CreateResponse';
import { useRemoveResponse } from '../hooks/useRemoveResponse';
import { useNavigate } from 'react-router-dom';
import { ResponseCommandBar } from './command-bar/response-command-bar';

export const DeleteResponse = ({ responseId }: { responseId: string }) => {
  const { removeResponse, loading } = useRemoveResponse();
  const { confirm } = useConfirm();

  const onDelete = () => {
    confirm({
      message: 'Are you sure you want to delete this response?',
      options: { confirmationValue: 'delete' },
    })
      .then(() => {
        removeResponse({ variables: { id: responseId } });
      })
      .catch(() => {});
  };

  return (
    <DropdownMenu.Item
      onSelect={onDelete}
      className="text-destructive focus:text-destructive"
    >
      {loading ? <Spinner size="sm" /> : <IconTrash />}
      Delete
    </DropdownMenu.Item>
  );
};

const ResponseMoreCell = ({
  cell,
}: {
  cell: Cell<IResponseTemplate, unknown>;
}) => {
  const { _id, channelId } = cell.row.original;
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="bottom" align="start">
        <DropdownMenu.Item
          onSelect={() =>
            navigate(
              `/settings/frontline/channels/${channelId}/response/${_id}`,
            )
          }
        >
          <IconEdit />
          Edit
        </DropdownMenu.Item>
        <DeleteResponse responseId={_id} />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const responseColumns: ColumnDef<IResponseTemplate>[] = [
  { id: 'more', size: 30, cell: ResponseMoreCell },
  RecordTable.checkboxColumn as ColumnDef<IResponseTemplate>,
  {
    accessorKey: 'name',
    id: 'name',
    header: () => <RecordTable.InlineHead label="Name" icon={IconLabel} />,
    size: 250,
    cell: ({ cell }) => {
      const navigate = useNavigate();
      const { _id, channelId } = cell.row.original;
      return (
        <RecordTableInlineCell>
          <RecordTableInlineCell.Anchor
            onClick={() =>
              navigate(
                `/settings/frontline/channels/${channelId}/response/${_id}`,
              )
            }
          >
            {cell.getValue() as string}
          </RecordTableInlineCell.Anchor>
        </RecordTableInlineCell>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    id: 'updatedAt',
    header: () => (
      <RecordTable.InlineHead label="Updated At" icon={IconClock} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <RelativeDateDisplay.Value value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    accessorKey: 'createdAt',
    id: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label="Created At" icon={IconCalendarEvent} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <RelativeDateDisplay.Value value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
];

export const ResponseList = ({ channelId }: { channelId: string }) => {
  const { responses, loading, handleFetchMore, pageInfo } = useGetResponses({
    variables: {
      filter: { channelId },
    },
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (responses?.length === 0) {
    return (
      <Empty className="bg-sidebar rounded-lg m-3">
        <Empty.Header>
          <Empty.Media>
            <IconGitBranch />
          </Empty.Media>
          <Empty.Title>No responses yet</Empty.Title>
          <Empty.Description>
            Get started by creating your first response
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <CreateResponse />
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={responseColumns as unknown as ColumnDef<IResponseTemplate>[]}
      data={responses || []}
      className="my-3 mx-7"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={responses?.length}
        sessionKey="responses_cursor"
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <ResponseCommandBar />
    </RecordTable.Provider>
  );
};

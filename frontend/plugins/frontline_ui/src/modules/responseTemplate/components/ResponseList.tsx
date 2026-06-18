import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import {
  Combobox,
  Command,
  Empty,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  Spinner,
  Tooltip,
  useConfirm,
  useMultiQueryState,
} from 'erxes-ui';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { IResponseTemplate } from '../types';
import { IconEdit, IconGitBranch, IconTrash } from '@tabler/icons-react';
import { CreateResponse } from '@/responseTemplate/components/CreateResponse';
import { useRemoveResponse } from '../hooks/useRemoveResponse';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const DateDisplay = ({ date }: { date: string }) => {
  if (!date) return null;
  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger>
          <div className="text-muted-foreground text-xs">
            {format(new Date(date), 'MMM d, yyyy')}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {format(new Date(date), 'MMM d, yyyy HH:mm')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

const ResponseMoreCell = ({
  cell,
}: {
  cell: Cell<IResponseTemplate, unknown>;
}) => {
  const { _id, channelId } = cell.row.original;
  const navigate = useNavigate();
  const { removeResponse, loading } = useRemoveResponse();
  const { confirm } = useConfirm();

  const handleEdit = () => {
    navigate(`/settings/frontline/channels/${channelId}/response/${_id}`);
  };

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete this response?',
      options: { confirmationValue: 'delete' },
    })
      .then(() => {
        removeResponse({ variables: { id: _id } });
      });
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item
              value="delete"
              onSelect={handleDelete}
              className="text-destructive"
            >
              {loading ? <Spinner size="sm" /> : <IconTrash />} Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const ResponseNameCell = ({
  cell,
}: {
  cell: Cell<IResponseTemplate, unknown>;
}) => {
  const navigate = useNavigate();
  const { _id, channelId } = cell.row.original;
  return (
    <RecordTableInlineCell
      onClick={() =>
        navigate(`/settings/frontline/channels/${channelId}/response/${_id}`)
      }
    >
      {cell.getValue() as string}
    </RecordTableInlineCell>
  );
};

export const responseColumns: ColumnDef<IResponseTemplate>[] = [
  {
    id: 'more',
    size: 45,
    minSize: 45,
    maxSize: 45,
    cell: ResponseMoreCell,
  },
  {
    accessorKey: 'name',
    id: 'name',
    header: 'title',
    size: 400,
    cell: ResponseNameCell,
  },
  {
    accessorKey: 'createdAt',
    id: 'createdAt',
    header: 'created at',
    size: 120,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="justify-center">
        <DateDisplay date={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    accessorKey: 'updatedAt',
    id: 'updatedAt',
    header: 'updated at',
    size: 120,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="justify-center">
        <DateDisplay date={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
];

export const ResponseList = ({ channelId }: { channelId: string }) => {
  const [{ searchValue }] = useMultiQueryState<{ searchValue?: string }>([
    'searchValue',
  ]);

  const { responses, isInitialLoad, handleFetchMore, pageInfo } = useGetResponses({
    variables: {
      filter: { channelId, searchValue: searchValue || undefined },
    },
  });

  if (!isInitialLoad && responses?.length === 0) {
    return (
      <Empty className="bg-sidebar rounded-lg m-3">
        <Empty.Header>
          <Empty.Media>
            <IconGitBranch />
          </Empty.Media>
          <Empty.Title>
            {searchValue ? 'No results found' : 'No responses yet'}
          </Empty.Title>
          <Empty.Description>
            {searchValue
              ? 'Try a different search term'
              : 'Get started by creating your first response'}
          </Empty.Description>
        </Empty.Header>
        {!searchValue && (
          <Empty.Content>
            <CreateResponse />
          </Empty.Content>
        )}
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={responseColumns as unknown as ColumnDef<IResponseTemplate>[]}
      data={responses || []}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={responses?.length}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton handleFetchMore={handleFetchMore} />
            {isInitialLoad && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton handleFetchMore={handleFetchMore} />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

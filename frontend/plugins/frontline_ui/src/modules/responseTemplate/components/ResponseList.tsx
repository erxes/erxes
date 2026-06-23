import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import { useTranslation } from 'react-i18next';
import {
  Combobox,
  Command,
  Empty,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Spinner,
  useConfirm,
  useMultiQueryState,
} from 'erxes-ui';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { IResponseTemplate } from '../types';
import {
  IconAlignLeft,
  IconCalendarPlus,
  IconCalendarUp,
  IconEdit,
  IconGitBranch,
  IconTrash,
} from '@tabler/icons-react';
import { CreateResponse } from '@/responseTemplate/components/CreateResponse';
import { useRemoveResponse } from '../hooks/useRemoveResponse';
import { useNavigate } from 'react-router-dom';

const ResponseMoreCell = ({
  cell,
}: {
  cell: Cell<IResponseTemplate, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, channelId } = cell.row.original;
  const navigate = useNavigate();
  const { removeResponse, loading } = useRemoveResponse();
  const { confirm } = useConfirm();

  const handleEdit = () => {
    navigate(`/settings/frontline/channels/${channelId}/response/${_id}`);
  };

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete-response'),
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
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item
              value="delete"
              onSelect={handleDelete}
              className="text-destructive"
            >
              {loading ? <Spinner size="sm" /> : <IconTrash />} {t('delete')}
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

export const useResponseColumns = (): ColumnDef<IResponseTemplate>[] => {
  const { t } = useTranslation('frontline');
  return [
    {
      id: 'more',
      size: 25,
      cell: ResponseMoreCell,
    },
    {
      accessorKey: 'name',
      id: 'name',
      header: () => <RecordTable.InlineHead label={t('title-label')} icon={IconAlignLeft} />,
      size: 400,
      cell: ResponseNameCell,
    },
    {
      accessorKey: 'createdAt',
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead label={t('created-at')} icon={IconCalendarPlus} />
      ),
      size: 120,
      cell: ({ cell }) => (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      ),
    },
    {
      accessorKey: 'updatedAt',
      id: 'updatedAt',
      header: () => (
        <RecordTable.InlineHead label={t('updated-at-label')} icon={IconCalendarUp} />
      ),
      size: 120,
      cell: ({ cell }) => (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      ),
    },
  ];
};

export const ResponseList = ({ channelId }: { channelId: string }) => {
  const { t } = useTranslation('frontline');
  const responseColumns = useResponseColumns();
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
            {searchValue ? t('no-results-found') : t('no-responses-yet')}
          </Empty.Title>
          <Empty.Description>
            {searchValue
              ? t('try-different-search-term')
              : t('get-started-creating-first-response')}
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

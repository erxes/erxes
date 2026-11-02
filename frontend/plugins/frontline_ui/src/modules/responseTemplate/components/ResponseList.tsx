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
  IconArrowBarToRight,
  IconCalendarPlus,
  IconCalendarUp,
  IconEdit,
  IconGitBranch,
  IconTrash,
} from '@tabler/icons-react';
import { CreateResponse } from '@/responseTemplate/components/CreateResponse';
import { useRemoveResponse } from '../hooks/useRemoveResponse';
import { MoveToChannelDialog } from '@/channels/components/move-resources/MoveToChannelDialog';
import { ChannelResourceType } from '@/channels/types';
import { useState } from 'react';
import { useSidePanel } from 'ui-modules';
import { RESPONSE_TEMPLATE_CONTENT_TYPE } from '@/settings/constants/recordPanels';

const ResponseListMenu = ({
  onEdit,
  onDelete,
  loading,
  onMove,
}: {
  onEdit: () => void;
  onDelete: () => void;
  loading: boolean;
  onMove: () => void;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  return (
    <Command shouldFilter={false}>
      <Command.List>
        <Command.Item value="edit" onSelect={onEdit}>
          <IconEdit /> {t('edit', 'Edit')}
        </Command.Item>
        <Command.Item value="move" onSelect={onMove}>
          <IconArrowBarToRight />
          {t('move-to-channel', 'Move to Channel')}
        </Command.Item>
        <Command.Item
          value="delete"
          onSelect={onDelete}
          className="text-destructive"
        >
          {loading ? <Spinner size="sm" /> : <IconTrash />}{' '}
          {t('delete', 'Delete')}
        </Command.Item>
      </Command.List>
    </Command>
  );
};

const ResponseMoreCell = ({
  cell,
}: {
  cell: Cell<IResponseTemplate, unknown>;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  const { _id, channelId } = cell.row.original;
  const { openRecord } = useSidePanel();
  const { removeResponse, loading } = useRemoveResponse();
  const { confirm } = useConfirm();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const handleEdit = () => {
    setMenuOpen(false);
    openRecord({ contentType: RESPONSE_TEMPLATE_CONTENT_TYPE, contentId: _id });
  };

  const handleDelete = () => {
    confirm({
      message: t(
        'confirm-delete-response',
        'Are you sure you want to delete this response?',
      ),
      options: { confirmationValue: 'delete' },
    }).then(() => {
      removeResponse({ variables: { id: _id } });
    });
  };

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content>
          <ResponseListMenu
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
            onMove={() => {
              setMenuOpen(false);
              setMoveOpen(true);
            }}
          />
        </Combobox.Content>
      </Popover>
      <MoveToChannelDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        resourceType={ChannelResourceType.RESPONSE_TEMPLATE}
        resourceIds={[_id]}
        sourceChannelId={channelId ?? ''}
      />
    </>
  );
};

const ResponseNameCell = ({
  cell,
}: {
  cell: Cell<IResponseTemplate, unknown>;
}) => {
  const { openRecord } = useSidePanel();
  const { _id } = cell.row.original;
  return (
    <RecordTableInlineCell
      onClick={() =>
        openRecord({
          contentType: RESPONSE_TEMPLATE_CONTENT_TYPE,
          contentId: _id,
        })
      }
    >
      {cell.row.original.name}
    </RecordTableInlineCell>
  );
};

const ResponseDateCell = ({ value }: { value?: string | null }) => {
  if (!value) return <RecordTableInlineCell>-</RecordTableInlineCell>;
  return (
    <RelativeDateDisplay value={value} asChild>
      <RecordTableInlineCell>
        <RelativeDateDisplay.Value value={value} />
      </RecordTableInlineCell>
    </RelativeDateDisplay>
  );
};

export const useResponseColumns = (): ColumnDef<IResponseTemplate>[] => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  return [
    {
      id: 'more',
      size: 33,
      cell: ResponseMoreCell,
    },
    {
      accessorKey: 'name',
      id: 'name',
      header: () => (
        <RecordTable.InlineHead
          label={t('title-label', 'Title')}
          icon={IconAlignLeft}
        />
      ),
      size: 400,
      cell: ResponseNameCell,
    },
    {
      accessorKey: 'createdAt',
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead
          label={t('created-at', 'Created at')}
          icon={IconCalendarPlus}
        />
      ),
      size: 120,
      cell: ({ cell }) => (
        <ResponseDateCell value={cell.row.original.createdAt} />
      ),
    },
    {
      accessorKey: 'updatedAt',
      id: 'updatedAt',
      header: () => (
        <RecordTable.InlineHead
          label={t('updated-at-label', 'Updated At')}
          icon={IconCalendarUp}
        />
      ),
      size: 120,
      cell: ({ cell }) => (
        <ResponseDateCell value={cell.row.original.updatedAt} />
      ),
    },
  ];
};

export const ResponseList = ({ channelId }: { channelId: string }) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.response-template',
  });
  const responseColumns = useResponseColumns();
  const [{ searchValue }] = useMultiQueryState<{ searchValue?: string }>([
    'searchValue',
  ]);

  const { responses, isInitialLoad, handleFetchMore, pageInfo } =
    useGetResponses({
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
            {searchValue
              ? t('no-results-found', 'No results found')
              : t('no-responses-yet', 'No responses yet')}
          </Empty.Title>
          <Empty.Description>
            {searchValue
              ? t('try-different-search-term', 'Try a different search term')
              : t(
                  'get-started-creating-first-response',
                  'Get started by creating your first response',
                )}
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
      columns={responseColumns}
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
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {isInitialLoad && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

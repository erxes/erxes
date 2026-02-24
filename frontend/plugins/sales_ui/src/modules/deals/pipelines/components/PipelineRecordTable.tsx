import {
  Badge,
  Combobox,
  Command,
  Input,
  PageSubHeader,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RecordTableTree,
  RelativeDateDisplay,
  useConfirm,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  IconArchive,
  IconArrowBack,
  IconCalendarTime,
  IconCopy,
  IconEdit,
  IconSettings,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import {
  usePipelineArchive,
  usePipelineCopy,
  usePipelineEdit,
  usePipelineRemove,
  usePipelines,
} from '@/deals/boards/hooks/usePipelines';

import { IPipeline } from '@/deals/types/pipelines';
import React from 'react';

export const PipelineMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IPipeline & { hasChildren: boolean }, unknown>;
}) => {
  const confirmOptions = { confirmationValue: 'delete' };
  const { confirm } = useConfirm();
  const [, setOpen] = useMultiQueryState<{
    pipelineId: string;
    tab: string;
  }>(['pipelineId', 'tab']);
  const { removePipeline, loading: removeLoading } = usePipelineRemove();
  const { copyPipeline } = usePipelineCopy();
  const { archivePipeline } = usePipelineArchive();

  const { _id, status } = cell.row.original;

  const onRemove = () => {
    confirm({
      message: 'Are you sure you want to remove the selected?',
      options: confirmOptions,
    }).then(async () => {
      try {
        removePipeline({
          variables: {
            _id,
          },
        });
      } catch (e) {
        console.error(e.message);
      }
    });
  };

  const onDuplicate = () => {
    confirm({
      message:
        'This will duplicate the current pipeline. Are you absolutely sure?',
    }).then(async () => {
      try {
        copyPipeline({
          variables: {
            _id,
          },
        });
      } catch (e) {
        console.error(e.message);
      }
    });
  };

  const onArchive = () => {
    confirm({
      message: `This will ${
        status === 'active' ? 'archive' : 'unarchive'
      } the current pipeline. Are you absolutely sure?`,
    }).then(async () => {
      try {
        archivePipeline({
          variables: {
            _id,
          },
        });
      } catch (e) {
        console.error(e.message);
      }
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
            <Command.Item
              value="edit"
              onSelect={() => setOpen({ pipelineId: _id, tab: null })}
            >
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item value="duplicate" onSelect={onDuplicate}>
              <IconCopy /> Duplicate
            </Command.Item>
            <Command.Item value="archive" onSelect={onArchive}>
              {status === 'active' ? (
                <>
                  <IconArchive /> Archive
                </>
              ) : (
                <>
                  <IconArrowBack /> Unarchive
                </>
              )}
            </Command.Item>
            <Command.Item
              value="productConfig"
              onSelect={() => {
                setOpen({ pipelineId: _id, tab: 'productConfig' });
              }}
            >
              <IconSettings /> Product config
            </Command.Item>
            <Command.Item
              disabled={removeLoading}
              value="remove"
              onSelect={onRemove}
            >
              <IconTrash /> Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const pipelinesColumns: ColumnDef<
  IPipeline & { hasChildren: boolean; type?: string }
>[] = [
  {
    id: 'more',
    cell: PipelineMoreColumnCell,
    size: 33,
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    cell: ({ cell }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { pipelineEdit, loading } = usePipelineEdit();
      const { _id, name, type } = cell.row.original;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [open, setOpen] = React.useState<boolean>(false);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [_name, setName] = React.useState<string>(name);

      const onSave = () => {
        if (name !== _name) {
          pipelineEdit({
            variables: {
              id: _id,
              type: type,
              name: _name,
            },
          });
        }
      };

      const onChange = (el: React.ChangeEvent<HTMLInputElement>) => {
        setName(el.currentTarget.value);
      };

      return (
        <Popover
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
              onSave();
            }
          }}
        >
          <RecordTableInlineCell.Trigger>
            <RecordTableTree.Trigger
              // order={cell.row.original.order || ''}
              order=""
              name={cell.getValue() as string}
              hasChildren={cell.row.original.hasChildren}
            >
              {cell.getValue() as string}
            </RecordTableTree.Trigger>
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <Input value={_name} onChange={onChange} disabled={loading} />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
    size: 300,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ cell }) => {
      const status = cell.getValue() as string;

      const variant =
        status === 'active'
          ? 'success'
          : status === 'archived'
            ? 'warning'
            : 'default';

      return (
        <RecordTableInlineCell>
          <Badge variant={variant}>{(cell.getValue() as string) || '-'}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarTime} label="Created At" />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'createdBy',
    accessorKey: 'createdUser.details.fullName',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Created by" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
];

const PipelineRecordTable = () => {
  const [queries] = useMultiQueryState<{
    contentType: string;
    searchValue: string;
    activeBoardId: string;
  }>(['contentType', 'searchValue', 'activeBoardId']);

  const { contentType, searchValue } = queries;

  const { pipelines, loading, pageInfo, handleFetchMore, totalCount } =
    usePipelines({
      variables: {
        type: contentType || '',
        searchValue: searchValue ?? undefined,
        boardId: queries.activeBoardId || '',
      },
    });

  return (
    <>
      <PageSubHeader>Pipelines ({totalCount})</PageSubHeader>
      <RecordTable.Provider
        columns={pipelinesColumns}
        data={pipelines || []}
        className="m-3"
        stickyColumns={['more', 'name']}
      >
        <RecordTableTree id="pipelines-list" ordered>
          <RecordTable.Scroll>
            <RecordTable className="w-full">
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.RowList Row={RecordTableTree.Row} />
                {loading && <RecordTable.RowSkeleton rows={30} />}
                {!loading && pageInfo?.hasNextPage && (
                  <RecordTable.RowSkeleton
                    rows={1}
                    handleInView={handleFetchMore}
                  />
                )}
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.Scroll>
        </RecordTableTree>
      </RecordTable.Provider>
    </>
  );
};

export default PipelineRecordTable;

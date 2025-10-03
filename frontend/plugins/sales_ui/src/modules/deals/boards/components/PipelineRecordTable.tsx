import {
  Badge,
  Combobox,
  Command,
  Input,
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
  IconCalendarTime,
  IconCopy,
  IconEdit,
  IconSettings,
  IconTemplate,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import {
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
  const [, setOpen] = useQueryState('pipelineId');
  const { removePipeline, loading } = usePipelineRemove();
  const { _id } = cell.row.original;

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
    console.log('duplicate');
  };

  const onTemplate = () => {
    console.log('template');
  };

  const onArchive = () => {
    console.log('archive');
  };

  const onProductConfig = () => {
    console.log('productConfig');
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
              onSelect={() => {
                setOpen(_id);
              }}
            >
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item value="duplicate" onSelect={onDuplicate}>
              <IconCopy /> Duplicate
            </Command.Item>
            <Command.Item value="template" onSelect={onTemplate}>
              <IconTemplate /> Save as template
            </Command.Item>
            <Command.Item value="archive" onSelect={onArchive}>
              <IconArchive /> Archive
            </Command.Item>
            <Command.Item value="productConfig" onSelect={onProductConfig}>
              <IconSettings /> Product config
            </Command.Item>
            <Command.Item disabled={loading} value="remove" onSelect={onRemove}>
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
  }>(['contentType', 'searchValue']);

  const { contentType, searchValue } = queries;

  const { pipelines, loading } = usePipelines({
    variables: {
      type: contentType || '',
      searchValue: searchValue ?? undefined,
    },
  });

  return (
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
              {/* {!loading && pageInfo?.hasNextPage && (
                <RecordTable.RowSkeleton
                  rows={1}
                  handleInView={handleFetchMore}
                />
              )} */}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTableTree>
    </RecordTable.Provider>
  );
};

export default PipelineRecordTable;

import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  RecordTable,
  useQueryState,
  Popover,
  Combobox,
  Command,
  useConfirm,
} from 'erxes-ui';
import { useCtaxRows } from '../hooks/useCtaxRows';
import { ICtaxRow } from '../types/CtaxRow';
import { CtaxRowsCommandbar } from './CtaxRowsCommandbar';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useCtaxRowsRemove } from '../hooks/useCtaxRowsRemove';
export const CtaxRowsTable = () => {
  const { ctaxRows, loading, handleFetchMore, totalCount } = useCtaxRows();

  return (
    <RecordTable.Provider columns={ctaxRowsColumns} data={ctaxRows || []}>
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {!loading && (totalCount ?? 0) > (ctaxRows?.length ?? 0) && (
              <RecordTable.RowSkeleton
                rows={4}
                handleInView={handleFetchMore}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <CtaxRowsCommandbar />
    </RecordTable.Provider>
  );
};
export const CtaxMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICtaxRow, unknown>;
}) => {
  const [, setOpen] = useQueryState('ctax_row_id');
  const { confirm } = useConfirm();
  const { removeCtaxRows } = useCtaxRowsRemove();
  const handleEdit = () => {
    setOpen(cell.row.original._id);
  };

  const handleDelete = () =>
    confirm({
      message: 'Are you sure you want to delete this account?',
      options: {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      removeCtaxRows({
        variables: { ctaxRowIds: [cell.row.original._id] },
      });
    });

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
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const ctaxRowMoreColumn = {
  id: 'more',
  cell: CtaxMoreColumnCell,
  size: 33,
};

export const ctaxRowsColumns: ColumnDef<ICtaxRow>[] = [
  ctaxRowMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ICtaxRow>,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <RecordTable.InlineHead label="Дугаар" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
    size: 250,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Нэр" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
    size: 250,
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => <RecordTable.InlineHead label="Төрөл" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="Төлөв" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
  },
  {
    id: 'percent',
    accessorKey: 'percent',
    header: () => <RecordTable.InlineHead label="Хувь" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
  },
];

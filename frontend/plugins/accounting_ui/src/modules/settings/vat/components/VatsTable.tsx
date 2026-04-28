import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  RecordTable,
  useQueryState,
  Popover,
  Combobox,
  Command,
  useConfirm,
  toast,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useVatRows } from '../hooks/useVatRows';
import { useVatRowsRemove } from '../hooks/useVatRowsRemove';
import { vatRowDetailAtom } from '../states/vatRowStates';
import { IVatRow } from '../types/VatRow';
import { VatRowsCommandbar } from './VatRowsCommandbar';
import { IconEdit, IconTrash } from '@tabler/icons-react';

export const VatRowsTable = () => {
  const { vatRows, loading, handleFetchMore, totalCount } = useVatRows();

  return (
    <RecordTable.Provider columns={vatRowsColumns} data={vatRows || []}>
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {!loading && (totalCount ?? 0) > (vatRows?.length ?? 0) && (
              <RecordTable.RowSkeleton
                rows={4}
                handleInView={handleFetchMore}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <VatRowsCommandbar />
    </RecordTable.Provider>
  );
};

export const VatRowMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IVatRow, unknown>;
}) => {
  const [, setOpen] = useQueryState('vat_row_id');
  const setVatRowDetail = useSetAtom(vatRowDetailAtom);
  const { confirm } = useConfirm();
  const { removeVatRows } = useVatRowsRemove();

  const handleEdit = () => {
    setVatRowDetail(cell.row.original);
    setOpen(cell.row.original._id);
  };

  const handleDelete = () =>
    confirm({
      message: 'Are you sure you want to delete this VAT row?',
      options: {
        okLabel: 'Delete',
        cancelLabel: 'Cancel',
      },
    }).then(() => {
      removeVatRows({
        variables: { vatRowIds: [cell.row.original._id] },
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          toast({
            title: 'Success',
            description: 'Vat rows deleted successfully',
          });
        },
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

export const vatRowMoreColumn = {
  id: 'more',
  cell: VatRowMoreColumnCell,
  size: 33,
};

export const vatRowsColumns: ColumnDef<IVatRow>[] = [
  vatRowMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IVatRow>,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <RecordTable.InlineHead label="Number" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
    size: 250,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Name" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
    size: 250,
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => <RecordTable.InlineHead label="Kind" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="Status" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
  },
  {
    id: 'percent',
    accessorKey: 'percent',
    header: () => <RecordTable.InlineHead label="Percent" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
  },
];

export const VatMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IVatRow, unknown>;
}) => {
  return <RecordTable.MoreButton />;
};

export const vatMoreColumn = {
  id: 'more',
  cell: VatMoreColumnCell,
  size: 33,
};

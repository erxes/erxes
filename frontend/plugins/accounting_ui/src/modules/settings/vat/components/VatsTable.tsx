import { Cell, ColumnDef } from '@tanstack/react-table';
import { RecordTable, useQueryState, } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useVatRows } from '../hooks/useVatRows';
import { vatRowDetailAtom } from '../states/vatRowStates';
import { IVatRow } from '../types/VatRow';
import { VatRowsCommandbar } from './VatRowsCommandbar';

export const VatRowsTable = () => {
  const { vatRows, loading, handleFetchMore, totalCount } = useVatRows();

  return (
    <RecordTable.Provider
      columns={vatRowsColumns}
      data={vatRows || []}
    >
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
  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setVatRowDetail(cell.row.original);
        setOpen(cell.row.original._id);
      }}
    />
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

export const VatMoreColumnCell = ({ cell }: { cell: Cell<IVatRow, unknown> }) => {
  return <RecordTable.MoreButton />;
};

export const vatMoreColumn = {
  id: 'more',
  cell: VatMoreColumnCell,
  size: 33,
};

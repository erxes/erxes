import { Cell, ColumnDef } from '@tanstack/react-table';
import { RecordTable, useQueryState, } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useCtaxRows } from '../hooks/useCtaxRows';
import { ctaxRowDetailAtom } from '../states/ctaxRowStates';
import { ICtaxRow } from '../types/CtaxRow';
import { CtaxRowsCommandbar } from './CtaxRowsCommandbar';

export const CtaxRowsTable = () => {
  const { ctaxRows, loading, handleFetchMore, totalCount } = useCtaxRows();

  return (
    <RecordTable.Provider
      columns={ctaxRowsColumns}
      data={ctaxRows || []}
    >
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

export const CtaxRowMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICtaxRow, unknown>;
}) => {
  const [, setOpen] = useQueryState('ctax_row_id');
  const setCtaxRowDetail = useSetAtom(ctaxRowDetailAtom);
  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setCtaxRowDetail(cell.row.original);
        setOpen(cell.row.original._id);
      }}
    />
  );
};

export const ctaxRowMoreColumn = {
  id: 'more',
  cell: CtaxRowMoreColumnCell,
  size: 33,
};

export const ctaxRowsColumns: ColumnDef<ICtaxRow>[] = [
  ctaxRowMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ICtaxRow>,
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

export const CtaxMoreColumnCell = ({ cell }: { cell: Cell<ICtaxRow, unknown> }) => {
  return <RecordTable.MoreButton />;
};

export const ctaxMoreColumn = {
  id: 'more',
  cell: CtaxMoreColumnCell,
  size: 33,
};

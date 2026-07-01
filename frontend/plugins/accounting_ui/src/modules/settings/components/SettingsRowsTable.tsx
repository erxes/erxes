import { ColumnDef } from '@tanstack/react-table';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';

interface SettingsRowsTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading: boolean;
  totalCount?: number;
  handleFetchMore?: () => void;
  Commandbar: React.ComponentType;
}

export const SettingsRowsTable = <TData,>({
  columns,
  data,
  loading,
  totalCount,
  handleFetchMore,
  Commandbar,
}: SettingsRowsTableProps<TData>) => {
  const isInitialLoading = loading && !data?.length;

  return (
    <RecordTable.Provider
      columns={columns}
      data={isInitialLoading ? [] : data || []}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {isInitialLoading && <RecordTable.RowSkeleton rows={20} />}
            {!loading && (totalCount ?? 0) > (data?.length ?? 0) && (
              <RecordTable.RowSkeleton
                rows={4}
                handleInView={handleFetchMore}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <Commandbar />
    </RecordTable.Provider>
  );
};

export const getSharedRowColumns = <T,>(
  moreColumn: ColumnDef<T>,
): ColumnDef<T>[] => [
  moreColumn,
  RecordTable.checkboxColumn as ColumnDef<T>,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <RecordTable.InlineHead label="Дугаар" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
    size: 250,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Нэр" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
    size: 250,
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => <RecordTable.InlineHead label="Төрөл" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="Төлөв" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'percent',
    accessorKey: 'percent',
    header: () => <RecordTable.InlineHead label="Хувь" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
  },
];

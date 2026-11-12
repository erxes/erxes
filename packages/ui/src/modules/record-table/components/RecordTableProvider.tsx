import { createContext, useContext, useState, type HTMLAttributes, type ReactNode } from 'react';
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type Table,
  type TableOptions,
} from '@tanstack/react-table';
import { useColumnLayout } from '../hooks/useColumnLayout';
import { readRow } from '../utils/rowFields';
import { RecordTableContainer } from './RecordTableContainer';
import { RecordTableDnDProvider } from './RecordTableDnDProvider';

interface IRecordTableContext {
  /** Rows are typed `unknown` here: every table shares this context, whatever its data. */
  table: Table<unknown>;
  columnSelectorOpen: boolean;
  setColumnSelectorOpen: (open: boolean) => void;
}

const RecordTableContext = createContext<IRecordTableContext | null>(null);

export function useRecordTable() {
  const context = useContext(RecordTableContext);

  if (!context) {
    throw new Error('useRecordTable must be used within a RecordTableProvider.');
  }

  return context;
}

/** A row's `_id` or `id`, else tanstack's default (its index under its parent). */
const getRowId = (row: unknown, index: number, parent?: { id: string }) =>
  readRow(row).id ?? (parent ? `${parent.id}.${index}` : String(index));

export interface RecordTableProviderProps<TData> extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns: ColumnDef<TData>[];
  data: TData[];
  tableOptions?: Partial<TableOptions<TData>>;
  stickyColumns?: string[];
  tableId?: string;
}

export const RecordTableProvider = <TData,>({
  children,
  columns,
  data,
  tableOptions,
  stickyColumns,
  tableId,
  ...containerProps
}: RecordTableProviderProps<TData>) => {
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { state, setColumnOrder, ...layoutHandlers } = useColumnLayout({
    columnIds: columns.map((column) => column.id ?? ''),
    stickyColumns,
    tableId,
  });

  // oxlint-disable-next-line react/incompatible-library -- tanstack's useReactTable returns a mutable table; the app runs without the React Compiler, so nothing memoizes it
  const table = useReactTable({
    data,
    columns,
    defaultColumn: { maxSize: 800 },
    getCoreRowModel: getCoreRowModel(),
    state: { ...state, sorting, columnFilters, rowSelection },
    columnResizeMode: 'onChange',
    onColumnOrderChange: setColumnOrder,
    ...layoutHandlers,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getRowId,
    ...tableOptions,
  });

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- tanstack's Table is invariant in its row type; the shared context holds any table, and readers treat rows as unknown
  const shared = table as unknown as Table<unknown>;

  return (
    <RecordTableContext.Provider
      value={{ table: shared, columnSelectorOpen, setColumnSelectorOpen }}
    >
      <RecordTableDnDProvider setColumnOrder={setColumnOrder}>
        <RecordTableContainer table={shared} {...containerProps}>
          {children}
        </RecordTableContainer>
      </RecordTableDnDProvider>
    </RecordTableContext.Provider>
  );
};

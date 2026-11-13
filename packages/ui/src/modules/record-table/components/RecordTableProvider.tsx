import { createContext, useContext, useState, type HTMLAttributes, type ReactNode } from 'react';
import { shallow, useSelector } from '@tanstack/react-store';
import {
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type Table,
  type TableState,
} from '@tanstack/react-table';
import { useColumnLayout } from '../hooks/useColumnLayout';
import { readRow } from '../utils/rowFields';
import { RecordTableContainer } from './RecordTableContainer';
import { RecordTableDnDProvider } from './RecordTableDnDProvider';

/** What every record table can do: reorder, pin, size, resize and hide columns, select rows. */
const recordTableFeatures = tableFeatures({
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
});

export type RecordTableFeatures = typeof recordTableFeatures;

/** A record table column for rows of `TData`. */
export type RecordTableColumnDef<TData extends RowData> = ColumnDef<RecordTableFeatures, TData>;

/** Rows are typed `RowData` here: every table shares this context, whatever its data. */
export type RecordTableInstance = Table<RecordTableFeatures, RowData>;

interface IRecordTableContext {
  table: RecordTableInstance;
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

/**
 * Subscribes to the table's state and renders from what `select` returns. The table, its rows,
 * columns and headers are stable objects whose getters return new values as the state changes,
 * so the compiler would cache those reads; call them inside `select`, never during render.
 * `select` also runs again when the table's options (data, columns, layout) change.
 */
export const useRecordTableState = <T,>(
  select: (state: TableState<RecordTableFeatures>, table: RecordTableInstance) => T,
) => {
  const { table } = useRecordTable();

  return useSelector(table.store, (state) => select(state, table), { compare: shallow });
};

/** A row's `_id` or `id`, else tanstack's default (its index under its parent). */
const getRowId = (row: unknown, index: number, parent?: { id: string }) =>
  readRow(row).id ?? (parent ? `${parent.id}.${index}` : String(index));

export interface RecordTableProviderProps<
  TData extends RowData,
> extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns: RecordTableColumnDef<TData>[];
  data: TData[];
  stickyColumns?: string[];
  tableId?: string;
}

export const RecordTableProvider = <TData extends RowData>({
  children,
  columns,
  data,
  stickyColumns,
  tableId,
  ...containerProps
}: RecordTableProviderProps<TData>) => {
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);

  const { state, setColumnOrder, ...layoutHandlers } = useColumnLayout({
    columnIds: columns.map((column) => column.id ?? ''),
    stickyColumns,
    tableId,
  });

  // The column layout is React state, so a layout change renders the table again. Row
  // selection stays inside the table: a checkbox re-renders only what subscribes to it.
  const table = useTable(
    {
      features: recordTableFeatures,
      data,
      columns,
      defaultColumn: { maxSize: 800 },
      state,
      columnResizeMode: 'onChange',
      onColumnOrderChange: setColumnOrder,
      ...layoutHandlers,
      getRowId,
    },
    () => null,
  );

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- tanstack's Table is invariant in its row type; the shared context holds any table, and readers treat rows as RowData
  const shared = table as unknown as RecordTableInstance;

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

import {
  createContext,
  useContext,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { shallow, useSelector } from '@tanstack/react-store';
import type { VariantProps } from 'class-variance-authority';
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
import { RecordTableContainer, type recordTableContainerVariants } from './RecordTableContainer';
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

/** The order a list's rows come in: by a column, either way. The page sorts (usually its query). */
export interface TRecordTableSort {
  by: string;
  direction: 'asc' | 'desc';
}

interface IRecordTableSorting {
  sort: TRecordTableSort | null;
  /** The columns a click on their header sorts by. */
  columns: readonly string[];
  onChange: (sort: TRecordTableSort | null) => void;
}

interface IRecordTableContext {
  table: RecordTableInstance;
  /** Null: the table doesn't sort from its headers. */
  sorting: IRecordTableSorting | null;
  columnSelectorOpen: boolean;
  setColumnSelectorOpen: (open: boolean) => void;
  /** The id of a column's header cell, unique per table: cells are named by their column. */
  headId: (columnId: string) => string;
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

export interface RecordTableProviderProps<TData extends RowData>
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof recordTableContainerVariants> {
  children: ReactNode;
  columns: RecordTableColumnDef<TData>[];
  data: TData[];
  stickyColumns?: string[];
  tableId?: string;
  /**
   * Sorting by a click on a column's header: off, then ascending, then descending, then off.
   * `sortable` lists the columns that sort; the page orders the rows by `sort` (its query does)
   * and keeps it, e.g. in the URL. Without `onSortChange` no header sorts.
   */
  sort?: TRecordTableSort | null;
  sortable?: readonly string[];
  onSortChange?: (sort: TRecordTableSort | null) => void;
}

export const RecordTableProvider = <TData extends RowData>({
  children,
  columns,
  data,
  stickyColumns,
  tableId,
  sort = null,
  sortable,
  onSortChange,
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

  const shared = table as unknown as RecordTableInstance;
  const headPrefix = useId();

  const sorting = useMemo<IRecordTableSorting | null>(
    () => (onSortChange ? { sort, columns: sortable ?? [], onChange: onSortChange } : null),
    [sort, sortable, onSortChange],
  );

  const context = useMemo<IRecordTableContext>(
    () => ({
      table: shared,
      sorting,
      columnSelectorOpen,
      setColumnSelectorOpen,
      headId: (columnId) => `${headPrefix}-head-${columnId}`,
    }),
    [shared, sorting, columnSelectorOpen, headPrefix],
  );

  return (
    <RecordTableContext.Provider value={context}>
      <RecordTableDnDProvider setColumnOrder={setColumnOrder}>
        <RecordTableContainer table={shared} {...containerProps}>
          {children}
        </RecordTableContainer>
      </RecordTableDnDProvider>
    </RecordTableContext.Provider>
  );
};

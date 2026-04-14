import {
  createContext,
  forwardRef,
  HTMLAttributes,
  type ReactNode,
  useContext,
  useState,
  useEffect,
} from 'react';

import {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnSizingState,
  VisibilityState,
  getCoreRowModel,
  RowSelectionState,
  SortingState,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';

import RecordTableContainer from 'erxes-ui/modules/record-table/components/RecordTableContainer';
import { RecordTableDnDProvider } from 'erxes-ui/modules/record-table/components/RecordTableDnDProvider';
import { IRecordTableContext } from 'erxes-ui/modules/record-table/types/recordTableTypes';
import { useTablePreferences } from '../hooks/useTablePreferences';

const RecordTableContext = createContext<IRecordTableContext | null>(null);

export function useRecordTable() {
  const context = useContext(RecordTableContext);
  if (!context) {
    throw new Error(
      'useRecordTable must be used within a RecordTableProvider.',
    );
  }
  return context;
}

interface RecordTableProviderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns: ColumnDef<any>[];
  data: any[];
  tableOptions?: TableOptions<any>;
  stickyColumns?: string[];
  tableId?: string;
}

export const RecordTableProvider = forwardRef<
  HTMLDivElement,
  RecordTableProviderProps
>(
  (
    {
      children,
      columns,
      data,
      tableOptions,
      className,
      stickyColumns,
      tableId,
      ...restProps
    },
    ref,
  ) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const {
      prefs: { columnOrder, columnSizing, columnVisibility },
      savePrefs,
    } = useTablePreferences(tableId);
    const [colOrder, setColumnOrder] = useState<ColumnOrderState>(
      () => columnOrder || columns.map((c) => c.id || ''),
    );
    const [colVisibility, setColVisibility] = useState<VisibilityState>(
      columnVisibility || {},
    );
    const [colSizing, setColSizing] = useState<ColumnSizingState>(
      columnSizing || {},
    );
    const table = useReactTable({
      data,
      columns,
      defaultColumn: {
        maxSize: 800,
      },
      getCoreRowModel: getCoreRowModel(),
      state: {
        columnOrder: colOrder,
        columnSizing: colSizing,
        columnVisibility: colVisibility,
        columnPinning: {
          left: stickyColumns,
        },
        sorting,
        columnFilters,
        rowSelection,
      },
      columnResizeMode: 'onChange',
      onColumnOrderChange: setColumnOrder,
      onColumnSizingChange: setColSizing,
      onColumnVisibilityChange: setColVisibility,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onRowSelectionChange: setRowSelection,
      getRowId: (row) => row._id,
      ...tableOptions,
    });

    useEffect(() => {
      savePrefs({ columnOrder: colOrder });
    }, [colOrder, savePrefs]);

    useEffect(() => {
      savePrefs({ columnVisibility: colVisibility });
    }, [colVisibility, savePrefs]);

    useEffect(() => {
      savePrefs({ columnSizing: colSizing });
    }, [colSizing, savePrefs]);

    return (
      <RecordTableContext.Provider
        value={{
          table,
        }}
      >
        <RecordTableDnDProvider setColumnOrder={setColumnOrder}>
          <RecordTableContainer
            table={table}
            className={className}
            {...restProps}
            ref={ref}
          >
            {children}
          </RecordTableContainer>
        </RecordTableDnDProvider>
      </RecordTableContext.Provider>
    );
  },
);

RecordTableProvider.displayName = 'RecordTableProvider';

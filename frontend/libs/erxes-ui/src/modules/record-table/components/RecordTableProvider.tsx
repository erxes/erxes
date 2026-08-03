import {
  createContext,
  forwardRef,
  HTMLAttributes,
  type ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';

import {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
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
import { isStructuralColumn } from 'erxes-ui/modules/record-table/utils/columnUtils';
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
    const [columnSelectorOpen, setColumnSelectorOpen] = useState(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const {
      prefs: { columnOrder, columnPinning, columnSizing, columnVisibility },
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
    const [colPinning, setColPinning] = useState<ColumnPinningState>(
      () => columnPinning || { left: stickyColumns ?? [] },
    );
    const stickyKey = (stickyColumns ?? []).join(',');
    const isPinningTouched = useRef(false);
    useEffect(() => {
      if (columnPinning || isPinningTouched.current) return;
      setColPinning((prev) => ({
        ...prev,
        left: stickyKey ? stickyKey.split(',') : [],
      }));
    }, [columnPinning, stickyKey]);

    const columnIdsKey = columns.map((column) => column.id || '').join(',');
    useEffect(() => {
      setColumnOrder((prev) => {
        const ids = columnIdsKey.split(',').filter(Boolean);
        const known = prev.filter((id) => ids.includes(id));

        if (known.length === prev.length && known.length === ids.length) {
          return prev;
        }

        return [...known, ...ids.filter((id) => !known.includes(id))];
      });
    }, [columnIdsKey]);

    const structuralKey = columns
      .map((column) => column.id)
      .filter(
        (id): id is string => typeof id === 'string' && isStructuralColumn(id),
      )
      .join(',');
    const pinning = useMemo<ColumnPinningState>(() => {
      const left = colPinning.left ?? [];
      const structural = (structuralKey ? structuralKey.split(',') : []).filter(
        (id) => !left.includes(id),
      );

      if (!left.length || !structural.length) return colPinning;

      return { ...colPinning, left: [...structural, ...left] };
    }, [colPinning, structuralKey]);
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
        columnPinning: pinning,
        sorting,
        columnFilters,
        rowSelection,
      },
      columnResizeMode: 'onChange',
      onColumnOrderChange: setColumnOrder,
      onColumnSizingChange: setColSizing,
      onColumnVisibilityChange: setColVisibility,
      onColumnPinningChange: (updater) => {
        isPinningTouched.current = true;
        setColPinning(updater);
      },
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
      savePrefs({ columnPinning: colPinning });
    }, [colPinning, savePrefs]);

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
          columnSelectorOpen,
          setColumnSelectorOpen,
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

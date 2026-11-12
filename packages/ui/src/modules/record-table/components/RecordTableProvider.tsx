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

export interface RecordTableProviderProps extends HTMLAttributes<HTMLDivElement> {
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
      prefs: { columnOrder, columnPinning, columnSizing, columnVisibility, stickyColumns: savedSticky },
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
    // Columns the saved preferences already knew: a column added later is new.
    const seenIds = useRef(new Set<string>(columnOrder ?? columns.map((c) => c.id || '')));
    // What was meant to stick when the pinning was saved; older preferences
    // didn't say, so their missing sticky columns are pinned once.
    const savedStickyRef = useRef(savedSticky);
    useEffect(() => {
      const ids = columnIdsKey.split(',').filter(Boolean);

      setColumnOrder((prev) => {
        const known = prev.filter((id) => ids.includes(id));

        if (known.length === prev.length && known.length === ids.length) {
          return prev;
        }

        // A new column goes where it is defined (after the nearest column
        // before it), not at the end of a saved order.
        const result = [...known];

        ids.forEach((id, index) => {
          if (result.includes(id)) return;

          let at = 0;

          for (let i = index - 1; i >= 0; i -= 1) {
            const position = result.indexOf(ids[i]);

            if (position >= 0) {
              at = position + 1;
              break;
            }
          }

          result.splice(at, 0, id);
        });

        return result;
      });

      // A new column that should stick is pinned too (after the pinned column before it).
      const sticky = stickyKey ? stickyKey.split(',') : [];
      const known = savedStickyRef.current;
      const fresh = sticky.filter(
        (id) => ids.includes(id) && (!seenIds.current.has(id) || !known || !known.includes(id)),
      );

      if (fresh.length) {
        setColPinning((prev) => {
          const left = [...(prev.left ?? [])];

          for (const id of fresh) {
            if (left.includes(id)) continue;

            const before = sticky.slice(0, sticky.indexOf(id)).reverse().find((other) => left.includes(other));

            left.splice(before ? left.indexOf(before) + 1 : left.length, 0, id);
          }

          return { ...prev, left };
        });
      }

      ids.forEach((id) => seenIds.current.add(id));
      // From now on a column the member unpins stays unpinned.
      savedStickyRef.current = sticky;
      savePrefs({ stickyColumns: sticky });
    }, [columnIdsKey, stickyKey, savePrefs]);

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
      // Old GraphQL records use `_id`; core REST records use `id`.
      getRowId: (row) => row._id ?? row.id,
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

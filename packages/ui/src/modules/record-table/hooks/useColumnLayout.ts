import { useEffect, useMemo, useState } from 'react';
import {
  functionalUpdate,
  type ColumnOrderState,
  type ColumnPinningState,
  type OnChangeFn,
} from '@tanstack/react-table';
import { isStructuralColumn } from '../utils/columnUtils';
import { fitKey, fitLayout, withStructuralFirst, type ColumnLayout } from '../utils/columnLayout';
import { useTablePreferences } from './useTablePreferences';

/**
 * Column order, pinning, sizing and visibility of a record table, restored from and saved to
 * the member's preferences for `tableId`. `stickyColumns` are pinned unless the member unpinned
 * them; a column that becomes sticky later is pinned once.
 */
export const useColumnLayout = ({
  columnIds,
  stickyColumns = [],
  tableId,
}: {
  columnIds: string[];
  stickyColumns: string[] | undefined;
  tableId: string | undefined;
}) => {
  const { prefs, savePrefs } = useTablePreferences(tableId);
  const [columnVisibility, setColumnVisibility] = useState(prefs.columnVisibility ?? {});
  const [columnSizing, setColumnSizing] = useState(prefs.columnSizing ?? {});
  const fit = { ids: columnIds, sticky: stickyColumns, followSticky: !prefs.columnPinning };

  const [layout, setLayout] = useState<ColumnLayout>(() =>
    fitLayout(
      {
        fittedTo: '',
        columnOrder: prefs.columnOrder ?? columnIds,
        columnPinning: prefs.columnPinning ?? { left: stickyColumns },
        seen: prefs.columnOrder ?? columnIds,
        sticky: prefs.stickyColumns,
        pinningTouched: false,
      },
      fit,
    ),
  );

  // The columns or sticky columns changed: fit the layout during this render.
  if (layout.fittedTo !== fitKey(columnIds, stickyColumns)) {
    setLayout(fitLayout(layout, fit));
  }

  const { columnOrder, columnPinning, sticky } = layout;

  useEffect(() => {
    savePrefs({
      columnOrder,
      columnPinning,
      columnVisibility,
      columnSizing,
      stickyColumns: sticky,
    });
  }, [columnOrder, columnPinning, columnVisibility, columnSizing, sticky, savePrefs]);

  const structuralKey = columnIds.filter(isStructuralColumn).join(',');

  const pinning = useMemo(() => {
    const left = columnPinning.left ?? [];
    const pinned = withStructuralFirst(left, structuralKey ? structuralKey.split(',') : []);

    return pinned === left ? columnPinning : { ...columnPinning, left: pinned };
  }, [columnPinning, structuralKey]);

  const setColumnOrder: OnChangeFn<ColumnOrderState> = (updater) =>
    setLayout((prev) => ({ ...prev, columnOrder: functionalUpdate(updater, prev.columnOrder) }));

  const onColumnPinningChange: OnChangeFn<ColumnPinningState> = (updater) =>
    setLayout((prev) => ({
      ...prev,
      pinningTouched: true,
      columnPinning: functionalUpdate(updater, prev.columnPinning),
    }));

  return {
    state: { columnOrder, columnSizing, columnVisibility, columnPinning: pinning },
    setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange,
  };
};

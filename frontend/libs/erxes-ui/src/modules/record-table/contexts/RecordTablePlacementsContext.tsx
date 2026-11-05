import type { ColumnDef } from '@tanstack/react-table';
import { useContext, type ComponentType } from 'react';
import { createSharedContext } from './sharedContext';
import { RecordTableContext } from './RecordTableContext';

/**
 * What code outside erxes-ui adds to every `RecordTable` by its `tableId`.
 * ui-modules provides it from the installed extensions.
 */
export type RecordTablePlacements = {
  /** Columns appended after the table's own. Keep the result stable per id. */
  columns: (tableId: string) => ColumnDef<{ _id: string }>[];
  /** Rendered at the end of a `CommandBar.Bar` inside the table. */
  BulkActions: ComponentType<{ tableId: string; contentIds: string[] }>;
};

const NO_COLUMNS: ColumnDef<{ _id: string }>[] = [];

export const RecordTablePlacementsContext =
  createSharedContext<RecordTablePlacements>('RecordTablePlacements', {
    columns: () => NO_COLUMNS,
    BulkActions: () => null,
  });

export const RecordTablePlacementsProvider =
  RecordTablePlacementsContext.Provider;

/** The bulk actions for the selected rows of the table around a command bar. */
export const RecordTableBulkActions = () => {
  const recordTable = useContext(RecordTableContext);
  const { BulkActions } = useContext(RecordTablePlacementsContext);
  const tableId = recordTable?.tableId;

  if (!recordTable || !tableId) {
    return null;
  }

  const contentIds = recordTable.table
    .getSelectedRowModel()
    .rows.map((row) => row.id);

  if (!contentIds.length) {
    return null;
  }

  return <BulkActions tableId={tableId} contentIds={contentIds} />;
};

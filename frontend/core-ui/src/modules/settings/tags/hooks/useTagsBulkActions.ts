import { RecordTable } from 'erxes-ui';
import { useMemo } from 'react';
import { TagTableRow } from './useTagsView';

export const useTagsBulkActions = () => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original as TagTableRow)
    .filter(
      (row) => row.rowType !== 'draft' && row.rowType !== 'context-group',
    );

  return useMemo(() => {
    const count = selectedRows.length;
    const onlyGroups = count > 0 && selectedRows.every((row) => row.isGroup);
    const onlyStandalone =
      count > 0 && selectedRows.every((row) => !row.isGroup && !row.parentId);
    const onlyChildren =
      count > 0 &&
      selectedRows.every((row) => !row.isGroup && Boolean(row.parentId));
    const canMove = onlyStandalone || onlyChildren;

    return {
      selectedRows,
      count,
      onlyGroups,
      onlyStandalone,
      onlyChildren,
      canMove,
      moveDisabledReason: canMove
        ? ''
        : 'Only standalone tags or only child tags can be moved together.',
      clearSelection: () => table.setRowSelection({}),
    };
  }, [selectedRows, table]);
};

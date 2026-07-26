import { Column } from '@tanstack/react-table';

export const STRUCTURAL_COLUMN_IDS = ['more', 'checkbox'];

export const isStructuralColumn = (columnId: string) =>
  STRUCTURAL_COLUMN_IDS.includes(columnId);

export const isFixedWidthColumn = (column: Column<any, unknown>) =>
  column.columnDef.enableResizing === false || isStructuralColumn(column.id);

import { Column } from '@tanstack/react-table';

export const STRUCTURAL_COLUMN_IDS = ['more', 'checkbox'];

export const isStructuralColumn = (columnId: string) =>
  STRUCTURAL_COLUMN_IDS.includes(columnId);

export const isFixedWidthColumn = <TData, TValue>(
  column: Column<TData, TValue>,
) => column.columnDef.enableResizing === false || isStructuralColumn(column.id);

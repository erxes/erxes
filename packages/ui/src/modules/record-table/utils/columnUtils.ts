import type { Column, RowData } from '@tanstack/react-table';
import type { RecordTableFeatures } from '../components/RecordTableProvider';

const STRUCTURAL_COLUMN_IDS = ['more', 'checkbox'];

export const isStructuralColumn = (columnId: string) => STRUCTURAL_COLUMN_IDS.includes(columnId);

export const isFixedWidthColumn = (column: Column<RecordTableFeatures, RowData>) =>
  column.columnDef.enableResizing === false || isStructuralColumn(column.id);

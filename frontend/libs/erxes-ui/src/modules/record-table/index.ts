import { RecordTableMoreButton } from './components/MoreColumn';
import { RecordTableHead } from './components/RecordTableHead';
import { RecordTableHeader } from './components/RecordTableHeader';
import {
  RecordTableProvider,
  useRecordTable,
} from './components/RecordTableProvider';
import { RecordTableRoot } from './components/RecordTableRoot';
import { RecordTableRowSkeleton } from './components/RecordTableRowSkeleton';
import { RecordTableCell } from './components/RecordTableCell';
import { RecordTableInlineHead } from './components/RecordTableInlineHead';
import { Table } from 'erxes-ui/components';
import { RecordTableRowList } from './components/RecordTableRowList';
import { RecordTableScroll } from './components/RecordTableScroll';
import {
  RecordTableBackwardSkeleton,
  RecordTableCursorProvider,
  RecordTableForwardSkeleton,
} from './components/RecordTableCursor';
import { checkboxColumn } from './components/CheckboxColumn';
import { RecordTableRow } from './components/RecordTableRow';

export const RecordTable = Object.assign(RecordTableRoot, {
  Provider: RecordTableProvider,
  Header: RecordTableHeader,
  Head: RecordTableHead,
  InlineHead: RecordTableInlineHead,
  RowList: RecordTableRowList,
  Body: Table.Body,
  Cell: RecordTableCell,
  useRecordTable: useRecordTable,
  RowSkeleton: RecordTableRowSkeleton,
  MoreButton: RecordTableMoreButton,
  checkboxColumn: checkboxColumn,
  Scroll: RecordTableScroll,
  CursorProvider: RecordTableCursorProvider,
  CursorBackwardSkeleton: RecordTableBackwardSkeleton,
  CursorForwardSkeleton: RecordTableForwardSkeleton,
  Row: RecordTableRow,
});

export * from './types/RecordTableCursorTypes';
export * from './hooks/useRecordTableCursor';
export * from './utils/cursorUtils';
export * from './components/RecordTableCellInline';
export * from './components/RecordTableTree';
export * from './contexts/RecordTableHotkeyContext';
export * from './components/RecordTableHotkeyCell';

export * from './states/RecordTableCursorState';

import { Table } from 'erxes-ui/components/table';
import { checkboxColumn } from './CheckboxColumn';
import { RecordTableMoreButton } from './MoreColumn';
import { RecordTableCell } from './RecordTableCell';
import { RecordTableColumnSelector } from './RecordTableColumnSelector';
import {
  RecordTableBackwardSkeleton,
  RecordTableCursorProvider,
  RecordTableForwardSkeleton,
} from './RecordTableCursor';
import { RecordTableHead } from './RecordTableHead';
import { RecordTableHeader } from './RecordTableHeader';
import { RecordTableInlineHead } from './RecordTableInlineHead';
import { RecordTableProvider, useRecordTable } from './RecordTableProvider';
import { RecordTableRoot } from './RecordTableRoot';
import { RecordTableRow } from './RecordTableRow';
import { RecordTableRowList } from './RecordTableRowList';
import { RecordTableRowSkeleton } from './RecordTableRowSkeleton';
import { RecordTableScroll } from './RecordTableScroll';

export const RecordTable = Object.assign(RecordTableRoot, {
  Provider: RecordTableProvider,
  Header: RecordTableHeader,
  Head: RecordTableHead,
  InlineHead: RecordTableInlineHead,
  RowList: RecordTableRowList,
  Body: Table.Body,
  Cell: RecordTableCell,
  useRecordTable,
  RowSkeleton: RecordTableRowSkeleton,
  MoreButton: RecordTableMoreButton,
  checkboxColumn,
  Scroll: RecordTableScroll,
  CursorProvider: RecordTableCursorProvider,
  CursorBackwardSkeleton: RecordTableBackwardSkeleton,
  CursorForwardSkeleton: RecordTableForwardSkeleton,
  Row: RecordTableRow,
  ColumnSelector: RecordTableColumnSelector,
});

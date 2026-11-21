import { Table } from 'erxes-ui/components/table';
import { checkboxColumn, checkboxColumnOf } from './CheckboxColumn';
import { RecordTableMoreButton } from './MoreColumn';
import { RecordTableCell } from './RecordTableCell';
import { RecordTableColumnSelector } from './RecordTableColumnSelector';
import {
  RecordTableBackwardSkeleton,
  RecordTableCursorProvider,
  RecordTableForwardSkeleton,
  useResetRecordTablePosition,
} from './RecordTableCursor';
import { RecordTableHead } from './RecordTableHead';
import { RecordTableHeader } from './RecordTableHeader';
import { onDemand } from 'erxes-ui/components/on-demand';
import { RecordTableInlineHead } from './RecordTableInlineHead';
import { RecordTableProvider, useRecordTable, useRecordTableState } from './RecordTableProvider';
import { RecordTableRoot } from './RecordTableRoot';
import { RecordTableRow } from './RecordTableRow';
import { RecordTableRowList } from './RecordTableRowList';
import { RecordTableRowSkeleton } from './RecordTableRowSkeleton';
import { RecordTableScroll } from './RecordTableScroll';

// A form table's arrow keys load on first use: only some plugin forms move through cells.
const hotkeys = () => import('./RecordTableHotkeys');

const RecordTableHotkeyProvider = onDemand(async () => (await hotkeys()).RecordTableHotkeyProvider);
const RecordTableHotKeyControl = onDemand(async () => (await hotkeys()).RecordTableHotKeyControl);

/**
 * The table every record list uses; never `Table` or a plain `<table>`.
 * `RecordTable.Provider` takes the `columns` and `data`; `checkboxColumn` adds row selection,
 * `ColumnSelector` lets a member pick columns, and `CursorProvider` with its skeletons loads
 * more rows by cursor, remembering where it was per `sessionKey` until `useResetPosition`
 * forgets it. `HotkeyProvider` and `HotKeyControl` move through a form table's cells
 * with the arrow keys (3.x's `RecordTableHotkeyProvider` and `RecordTableHotKeyControl`).
 */
export const RecordTable = Object.assign(RecordTableRoot, {
  Provider: RecordTableProvider,
  Header: RecordTableHeader,
  Head: RecordTableHead,
  InlineHead: RecordTableInlineHead,
  RowList: RecordTableRowList,
  Body: Table.Body,
  Cell: RecordTableCell,
  useRecordTable,
  useRecordTableState,
  RowSkeleton: RecordTableRowSkeleton,
  MoreButton: RecordTableMoreButton,
  checkboxColumn,
  checkboxColumnOf,
  Scroll: RecordTableScroll,
  CursorProvider: RecordTableCursorProvider,
  CursorBackwardSkeleton: RecordTableBackwardSkeleton,
  CursorForwardSkeleton: RecordTableForwardSkeleton,
  useResetPosition: useResetRecordTablePosition,
  Row: RecordTableRow,
  ColumnSelector: RecordTableColumnSelector,
  HotkeyProvider: RecordTableHotkeyProvider,
  HotKeyControl: RecordTableHotKeyControl,
});

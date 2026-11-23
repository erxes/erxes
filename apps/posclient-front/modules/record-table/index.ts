import { RecordTableMoreButton } from "./components/MoreColumn"
import { RecordTableCell } from "./components/RecordTableCell"
import { RecordTableColumnSelector } from "./components/RecordTableColumnSelector"
import { RecordTableHead } from "./components/RecordTableHead"
import { RecordTableHeader } from "./components/RecordTableHeader"
import { RecordTableInlineHead } from "./components/RecordTableInlineHead"
import {
  RecordTableProvider,
  useRecordTable,
} from "./components/RecordTableProvider"
import { RecordTableRoot } from "./components/RecordTableRoot"
import { RecordTableRow } from "./components/RecordTableRow"
import { RecordTableRowList } from "./components/RecordTableRowList"
import { RecordTableRowSkeleton } from "./components/RecordTableRowSkeleton"
import { RecordTableScroll } from "./components/RecordTableScroll"
import { TableBody } from "./components/Table"

export const RecordTable = Object.assign(RecordTableRoot, {
  Provider: RecordTableProvider,
  Header: RecordTableHeader,
  Head: RecordTableHead,
  InlineHead: RecordTableInlineHead,
  RowList: RecordTableRowList,
  Body: TableBody,
  Cell: RecordTableCell,
  useRecordTable: useRecordTable,
  RowSkeleton: RecordTableRowSkeleton,
  MoreButton: RecordTableMoreButton,
  Scroll: RecordTableScroll,
  Row: RecordTableRow,
  ColumnSelector: RecordTableColumnSelector,
})

export * from "./components/RecordTableCellInline"
export { useRecordTable }
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/Table"

import { flexRender } from "@tanstack/react-table"

import { cn } from "@/lib/utils"

import { RecordTableCell } from "./RecordTableCell"
import { useRecordTable } from "./RecordTableProvider"
import { RecordTableRow } from "./RecordTableRow"

export const RecordTableRowList = () => {
  const { table } = useRecordTable()

  return (
    <>
      {table.getRowModel().rows.map((row, rowIndex) => (
        <RecordTableRow
          key={row.id}
          data-state={row.getIsSelected() ? "selected" : undefined}
        >
          {row.getVisibleCells().map((cell) => (
            <RecordTableCell
              cell={cell}
              key={cell.id}
              className={cn(rowIndex === 0 && "border-t")}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </RecordTableCell>
          ))}
        </RecordTableRow>
      ))}
    </>
  )
}

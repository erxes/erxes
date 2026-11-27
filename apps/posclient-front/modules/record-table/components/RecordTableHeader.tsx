import { flexRender, Header } from "@tanstack/react-table"

import { cn } from "@/lib/utils"

import { isStructuralColumn } from "../utils/columnUtils"
import { RecordTableColumnSelector } from "./RecordTableColumnSelector"
import { RecordTableHead } from "./RecordTableHead"
import { useRecordTable } from "./RecordTableProvider"
import { TableHeader, TableRow } from "./Table"

const SELECTOR_WIDTH = 32

const resolveSelectorSlot = (visibleHeaders: Header<unknown, unknown>[]) => {
  let offset = 0

  for (const header of visibleHeaders) {
    const tooNarrow = header.getSize() < SELECTOR_WIDTH * 2

    if (!isStructuralColumn(header.column.id) && !tooNarrow) {
      return { offset, coveredId: header.id }
    }

    offset += header.getSize()
  }

  return { offset: 0, coveredId: visibleHeaders[0]?.id }
}

export const RecordTableHeader = ({
  showColumnSelector = false,
}: {
  showColumnSelector?: boolean
}) => {
  const { table } = useRecordTable()

  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => {
        const visibleHeaders = headerGroup.headers.filter(
          (header) => !header.isPlaceholder
        )
        const anchor = visibleHeaders[0]
        const anchorId = anchor?.id
        const anchorIsStructural =
          !!anchor && isStructuralColumn(anchor.column.id)
        const { offset, coveredId } = anchorIsStructural
          ? { offset: 0, coveredId: undefined }
          : resolveSelectorSlot(visibleHeaders)

        return (
          <TableRow key={headerGroup.id} className="[&>td]:border-b-0">
            {headerGroup.headers.map((header) => {
              const headerContent = header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )
              const isAnchor = showColumnSelector && header.id === anchorId
              const isCovered = showColumnSelector && header.id === coveredId

              return (
                <RecordTableHead
                  header={header}
                  key={header.id}
                  className={isAnchor ? "z-4" : undefined}
                >
                  {isCovered ? (
                    <div className="pl-8">{headerContent}</div>
                  ) : (
                    headerContent
                  )}
                  {isAnchor && (
                    <div
                      className={cn(
                        "absolute top-0 z-20 h-full bg-sidebar",
                        anchorIsStructural ? "w-full" : "w-8 border-r"
                      )}
                      style={{ left: `${offset}px` }}
                    >
                      <RecordTableColumnSelector />
                    </div>
                  )}
                </RecordTableHead>
              )
            })}
          </TableRow>
        )
      })}
    </TableHeader>
  )
}

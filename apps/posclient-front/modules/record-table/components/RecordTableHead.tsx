import React from "react"
import { Header } from "@tanstack/react-table"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

import { isStructuralColumn } from "../utils/columnUtils"
import { useRecordTable } from "./RecordTableProvider"
import { TableHead } from "./Table"

export const recordTableHeadVariants = cva(
  "sticky top-0 z-2 whitespace-nowrap text-xs transition-transform duration-200 [&_svg]:flex-none",
  {
    variants: {
      isDragging: {
        true: "z-3",
      },
      isPinned: {
        left: "z-3",
        right: "z-3",
      },
    },
  }
)

export const RecordTableHead = ({
  header,
  children,
  className,
  ...props
}: React.ComponentProps<"th"> & {
  header: Header<unknown, unknown>
}) => {
  const { column } = header
  const {
    draggingColumnId,
    setDraggingColumnId,
    overColumnId,
    setOverColumnId,
    moveColumn,
  } = useRecordTable()
  const pinned = column.getIsPinned()
  const isStructural = isStructuralColumn(column.id)
  const canDrag = !isStructural && !pinned
  const isDragging = draggingColumnId === column.id

  const endDrag = () => {
    setDraggingColumnId(null)
    setOverColumnId(null)
  }

  return (
    <TableHead
      className={cn(
        recordTableHeadVariants({
          isDragging,
          isPinned: pinned || null,
        }),
        className
      )}
      style={{
        width: `var(--header-${header.id}-width)`,
        left: pinned === "left" ? `${column.getStart("left")}px` : undefined,
      }}
      onDragOver={(event) => {
        if (!draggingColumnId || !canDrag) return
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
        setOverColumnId(column.id)
      }}
      onDrop={(event) => {
        event.preventDefault()
        if (draggingColumnId && canDrag) moveColumn(draggingColumnId, column.id)
        endDrag()
      }}
      {...props}
    >
      {children}
      {!isStructural && (
        <>
          <span
            aria-hidden="true"
            draggable={canDrag}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move"
              event.dataTransfer.setData("text/plain", column.id)
              setDraggingColumnId(column.id)
            }}
            onDragEnd={endDrag}
            className={cn(
              "absolute left-0 top-0 h-full w-full",
              canDrag && "cursor-grab active:cursor-grabbing"
            )}
          />

          {isDragging && (
            <div className="pointer-events-none absolute left-0 top-0 h-screen w-full bg-muted opacity-50" />
          )}

          <RecordTableHeadSize header={header} />
          <RecordTableOverLine columnId={column.id} />
        </>
      )}
    </TableHead>
  )
}

const RecordTableOverLine = ({ columnId }: { columnId: string }) => {
  const { table, draggingColumnId, overColumnId } = useRecordTable()

  if (
    overColumnId !== columnId ||
    !draggingColumnId ||
    draggingColumnId === columnId
  ) {
    return null
  }

  const columnsOrder = table.getState().columnOrder
  const isOnRight =
    columnsOrder.indexOf(draggingColumnId) < columnsOrder.indexOf(columnId)

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 h-screen w-0.5 bg-primary/40",
        isOnRight ? "right-0" : "left-0"
      )}
    />
  )
}

const RecordTableHeadSize = ({
  header,
}: {
  header: Header<unknown, unknown>
}) => (
  <span
    aria-hidden="true"
    draggable={false}
    className={cn(
      "absolute bottom-0 right-0 z-10 h-full w-4 cursor-col-resize touch-none select-none after:absolute after:inset-y-2 after:right-0 after:w-px hover:after:bg-border",
      header.column.getIsResizing() &&
        "after:inset-y-1 after:w-0.5 hover:after:bg-primary"
    )}
    onMouseDown={header.getResizeHandler()}
    onTouchStart={header.getResizeHandler()}
    onDoubleClick={() => header.column.resetSize()}
  />
)

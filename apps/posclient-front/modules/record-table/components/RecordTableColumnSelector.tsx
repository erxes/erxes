import { isValidElement, useState, type ReactNode } from "react"
import { Column } from "@tanstack/react-table"
import {
  GripVerticalIcon,
  PinIcon,
  PinOffIcon,
  SettingsIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"

import { isStructuralColumn } from "../utils/columnUtils"
import { useRecordTable } from "./RecordTableProvider"

const getColumnLabel = (column: Column<unknown, unknown>): string => {
  const { header } = column.columnDef
  if (typeof header === "string") return header
  if (typeof header === "function") {
    try {
      const headerNode = (header as () => ReactNode)()

      if (isValidElement<{ label?: string }>(headerNode)) {
        const inlineHeadLabel = headerNode.props?.label

        if (typeof inlineHeadLabel === "string") return inlineHeadLabel
      }
    } catch {
      return column.id
    }
  }

  return column.id
}

const SortableColumnItem = ({
  column,
  isLastVisible,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  column: Column<unknown, unknown>
  isLastVisible: boolean
  draggingId: string | null
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDrop: (id: string) => void
}) => {
  const isPinned = !!column.getIsPinned()
  const isDragging = draggingId === column.id
  const pinLabel = isPinned ? "Тогтоосныг болиулах" : "Зүүн талд тогтоох"

  return (
    <div
      draggable={!isPinned}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", column.id)
        onDragStart(column.id)
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        if (!draggingId || isPinned) return
        event.preventDefault()
      }}
      onDrop={(event) => {
        event.preventDefault()
        if (!isPinned) onDrop(column.id)
      }}
      className={cn(
        "flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted/50",
        isDragging && "bg-muted opacity-50"
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "flex flex-none items-center text-muted-foreground",
          isPinned ? "cursor-default opacity-30" : "cursor-grab"
        )}
      >
        <GripVerticalIcon className="size-3.5" />
      </div>

      <Checkbox
        id={`col-visibility-${column.id}`}
        checked={column.getIsVisible()}
        disabled={isLastVisible}
        title={isLastVisible ? "Дор хаяж нэг багана харагдах ёстой" : undefined}
        onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
        className="size-4 rounded-sm border [&_svg]:size-3"
      />

      <Label
        htmlFor={`col-visibility-${column.id}`}
        className="w-full cursor-pointer select-none truncate text-[13px] font-normal"
      >
        {getColumnLabel(column)}
      </Label>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        title={pinLabel}
        aria-label={pinLabel}
        className="size-5 flex-none text-muted-foreground hover:text-foreground"
        onClick={(event) => {
          event.preventDefault()
          column.pin(isPinned ? false : "left")
        }}
      >
        {isPinned ? (
          <PinOffIcon className="size-3.5" />
        ) : (
          <PinIcon className="size-3.5" />
        )}
      </Button>
    </div>
  )
}

export const RecordTableColumnSelector = ({
  children,
  align = "start",
}: {
  children?: React.ReactElement
  align?: "start" | "center" | "end"
}) => {
  const { table, columnSelectorOpen, setColumnSelectorOpen, moveColumn } =
    useRecordTable()
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const columns = table
    .getAllLeafColumns()
    .filter((column) => !isStructuralColumn(column.id))
  const visibleColumns = columns.filter((column) => column.getIsVisible())

  if (columns.length === 0) return null

  return (
    <DropdownMenu
      open={columnSelectorOpen}
      onOpenChange={setColumnSelectorOpen}
    >
      <DropdownMenuTrigger asChild>
        {children ?? (
          <Button
            type="button"
            variant="ghost"
            aria-label="Баганын тохиргоо"
            className="h-full w-full rounded-none px-0"
          >
            <SettingsIcon className="size-4 text-muted-foreground" />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className="max-h-(--radix-dropdown-menu-content-available-height) w-72 max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain p-1"
      >
        {columns.map((column) => (
          <SortableColumnItem
            key={column.id}
            column={column}
            draggingId={draggingId}
            onDragStart={setDraggingId}
            onDragEnd={() => setDraggingId(null)}
            onDrop={(overId) => {
              if (draggingId) moveColumn(draggingId, overId)
              setDraggingId(null)
            }}
            isLastVisible={
              visibleColumns.length === 1 && visibleColumns[0].id === column.id
            }
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

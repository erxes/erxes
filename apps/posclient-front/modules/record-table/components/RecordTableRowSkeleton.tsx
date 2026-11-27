import React, { RefObject, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

import { useRecordTable } from "./RecordTableProvider"
import { RecordTableRow } from "./RecordTableRow"
import { TableCell } from "./Table"

export const RecordTableRowSkeleton = ({
  rows = 1,
  handleInView,
  root,
}: {
  rows?: number
  handleInView?: () => void
  root?: RefObject<HTMLElement | null>
}) => {
  const { table } = useRecordTable()
  const columnCount =
    table.getRowModel().rows[0]?.getVisibleCells().length ||
    table.getVisibleLeafColumns().length
  const ref = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || !handleInView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) handleInView()
      },
      { root: root?.current ?? null, rootMargin: "200px 0px" }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [handleInView, root])

  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonRow
          key={index}
          ref={index === 0 ? ref : undefined}
          columnCount={columnCount}
        />
      ))}
    </>
  )
}

const SkeletonRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    columnCount: number
  }
>(({ columnCount, className, ...props }, ref) => (
  <RecordTableRow ref={ref} className={className} {...props}>
    {Array.from({ length: columnCount }).map((_, index) => (
      <TableCell
        key={index}
        className={cn("border-r-0 px-2 group-hover/table-row:bg-background")}
      >
        <Skeleton className="h-4 w-full min-w-4" />
      </TableCell>
    ))}
  </RecordTableRow>
))
SkeletonRow.displayName = "SkeletonRow"

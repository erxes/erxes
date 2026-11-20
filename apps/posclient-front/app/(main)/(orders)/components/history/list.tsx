import { RefObject, useCallback, useEffect, useRef } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ShoppingCartIcon } from "lucide-react"

import { IOrderHistory } from "@/types/order.types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

import columns from "./columns"

const HistoryTable = ({
  orders,
  loading,
  hasNextPage,
  onLoadMore,
  perPage,
}: {
  orders: IOrderHistory[]
  loading: boolean
  hasNextPage: boolean
  onLoadMore: () => void
  perPage: number
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const requestedRef = useRef(-1)

  useEffect(() => {
    if (loading) requestedRef.current = -1
  }, [loading])

  const loadMore = useCallback(() => {
    if (requestedRef.current === orders.length) return
    requestedRef.current = orders.length
    onLoadMore()
  }, [orders.length, onLoadMore])

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const flexWidth = table
    .getFlatHeaders()
    .reduce(
      (total, header) =>
        FIXED_COLUMNS.includes(header.column.id)
          ? total
          : total + header.getSize(),
      0
    )

  const getWidth = (id: string, size: number) =>
    FIXED_COLUMNS.includes(id) || !flexWidth
      ? `${size}px`
      : `${(size / flexWidth) * 100}%`

  return (
    <div className="relative h-full overflow-hidden rounded-lg border-l-4 border-t-4 border-sidebar bg-sidebar">
      <div ref={scrollRef} className="h-full w-full overflow-auto pb-3 pr-3">
        <table
          className="table-fixed border-separate border-spacing-0 bg-sidebar text-[13px] leading-none"
          style={{ width: `max(${table.getTotalSize()}px, 100%)` }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      width: getWidth(header.column.id, header.getSize()),
                    }}
                    className="sticky top-0 z-2 h-9 whitespace-nowrap bg-sidebar px-2 text-left align-middle font-mono text-xs font-semibold uppercase text-muted-foreground/80 after:absolute after:inset-y-2 after:right-0 after:w-px hover:after:bg-border [&_svg]:flex-none"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <LoadingList rows={perPage} />
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="group/row">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(cellClass, "group-hover/row:bg-muted")}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
            {!loading && hasNextPage && (
              <LoadMoreRows onLoadMore={loadMore} rootRef={scrollRef} />
            )}
          </tbody>
        </table>
      </div>
      {!loading && !orders.length && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <ShoppingCartIcon
              className="mb-6 h-12 w-12 text-zinc-400"
              strokeWidth={1.5}
            />
            <h3 className="text-base font-semibold text-foreground">
              Захиалга олдсонгүй
            </h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Шүүлтүүрээ өөрчлөөд дахин хайна уу
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const FIXED_COLUMNS = ["more"]

const cellClass =
  "h-cell overflow-hidden whitespace-nowrap border-b border-r bg-background p-0 align-middle transition-colors first:border-l [tr:first-child>&]:border-t [tr:first-child>&:first-child]:rounded-tl-lg [tr:first-child>&:last-child]:rounded-tr-lg"

const LoadMoreRows = ({
  onLoadMore,
  rootRef,
}: {
  onLoadMore: () => void
  rootRef: RefObject<HTMLDivElement | null>
}) => {
  const ref = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore()
      },
      { root: rootRef.current, rootMargin: "200px 0px" }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [onLoadMore, rootRef])

  return (
    <>
      {Array.from({ length: 3 }).map((_, key) => (
        <tr key={key} ref={key === 0 ? ref : undefined}>
          {columns.map((_, id) => (
            <td key={id} className={cn(cellClass, "px-2")}>
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export const LoadingList = ({ rows }: { rows: number }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, key) => (
        <tr key={key}>
          {columns.map((_, id) => (
            <td key={id} className={cn(cellClass, "px-2")}>
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default HistoryTable

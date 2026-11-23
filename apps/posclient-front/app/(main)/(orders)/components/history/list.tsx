import { useCallback, useEffect, useRef } from "react"
import { RecordTable } from "@/modules/record-table"
import { ShoppingCartIcon } from "lucide-react"

import { IOrderHistory } from "@/types/order.types"

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

  return (
    <RecordTable.Provider
      columns={columns}
      data={orders}
      stickyColumns={["more", "number"]}
      tableId="pos_orders_history"
      className="h-full"
    >
      <RecordTable.Scroll ref={scrollRef}>
        <RecordTable>
          <RecordTable.Header showColumnSelector />
          <RecordTable.Body>
            {loading ? (
              <RecordTable.RowSkeleton rows={perPage} />
            ) : (
              <RecordTable.RowList />
            )}
            {!loading && hasNextPage && (
              <RecordTable.RowSkeleton
                rows={3}
                handleInView={loadMore}
                root={scrollRef}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      {!loading && !orders.length && (
        <div className="absolute inset-0 top-9 flex items-center justify-center">
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
    </RecordTable.Provider>
  )
}

export default HistoryTable

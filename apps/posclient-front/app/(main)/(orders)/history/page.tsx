"use client"

import dynamic from "next/dynamic"
import { queries } from "@/modules/orders/graphql"
import useFullOrders from "@/modules/orders/hooks/useFullOrders"
import { modeAtom } from "@/store"
import { filterAtom } from "@/store/history.store"
import { useAtom, useAtomValue } from "jotai"

import { IOrderHistory } from "@/types/order.types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

import Filter from "../components/filter"
import OrderDetail from "../components/history/orderDetail"
import Pagination from "../components/history/pagination"
import RenderFilter from "../components/renderFilter"

const List: any = dynamic(() => import("../components/history/list"))
const ListMobile: any = dynamic(
  () => import("../components/history/list.mobile")
)

const PER_PAGE = 30

const History = () => {
  const [filter, setFilter] = useAtom(filterAtom)
  const mode = useAtomValue(modeAtom)

  const isMobile = mode === "mobile"

  const { loading, fullOrders, totalCount, handleLoadMore } = useFullOrders({
    query: queries.ordersHistory,
    variables: isMobile ? filter : { ...filter, page: 1, perPage: PER_PAGE },
  })

  const orders = (fullOrders || []) as IOrderHistory[]

  const Orders = isMobile ? ListMobile : List

  if (isMobile)
    return (
      <ScrollArea className="h-full max-h-full">
        <div className="mx-4 mt-2 flex items-center justify-between">
          <div className="text-sm font-semibold">Талбараар шүүх</div>
          <RenderFilter>
            <Filter filter={filter} setFilter={setFilter} loading={loading} />
          </RenderFilter>
        </div>
        <Orders loading={loading} orders={orders} />
        <Pagination totalCount={totalCount} loading={loading} />
        <OrderDetail />
      </ScrollArea>
    )

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex h-auto flex-none gap-3 border-b bg-background px-3 py-1">
        <Filter filter={filter} setFilter={setFilter} loading={loading}>
          <div className="h-7 whitespace-nowrap text-[13px] font-medium leading-7 text-muted-foreground">
            {loading ? (
              <Skeleton className="mt-1.5 inline-block h-4 w-20" />
            ) : (
              `${totalCount || 0} захиалга олдлоо`
            )}
          </div>
        </Filter>
      </div>
      <div className="min-h-0 flex-auto p-3">
        <Orders
          loading={loading}
          orders={orders}
          hasNextPage={totalCount > orders.length}
          onLoadMore={handleLoadMore}
          perPage={PER_PAGE}
        />
      </div>
      <OrderDetail />
    </div>
  )
}

export default History

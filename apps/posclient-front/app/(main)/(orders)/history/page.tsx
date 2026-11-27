"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { filterPageState } from "@/modules/filter"
import { queries } from "@/modules/orders/graphql"
import useFullOrders from "@/modules/orders/hooks/useFullOrders"
import { useOrdersFilterVariables } from "@/modules/orders/hooks/useOrdersFilterVariables"
import { modeAtom } from "@/store"
import {
  HISTORY_FILTER_ID,
  historyPerPageAtom,
  openReturnDialogAtom,
} from "@/store/history.store"
import { useAtomValue } from "jotai"

import { IOrderHistory } from "@/types/order.types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

import OrderDetail from "../components/history/orderDetail"
import { OrderReturnPanel } from "../components/history/orderReturn"
import Pagination from "../components/history/pagination"
import { OrdersFilter } from "../components/OrdersFilter"
import RenderFilter from "../components/renderFilter"

const List: any = dynamic(() => import("../components/history/list"))
const ListMobile: any = dynamic(
  () => import("../components/history/list.mobile")
)

const PER_PAGE = 30

const History = () => {
  const mode = useAtomValue(modeAtom)
  const variables = useOrdersFilterVariables()
  const page = useAtomValue(filterPageState(HISTORY_FILTER_ID))
  const perPage = useAtomValue(historyPerPageAtom)

  const isMobile = mode === "mobile"

  const { loading, fullOrders, totalCount, handleLoadMore } = useFullOrders({
    query: queries.ordersHistory,
    variables: isMobile
      ? { ...variables, page, perPage }
      : { ...variables, page: 1, perPage: PER_PAGE },
  })

  const orders = (fullOrders || []) as IOrderHistory[]

  const Orders = isMobile ? ListMobile : List

  if (isMobile)
    return (
      <ScrollArea className="h-full max-h-full">
        <div className="mx-4 mt-2 flex items-center justify-between">
          <div className="text-sm font-semibold">Талбараар шүүх</div>
          <RenderFilter>
            <OrdersFilter id={HISTORY_FILTER_ID} />
          </RenderFilter>
        </div>
        <Orders loading={loading} orders={orders} />
        <Pagination totalCount={totalCount} loading={loading} />
        <OrderSidePanel orders={orders} />
      </ScrollArea>
    )

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-10 flex-none items-center gap-3 border-b bg-background px-4 py-1 md:pl-6 md:pr-4">
          <OrdersFilter id={HISTORY_FILTER_ID}>
            <div className="h-7 whitespace-nowrap text-[13px] leading-7 font-medium text-muted-foreground">
              {loading ? (
                <Skeleton className="mt-1.5 inline-block h-4 w-20" />
              ) : (
                `${totalCount || 0} захиалга олдлоо`
              )}
            </div>
          </OrdersFilter>
        </div>
        <div className="min-h-0 flex-auto pb-3 pl-1 pt-3 md:pl-3 md:pr-1">
          <Orders
            loading={loading}
            orders={orders}
            hasNextPage={totalCount > orders.length}
            onLoadMore={handleLoadMore}
            perPage={PER_PAGE}
          />
        </div>
      </div>
      <OrderSidePanel orders={orders} />
    </div>
  )
}

const OrderSidePanel = ({ orders }: { orders: IOrderHistory[] }) => {
  const returnId = useAtomValue(openReturnDialogAtom)
  return returnId ? <OrderReturnPanel orders={orders} /> : <OrderDetail />
}

const HistoryPage = () => (
  <Suspense fallback={null}>
    <History />
  </Suspense>
)

export default HistoryPage

"use client"

import dynamic from "next/dynamic"
import { queries } from "@/modules/orders/graphql"
import useFullOrders from "@/modules/orders/hooks/useFullOrders"
import { modeAtom } from "@/store"
import { filterAtom } from "@/store/history.store"
import { useAtom, useAtomValue } from "jotai"

import { IOrderHistory } from "@/types/order.types"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

import Filter from "../components/filter"
import OrderDetail from "../components/history/orderDetail"
import Pagination from "../components/history/pagination"
import RenderFilter from "../components/renderFilter"

const List: any = dynamic(() => import("../components/history/list"))
const ListMobile: any = dynamic(
  () => import("../components/history/list.mobile")
)

const History = () => {
  const [filter, setFilter] = useAtom(filterAtom)
  const mode = useAtomValue(modeAtom)

  const { loading, fullOrders, totalCount } = useFullOrders({
    query: queries.ordersHistory,
    variables: filter,
  })

  const orders = (fullOrders || []) as IOrderHistory[]

  const Orders = mode === "mobile" ? ListMobile : List

  return (
    <ScrollArea className="h-full max-h-full">
      <div
        className={cn(
          mode === "mobile" && "flex items-center justify-between mx-4 mt-2"
        )}
      >
        <div
          className={cn(
            "text-sm font-semibold",
            mode !== "mobile" && "pb-2 pt-3 px-3"
          )}
        >
          Талбараар шүүх
        </div>
        <RenderFilter>
          <Filter filter={filter} setFilter={setFilter} loading={loading} />
        </RenderFilter>
      </div>
      <Orders loading={loading} orders={orders} />
      <Pagination totalCount={totalCount} loading={loading} />
      <OrderDetail />
    </ScrollArea>
  )
}

export default History

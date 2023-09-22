"use client"

import { queries } from "@/modules/orders/graphql"
import useFullOrders from "@/modules/orders/hooks/useFullOrders"
import { filterAtom } from "@/store/history.store"
import { useAtom } from "jotai"

import { IOrderHistory } from "@/types/order.types"
import { ScrollArea } from "@/components/ui/scroll-area"

import Filter from "../components/filter"
import OrderDetail from "../components/history/orderDetail"
import Pagination from "../components/history/pagination"
import HistoryTable from "../components/history/table"

const History = () => {
  const [filter, setFilter] = useAtom(filterAtom)

  const { loading, fullOrders, totalCount } = useFullOrders({
    query: queries.ordersHistory,
    variables: filter,
  })

  return (
    <ScrollArea className="h-full max-h-full">
      <div className="text-sm font-semibold pb-2 pt-3 px-4">Талбараар шүүх</div>
      <Filter filter={filter} setFilter={setFilter} loading={loading} />
      <HistoryTable
        orders={(fullOrders || []) as IOrderHistory[]}
        loading={loading}
      />
      <Pagination totalCount={totalCount} loading={loading} />
      <OrderDetail />
    </ScrollArea>
  )
}

export default History

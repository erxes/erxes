"use client"

import { useEffect, useState } from "react"
import { nextOrderIdAtom } from "@/store"
import { activeOrderIdAtom, slotCodeAtom } from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"

import { ORDER_STATUSES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

import { queries } from "./graphql"
import useFullOrders from "./hooks/useFullOrders"

const ActiveOrders = () => {
  const { ALL } = ORDER_STATUSES
  const _id = useAtomValue(activeOrderIdAtom)
  const slotCode = useAtomValue(slotCodeAtom)
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const setNextOrder = useSetAtom(nextOrderIdAtom)
  const [open, setOpen] = useState(false)

  const {
    fullOrders,
    subToOrderStatuses,
    totalCount,
    handleLoadMore,
    loading,
  } = useFullOrders({
    variables: {
      sortDirection: -1,
      sortField: "createdAt",
      isPaid: false,
      statuses: ALL,
      slotCode: _id ? undefined : slotCode,
    },
    query: queries.activeOrders,
  })

  useEffect(() => {
    subToOrderStatuses(ORDER_STATUSES.ALL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChoose = (_id: string) => {
    setNextOrder(_id)
    setOpen(false)
  }

  const activeOrder = fullOrders.find((order) => order._id === activeOrderId)

  return (
    <Popover open={open} onOpenChange={() => setOpen((prev) => !prev)}>
      <div className="mr-2 rounded-md bg-gray-100 p-1 ml-auto">
        <PopoverTrigger asChild>
          <Button className="h-8 bg-white font-bold rounded-sm" variant="ghost">
            {activeOrder?.number ?? "0000"}
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="mt-1 w-screen md:w-[50vw] ">
        <ScrollArea className="h-[50vh] overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-3 xxl:grid-cols-5 gap-2 max-w-full">
            {fullOrders.map((fo) => (
              <Button
                key={fo._id}
                variant={fo._id !== activeOrderId ? "outline" : undefined}
                className="font-bold whitespace-nowrap"
                onClick={() => handleChoose(fo._id)}
              >
                {fo.number}
              </Button>
            ))}
            {totalCount > fullOrders.length && (
              <Button
                size="sm"
                loading={loading}
                className="whitespace-nowrap font-bold my-2 md:col-span-5"
                variant={"secondary"}
                onClick={handleLoadMore}
              >
                Цааш үзэх {fullOrders.length} / {totalCount}
              </Button>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export default ActiveOrders

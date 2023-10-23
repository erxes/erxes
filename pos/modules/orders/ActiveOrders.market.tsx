import { useEffect, useState } from "react"
import { activeOrderIdAtom, slotCodeAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

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
  const { ALL, COMPLETE } = ORDER_STATUSES
  const _id = useAtomValue(activeOrderIdAtom)
  const slotCode = useAtomValue(slotCodeAtom)
  const [activeOrderId, setActiveOrderId] = useAtom(activeOrderIdAtom)
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
      statuses: ALL.filter((a) => a !== COMPLETE),
      slotCode: _id ? undefined : slotCode,
    },
    query: queries.activeOrders,
  })

  useEffect(() => {
    subToOrderStatuses(ORDER_STATUSES.ALL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChoose = (_id: string) => {
    setActiveOrderId(_id === activeOrderId ? "" : _id)
    setOpen(false)
  }

  const activeOrder = fullOrders.find((order) => order._id === activeOrderId)

  return (
    <Popover open={open} onOpenChange={() => setOpen((prev) => !prev)}>
      <div className="mr-2 rounded-md bg-gray-100 p-1">
        <PopoverTrigger asChild>
          <Button
            className="h-8 bg-white font-black rounded-sm"
            variant="ghost"
          >
            {activeOrder?.number?.split("_")[1] || "0000"}
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="mt-1 w-[50vw] ">
        <ScrollArea className="h-[50vh] overflow-hidden">
          <div className="grid grid-cols-5 gap-2">
            {fullOrders.map((fo) => (
              <Button
                key={fo._id}
                variant={fo._id !== activeOrderId ? "outline" : undefined}
                className="font-black"
                onClick={() => handleChoose(fo._id)}
              >
                {fo.number?.split("_")[1]}
              </Button>
            ))}
            {totalCount > fullOrders.length && (
              <Button
                size="sm"
                loading={loading}
                className="whitespace-nowrap font-bold my-2 col-span-5"
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

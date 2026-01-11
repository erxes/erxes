import { useEffect } from "react"
import { selectedTabAtom, slotFilterAtom } from "@/store"
import { activeOrderIdAtom } from "@/store/order.store"
import { useAtom, useSetAtom } from "jotai"

import { ORDER_STATUSES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
  HorizontalScrollMenu,
  ScrollMenuItem,
} from "@/components/ui/horizontalScrollMenu"

import ChooseOrder from "./components/chooseOrderBtn/chooseOrder.main"
import { queries } from "./graphql"
import useFullOrders from "./hooks/useFullOrders"

const ActiveOrders = () => {
  const { ALL } = ORDER_STATUSES
  const [_id, setActiveOrderId] = useAtom(activeOrderIdAtom)
  const [slotCode, setSlotCode] = useAtom(slotFilterAtom)
  const setSelectedTab = useSetAtom(selectedTabAtom)

  const {
    fullOrders,
    subToOrderStatuses,
    totalCount,
    loading,
    handleLoadMore,
  } = useFullOrders({
    variables: {
      sortDirection: -1,
      sortField: "createdAt",
      isPaid: false,
      statuses: ALL,
      slotCode,
    },
    query: queries.activeOrders,
    onCompleted(orders) {
      if (orders.length === 1) {
        !!slotCode && setActiveOrderId(orders[0]._id)
        setSelectedTab("products")
        setSlotCode(null)
      }
    },
  })

  useEffect(() => {
    subToOrderStatuses(ORDER_STATUSES.ALL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex-auto overflow-hidden h-[52px]">
      <HorizontalScrollMenu>
        {[
          ...fullOrders.map((order) => (
            <ScrollMenuItem key={order._id} itemId={order._id}>
              <ChooseOrder {...order} />
            </ScrollMenuItem>
          )),
          <ScrollMenuItem itemId={2001} key={2001}>
            {totalCount > fullOrders.length && (
              <Button
                size="sm"
                loading={loading}
                className="whitespace-nowrap font-bold my-2"
                onClick={handleLoadMore}
              >
                Цааш үзэх {fullOrders.length} / {totalCount}
              </Button>
            )}
          </ScrollMenuItem>,
        ]}
      </HorizontalScrollMenu>
    </div>
  )
}

export default ActiveOrders

import { useEffect } from "react"
import { queries } from "@/modules/orders/graphql"
import useFullOrders from "@/modules/orders/hooks/useFullOrders"

import { ORDER_STATUSES } from "@/lib/constants"
import {
  HorizontalScrollMenu,
  ScrollMenuItem,
} from "@/components/ui/horizontalScrollMenu"

import DoneOrder from "./DoneOrder"

const DoneOrders = () => {
  const { fullOrders, loading, subToOrderStatuses } = useFullOrders({
    variables: {
      sortDirection: -1,
      sortField: "modifiedAt",
      statuses: [ORDER_STATUSES.DONE],
    },
    query: queries.progressDoneOrders,
  })

  useEffect(() => {
    subToOrderStatuses(ORDER_STATUSES.ALL)
  }, [])

  if (loading) return <div className="flex-auto"></div>

  return (
    <>
      <HorizontalScrollMenu>
        {[
          ...fullOrders.map((order) => (
            <ScrollMenuItem key={order._id} itemId={order._id}>
              <DoneOrder {...order} />
            </ScrollMenuItem>
          )),
        ]}
      </HorizontalScrollMenu>
    </>
  )
}

export default DoneOrders

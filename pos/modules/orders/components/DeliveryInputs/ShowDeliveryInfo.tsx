import dynamic from "next/dynamic"
import { orderTypeAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

import { ORDER_TYPES } from "@/lib/constants"

const DeliveryInputs = dynamic(() => import("./"), {
  loading: () => <div className="h-8 w-full col-span-2" />,
})

const ShowDeliveryInfo = () => {
  const type = useAtomValue(orderTypeAtom)
  return [ORDER_TYPES.DELIVERY, ORDER_TYPES.BEFORE].includes(type) ? (
    <DeliveryInputs />
  ) : null
}

export default ShowDeliveryInfo

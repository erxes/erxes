import { useEffect, useState } from "react"
import useChangeOrderStatus from "@/modules/orders/hooks/useChangeOrderStatus"
import { waitingScreenAtom } from "@/store/config.store"
import { addSeconds, isBefore } from "date-fns"
import { useAtomValue } from "jotai"

import { IOrder } from "@/types/order.types"
import { ORDER_STATUSES } from "@/lib/constants"

const Order = ({ number, modifiedAt, status, _id }: IOrder) => {
  const { value } = useAtomValue(waitingScreenAtom) || {}
  const [expireDate, setExpireDate] = useState<any>()
  const waitingSec = parseInt(value || "3") * 60

  const { changeStatus } = useChangeOrderStatus()

  const isDone = status === ORDER_STATUSES.DONE

  useEffect(() => {
    if (isDone && modifiedAt) {
      setExpireDate(addSeconds(new Date(modifiedAt), waitingSec))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (expireDate && isBefore(new Date(expireDate), new Date())) {
        changeStatus({
          variables: { _id, status: ORDER_STATUSES.COMPLETE },
          refetchQueries: ["OrdersAtWaiting"],
        })
      }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expireDate])

  return (
    <div className="text-6xl 2xl:text-7xl font-black text-center">
      {number?.split("_")[1]}
    </div>
  )
}

export default Order

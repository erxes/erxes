import { useEffect, useState } from "react"
import { mutations } from "@/modules/orders/graphql"
import { useMutation } from "@apollo/client"
import { addSeconds, isBefore } from "date-fns"

import { IOrder } from "@/types/order.types"
import { ORDER_STATUSES } from "@/lib/constants"

const Order = ({
  number,
  modifiedAt,
  status,
  _id,
  waitingScreen,
}: IOrder & {
  waitingScreen: {
    type: string
    value: string
  }
}) => {
  const { type, value } = waitingScreen
  const [expireDate, setExpireDate] = useState<any>()
  const waitingSec = parseInt(value || "3") * 60

  const [orderChangeStatus] = useMutation(mutations.orderChangeStatus, {
    variables: { _id, status: ORDER_STATUSES.COMPLETE },
    refetchQueries: ["OrdersAtWaiting"],
  })

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
        orderChangeStatus()
      }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [expireDate, orderChangeStatus])

  return (
    <div className="text-6xl 2xl:text-7xl font-black text-center">
      {number?.split("_")[1]}
    </div>
  )
}

export default Order

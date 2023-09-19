import { useEffect } from "react"
import { mutations } from "@/modules/orders/graphql"
import { useMutation } from "@apollo/client"

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
  const waitingSec = parseInt(value || "3") * 60

  const [orderChangeStatus] = useMutation(mutations.orderChangeStatus, {
    variables: { _id, status: ORDER_STATUSES.COMPLETE },
    refetchQueries: ["getWaitingConfig"],
  })

  const isDone = status === ORDER_STATUSES.DONE

  useEffect(() => {}, [])

  return (
    <div className="text-6xl 2xl:text-7xl font-black text-center">
      {number?.split("_")[1]}
    </div>
  )
}

export default Order

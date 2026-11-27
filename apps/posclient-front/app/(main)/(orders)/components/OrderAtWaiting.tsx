import { useEffect } from "react"
import useChangeOrderStatus from "@/modules/orders/hooks/useChangeOrderStatus"
import { waitingScreenAtom } from "@/store/config.store"
import { addSeconds } from "date-fns"
import { useAtomValue } from "jotai"

import { IOrder } from "@/types/order.types"
import { ORDER_STATUSES } from "@/lib/constants"

const RETRY_MS = 5000

const Order = ({ number, modifiedAt, status, _id }: IOrder) => {
  const { value } = useAtomValue(waitingScreenAtom) || {}
  const waitingSec = Number.parseInt(value || "3") * 60

  const { changeStatus } = useChangeOrderStatus()

  const isDone = status === ORDER_STATUSES.DONE

  useEffect(() => {
    if (!isDone || !modifiedAt) {
      return
    }

    const expireAt = addSeconds(new Date(modifiedAt), waitingSec).getTime()
    let cancelled = false
    let timeout: ReturnType<typeof setTimeout>

    const complete = async () => {
      const result = await changeStatus({
        variables: { _id, status: ORDER_STATUSES.COMPLETE },
        refetchQueries: ["OrdersAtWaiting"],
      })

      if (result.errors?.length && !cancelled) {
        timeout = setTimeout(complete, RETRY_MS)
      }
    }

    timeout = setTimeout(complete, Math.max(expireAt - Date.now(), 0))

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [_id, changeStatus, isDone, modifiedAt, waitingSec])

  return (
    <div className="text-6xl 2xl:text-7xl font-black text-center">
      {number?.split("_")[1]}
    </div>
  )
}

export default Order

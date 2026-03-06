import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  activeOrderIdAtom,
  paidAmountsAtom,
  paidOrderIdAtom,
} from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"

const useHandleOrderId = () => {
  const _id = useSearchParams().get("orderId")
  const setActiveOrderId = useSetAtom(activeOrderIdAtom)
  const setPaidAmounts = useSetAtom(paidAmountsAtom)
  const paidOrderId = useAtomValue(paidOrderIdAtom)

  useEffect(() => {
    if (_id) {
      setActiveOrderId(_id)
      paidOrderId !== _id && setPaidAmounts([])
    }
  }, [_id, paidOrderId, setActiveOrderId, setPaidAmounts])
  return null
}

export default useHandleOrderId

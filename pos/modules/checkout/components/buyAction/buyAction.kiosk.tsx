"use client"
import { useRouter } from "next/navigation"
import useOrderCU from "@/modules/orders/hooks/useOrderCU"
import { activeOrderAtom } from "@/store/order.store"
import { useSetAtom } from "jotai"

import { Button } from "@/components/ui/button"

import OrderCancel from "../orderCancel/orderCancel.kiosk"
import TotalAmount from "../totalAmount/totalAmount.kiosk"

const BuyAction = () => {
  const router = useRouter()
  const setActiveOrder = useSetAtom(activeOrderAtom)

  const onCompleted = (_id: string) => {
    router.push("/checkout?orderId=" + _id)
    return setActiveOrder(_id)
  }
  const { loading, orderCU, variables } = useOrderCU(onCompleted)

  const disabled = loading || !variables.totalAmount

  return (
    <div className="col-span-4 grid grid-cols-2 px-4 pt-3 gap-3">
      <OrderCancel />
      <Button
        className="h-8 p-0 font-bold bg-green-500 hover:bg-green-400 rounded-full"
        disabled={disabled}
        onClick={() => orderCU()}
      >
        Төлбөр төлөх <TotalAmount />
      </Button>
    </div>
  )
}

export default BuyAction

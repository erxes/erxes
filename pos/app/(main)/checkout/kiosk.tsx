"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import PaymentSheet from "@/modules/checkout/components/paymentType/paymentSheet"
import TotalAmount from "@/modules/checkout/components/totalAmount/totalAmount.kiosk"
import OrderDetail from "@/modules/orders/OrderDetail"
import { activeOrderAtom } from "@/store/order.store"
import { useSetAtom } from "jotai"

import HandleOrder from "./components/HandleOrder.kiosk"
import Items from "./components/Items.kiosk"

const Kiosk = () => {
  const searchValue = useSearchParams()
  const _id = searchValue.get("orderId")
  const setActiveOrderId = useSetAtom(activeOrderAtom)

  useEffect(() => {
    if (_id) {
      setActiveOrderId(_id)
    }
  }, [_id, setActiveOrderId])
  return (
    <OrderDetail>
      <Items />
      <div className="grid gap-x-4 gap-y-6 pb-4 pt-2 flex-none">
        <div className="col-span-2 flex items-start justify-between text-base font-extrabold">
          <span>Нийт дүн:</span>
          <TotalAmount className="text-primary font-black text-lg" />
        </div>
        <HandleOrder />
        <PaymentSheet />
      </div>
    </OrderDetail>
  )
}

export default Kiosk

"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import EbarimtMain from "@/modules/checkout/components/ebarimt/ebarimt.main"
import PaymentType from "@/modules/checkout/components/paymentType/paymentType.main"
import SelectPaymentTypeMain from "@/modules/checkout/components/paymentType/selectPaymentType.main"
import usePaymentLabel from "@/modules/checkout/hooks/usePaymentLabel"
import OrderDetail from "@/modules/orders/OrderDetail"
import { currentPaymentTypeAtom } from "@/store"
import { activeOrderAtom } from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"

import Detail from "./components/Detail"

const Checkout = () => {
  const paymentTerm = useAtomValue(currentPaymentTypeAtom)
  const { getLabel } = usePaymentLabel()
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
      <div className="flex max-h-screen min-h-[600px] w-auto min-w-[880px] flex-auto items-stretch">
        <div className="mr-4 w-7/12">
          <h2 className="text-base font-bold mb-3">
            {paymentTerm
              ? getLabel(paymentTerm) + ":"
              : "Төлбөрийн нөхцөлөө сонгоно уу."}
          </h2>
          {paymentTerm ? <PaymentType /> : <SelectPaymentTypeMain />}
        </div>
        <div className="w-5/12 rounded-3xl bg-white p-5 text-black flex flex-col">
          <Detail />
          <EbarimtMain />
        </div>
      </div>
    </OrderDetail>
  )
}

export default Checkout

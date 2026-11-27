"use client"

import EbarimtMain from "@/modules/checkout/components/ebarimt/ebarimt.main"
import PaymentSheet from "@/modules/checkout/components/paymentType/paymentSheet"
import useHandleOrderId from "@/modules/orders/hooks/useHandleOrderId"
import OrderDetail from "@/modules/orders/OrderDetail"

import Detail from "./components/Detail"
import Payment from "./components/Payment.main"

const Checkout = () => {
  useHandleOrderId()

  return (
    <OrderDetail>
      <div className="flex max-h-screen min-h-[600px] w-auto min-w-[880px] flex-auto items-stretch gap-4">
        <Payment />
        <div className="flex w-5/12 flex-col gap-3 rounded-2xl border bg-background p-5 shadow-xs">
          <Detail />
          <EbarimtMain />
        </div>
      </div>
      <PaymentSheet />
    </OrderDetail>
  )
}

export default Checkout

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
      <div className="flex max-h-screen min-h-[600px] w-auto min-w-[880px] flex-auto items-stretch">
        <Payment />
        <div className="w-5/12 rounded-3xl bg-white p-5 text-black flex flex-col">
          <Detail />
          <EbarimtMain />
        </div>
      </div>
      <PaymentSheet />
    </OrderDetail>
  )
}

export default Checkout

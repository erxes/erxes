"use client"

import BuyAction from "@/modules/checkout/components/buyAction/buyAction.main"
import Cart from "@/modules/checkout/components/cart/cart.main"
import TotalAmount from "@/modules/checkout/components/totalAmount/totalAmount.main"
import Customer from "@/modules/customer"
import ChooseType from "@/modules/orders/components/chooseType/chooseType.main"
import OrderDetail from "@/modules/orders/OrderDetail"
import { modeAtom, orderCollapsibleAtom } from "@/store"
import { useAtom, useAtomValue } from "jotai"

import { Collapsible } from "@/components/ui/collapsible"

import DeliveryInputs from "../orders/components/DeliveryInputs"

const CheckoutMain = () => {
  const [orderCollapsible, setOrderCollapsible] = useAtom(orderCollapsibleAtom)
  const mode = useAtomValue(modeAtom)
  return (
    <OrderDetail inCheckout>
      <div className="pb-4 md:p-4">
        <Customer />
      </div>
      {!(mode === "mobile" && orderCollapsible) ? (
        <Cart />
      ) : (
        <div className="flex-auto" />
      )}
      <Collapsible
        asChild
        open={orderCollapsible}
        onOpenChange={(open) => setOrderCollapsible(open)}
      >
        <div className="grid flex-none grid-cols-2 gap-2 pt-4 md:p-4">
          <DeliveryInputs />
          <TotalAmount />
          <ChooseType />
          <BuyAction />
        </div>
      </Collapsible>
    </OrderDetail>
  )
}

export default CheckoutMain

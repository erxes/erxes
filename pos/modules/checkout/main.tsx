"use client"

import CheckoutConfig from "@/modules/auth/checkoutConfig"
import BuyAction from "@/modules/checkout/components/buyAction/buyAction.main"
import Cart from "@/modules/checkout/components/cart/cart.main"
import TotalAmount from "@/modules/checkout/components/totalAmount/totalAmount.main"
import Customer from "@/modules/customer"
import ChooseType from "@/modules/orders/components/chooseType/chooseType.main"
import OrderDetail from "@/modules/orders/OrderDetail"
import { orderCollapsibleAtom } from "@/store"
import { useAtom } from "jotai"

import { Collapsible } from "@/components/ui/collapsible"

import DeliveryInputs from "../orders/components/DeliveryInputs"

const CheckoutMain = () => {
  const [orderCollapsible, setOrderCollapsibleAtom] =
    useAtom(orderCollapsibleAtom)
  return (
    <CheckoutConfig>
      <OrderDetail>
        <div className="p-4">
          <Customer />
        </div>
        <Cart />
        <Collapsible
          asChild
          open={orderCollapsible}
          onOpenChange={(open) => setOrderCollapsibleAtom(open)}
        >
          <div className="grid flex-none grid-cols-2 gap-2 p-4">
            <DeliveryInputs />
            <TotalAmount />
            <ChooseType />
            <BuyAction />
          </div>
        </Collapsible>
      </OrderDetail>
    </CheckoutConfig>
  )
}

export default CheckoutMain

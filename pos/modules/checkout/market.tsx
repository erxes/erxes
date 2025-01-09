import { ReactNode } from "react"
import dynamic from "next/dynamic"
import { orderCollapsibleAtom } from "@/store"
import { totalAmountAtom } from "@/store/cart.store"
import { directDiscountConfigAtom } from "@/store/config.store"
import {
  activeOrderIdAtom,
  getTotalPaidAmountAtom,
  orderTotalAmountAtom,
} from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { Collapsible } from "@/components/ui/collapsible"

import OrderCUButton from "../orders/components/orderCUButton/orderCUButton.market"
import MakePayment from "../orders/components/settlePayment/settlePayment.market"
import BillType from "./components/ebarimt/billType"
import OddAmount from "./components/OddAmount/OddAmount"
import PaidTypes from "./components/paymentType/paidTypes"
import PaymentTypes from "./components/paymentTypes/paymentTypes.market"
import TotalAmount from "./components/totalAmount/totalAmount.main"

const DeliveryInputs: any = dynamic(
  () => import("../orders/components/DeliveryInputs")
)
const SettingsTrigger: any = dynamic(
  () => import("../orders/components/DeliveryInputs/trigger")
)

const Checkout: React.FC = () => {
  const activeOrder = useAtomValue(activeOrderIdAtom)
  const paidAmount = useAtomValue(getTotalPaidAmountAtom)
  const totalAmount = useAtomValue(totalAmountAtom)
  const orderTotal = useAtomValue(orderTotalAmountAtom)
  const isReadyToPrint = !!activeOrder && paidAmount === orderTotal
  const isItemsRegistered = !!activeOrder && orderTotal === totalAmount

  const { allowDirectDiscount } = useAtomValue(directDiscountConfigAtom)
  const [orderCollapsible, setOrderCollapsible] = useAtom(orderCollapsibleAtom)

  const renderDirectDiscountContent = (children?: ReactNode) => (
    <div className="flex-none space-y-2">
      <OddAmount />
      <TotalAmount />
      <div className="flex items-center gap-2">
        {children}
        <OrderCUButton variant={isReadyToPrint ? "outline" : undefined} />
      </div>
      {isReadyToPrint && <MakePayment />}
    </div>
  )

  return (
    <div className="mt-2 flex flex-auto flex-col pt-2">
      <div className="flex-auto">
        {!!activeOrder && <PaidTypes />}
        {isItemsRegistered && <PaymentTypes />}
        {isReadyToPrint && <BillType />}
      </div>

      {allowDirectDiscount ? (
        <Collapsible
          open={orderCollapsible}
          onOpenChange={(open) => setOrderCollapsible(open)}
        >
          <DeliveryInputs />
          {renderDirectDiscountContent(<SettingsTrigger />)}
        </Collapsible>
      ) : (
        renderDirectDiscountContent()
      )}
    </div>
  )
}

export default Checkout

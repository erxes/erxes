import TotalAmount from "@/modules/checkout/components/totalAmount/totalAmount.main"
import OrderCUButton from "@/modules/orders/components/orderCUButton/orderCUButton.market"
import MakePayment from "@/modules/orders/components/settlePayment/settlePayment.market"
import { totalAmountAtom } from "@/store/cart.store"
import {
  activeOrderIdAtom,
  getTotalPaidAmountAtom,
  orderTotalAmountAtom,
} from "@/store/order.store"
import { useAtomValue } from "jotai"

import { Label } from "@/components/ui/label"

import BillType from "./components/ebarimt/billType"
import OddAmount from "./components/OddAmount/OddAmount"
import PaidTypes from "./components/paymentType/paidTypes"
import PaymentTypes from "./components/paymentTypes/paymentTypes.market"

const Checkout = () => {
  const activeOrder = useAtomValue(activeOrderIdAtom)
  const paidAmount = useAtomValue(getTotalPaidAmountAtom)
  const totalAmount = useAtomValue(totalAmountAtom)
  const orderTotal = useAtomValue(orderTotalAmountAtom)

  const isReadyToPrint = !!activeOrder && paidAmount === totalAmount
  const isItemsRegistered = !!activeOrder && orderTotal === totalAmount

  return (
    <div className="mt-2 flex flex-auto flex-col pt-2">
      <div className="flex-auto">
        <div className="flex-auto">
          {!!activeOrder && (
            <>
              <Label className="block pb-2">Төлбөрийн төрөл:</Label>
              <PaidTypes />
            </>
          )}
          {isItemsRegistered && <PaymentTypes />}
          {isReadyToPrint && <BillType />}
        </div>
      </div>
      <div className="flex-none space-y-2">
        <OddAmount />
        <TotalAmount />
        <OrderCUButton variant={isReadyToPrint ? "outline" : undefined} />
        {isReadyToPrint && <MakePayment />}
      </div>
    </div>
  )
}

export default Checkout

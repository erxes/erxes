import TotalAmount from "@/modules/checkout/components/totalAmount/totalAmount.main"
import OrderCUButton from "@/modules/orders/components/orderCUButton/orderCUButton.market"
import MakePayment from "@/modules/orders/components/settlePayment/settlePayment.market"
import { totalAmountAtom } from "@/store/cart.store"
import {
  activeOrderAtom,
  getTotalPaidAmountAtom,
  orderTotalAmountAtom,
} from "@/store/order.store"
import { useAtom } from "jotai"

import { Label } from "@/components/ui/label"

import BillType from "./components/ebarimt/billType"
import PaidTypes from "./components/paymentType/paidTypes"
import PaymentTypes from "./components/paymentTypes/paymentTypes.market"

const Checkout = () => {
  const [activeOrder] = useAtom(activeOrderAtom)
  const [paidAmount] = useAtom(getTotalPaidAmountAtom)
  const [totalAmount] = useAtom(totalAmountAtom)
  const [orderTotal] = useAtom(orderTotalAmountAtom)

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
      <div className="flex-none space-y-3">
        <TotalAmount />
        <OrderCUButton variant={isReadyToPrint ? "outline" : undefined} />
        {isReadyToPrint && <MakePayment />}
      </div>
    </div>
  )
}

export default Checkout

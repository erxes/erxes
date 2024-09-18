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
import { Label } from "@/components/ui/label"

const TotalAmount = dynamic(
  () => import("@/modules/checkout/components/totalAmount/totalAmount.main")
)
const OrderCUButton = dynamic(
  () => import("@/modules/orders/components/orderCUButton/orderCUButton.market")
)
const MakePayment = dynamic(
  () => import("@/modules/orders/components/settlePayment/settlePayment.market")
)
const DeliveryInputs = dynamic(
  () => import("../orders/components/DeliveryInputs")
)
const SettingsTrigger = dynamic(
  () => import("../orders/components/DeliveryInputs/trigger")
)
const BillType = dynamic(() => import("./components/ebarimt/billType"))
const OddAmount = dynamic(() => import("./components/OddAmount/OddAmount"))
const PaidTypes = dynamic(() => import("./components/paymentType/paidTypes"))
const PaymentTypes = dynamic(
  () => import("./components/paymentTypes/paymentTypes.market")
)

interface CheckoutState {
  activeOrder: string | null
  isReadyToPrint: boolean
  isItemsRegistered: boolean
}

export const useCheckoutState = (): CheckoutState => {
  const activeOrder = useAtomValue(activeOrderIdAtom)
  const paidAmount = useAtomValue(getTotalPaidAmountAtom)
  const totalAmount = useAtomValue(totalAmountAtom)
  const orderTotal = useAtomValue(orderTotalAmountAtom)
  const isReadyToPrint = !!activeOrder && paidAmount === orderTotal
  const isItemsRegistered = !!activeOrder && orderTotal === totalAmount

  return { activeOrder, isReadyToPrint, isItemsRegistered }
}

interface DirectDiscountState {
  allowDirectDiscount: boolean
  orderCollapsible: boolean
  setOrderCollapsible: (value: boolean) => void
}

export const useDirectDiscount = (): DirectDiscountState => {
  const { allowDirectDiscount } = useAtomValue(directDiscountConfigAtom)
  const [orderCollapsible, setOrderCollapsible] = useAtom(orderCollapsibleAtom)

  return { allowDirectDiscount, orderCollapsible, setOrderCollapsible }
}

const Checkout: React.FC = () => {
  const { activeOrder, isReadyToPrint, isItemsRegistered } = useCheckoutState()

  return (
    <div className="mt-2 flex flex-auto flex-col pt-2">
      <CheckoutContent
        activeOrder={activeOrder}
        isReadyToPrint={isReadyToPrint}
        isItemsRegistered={isItemsRegistered}
      />
      <DirectDiscountWrapper isReadyToPrint={isReadyToPrint} />
    </div>
  )
}

interface CheckoutContentProps {
  activeOrder: string | null
  isReadyToPrint: boolean
  isItemsRegistered: boolean
}

const CheckoutContent: React.FC<CheckoutContentProps> = ({
  activeOrder,
  isReadyToPrint,
  isItemsRegistered,
}) => (
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
)

interface DirectDiscountWrapperProps {
  isReadyToPrint: boolean
}

const DirectDiscountWrapper: React.FC<DirectDiscountWrapperProps> = ({
  isReadyToPrint,
}) => {
  const { allowDirectDiscount, orderCollapsible, setOrderCollapsible } =
    useDirectDiscount()

  if (!allowDirectDiscount) {
    return <DirectDiscountContent isReadyToPrint={isReadyToPrint} />
  }

  return (
    <Collapsible
      open={orderCollapsible}
      onOpenChange={(open) => setOrderCollapsible(open)}
    >
      <DeliveryInputs />
      <DirectDiscountContent isReadyToPrint={isReadyToPrint}>
        <SettingsTrigger />
      </DirectDiscountContent>
    </Collapsible>
  )
}

interface DirectDiscountContentProps {
  isReadyToPrint: boolean
  children?: ReactNode
}

const DirectDiscountContent: React.FC<DirectDiscountContentProps> = ({
  isReadyToPrint,
  children,
}) => (
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

export default Checkout

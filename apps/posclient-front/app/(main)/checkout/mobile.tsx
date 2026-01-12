import Link from "next/link"
import PaymentSheet from "@/modules/checkout/components/paymentType/paymentSheet"
import HandleOrder from "@/modules/mobile/handleOrder.mobile"
import useHandleOrderId from "@/modules/orders/hooks/useHandleOrderId"
import OrderDetail from "@/modules/orders/OrderDetail"
import { orderNumberAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import Items from "./components/items.mobile"

const Checkout = () => {
  useHandleOrderId()
  const number = useAtomValue(orderNumberAtom)
  return (
    <>
      <OrderDetail>
        <div className="h-screen flex flex-col w-full overflow-hidden">
          <div className="flex items-center p-1 py-3 pr-10 bg-white">
            <Button variant="ghost" size="icon" Component={Link} href={"/"}>
              <ArrowLeftIcon className="h-5 w-5" strokeWidth={1.7} />
              <span className="sr-only">Back</span>
            </Button>
            <div className="flex-auto text-center font-bold text-base">
              Захиалга #{(number?.split("_") || [])[1]}
            </div>
          </div>
          <div className="flex-1 my-1 bg-white p-1 overflow-y-auto">
            <h3 className="font-bold text-base pb-2">Items</h3>
            <Items />
          </div>
          <HandleOrder />
        </div>
      </OrderDetail>
      <PaymentSheet />
    </>
  )
}

export default Checkout

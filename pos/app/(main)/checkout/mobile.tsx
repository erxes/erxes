import useHandleOrderId from "@/modules/orders/hooks/useHandleOrderId"
import OrderDetail from "@/modules/orders/OrderDetail"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const Checkout = () => {
  useHandleOrderId()
  return (
    <OrderDetail>
      <div className="h-screen flex flex-col w-full">
        <div className="flex items-center p-1 pr-10 bg-white">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-5 w-5" strokeWidth={1.7} />
            <span className="sr-only">Back</span>
          </Button>
          <div className="flex-auto text-center font-medium text-base">
            Захиалга #001
          </div>
        </div>
      </div>
    </OrderDetail>
  )
}

export default Checkout

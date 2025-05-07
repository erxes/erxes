import dynamic from "next/dynamic"
import { modeAtom, orderCollapsibleAtom } from "@/store"
import {
  activeOrderIdAtom,
  orderNumberAtom,
  setInitialAtom,
  openCancelDialogAtom
} from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"

import { Button } from "@/components/ui/button"
import { CollapsibleContent } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import OrderCancel from "@/modules/orders/components/orderCancel"

const Delivery: any = dynamic(() => import("./Delivery"))
const Description: any = dynamic(() => import("./Description"))
const DirectDiscount: any = dynamic(() => import("./directDiscount"))
const PreOrder: any = dynamic(() => import("./preOrder"))

const DeliveryInputs = () => {
  const mode = useAtomValue(modeAtom)
  const orderId = useAtomValue(activeOrderIdAtom)
  const number = useAtomValue(orderNumberAtom)
  const changeCancel = useSetAtom(openCancelDialogAtom)
  const setInitialStates = useSetAtom(setInitialAtom)
  const setOpenCollapsible = useSetAtom(orderCollapsibleAtom)

  return (
    <CollapsibleContent className="col-span-2 mb-2 border-y py-3">
      <div className="space-y-3">
        {mode !== "market" && (
          <>
            <Delivery />
            <PreOrder />
            <Description />
          </>
        )}
        <DirectDiscount />
        {!!orderId && mode !== "market" && (
          <>
            <Separator />
            <div className="col-span-3">
              <Button
                variant="destructive"
                onClick={() => changeCancel(orderId)}
              >
                Захиалга цуцлах
              </Button>
              <OrderCancel
                _id={orderId || ""}
                number={number}
                refetchQueries={["ActiveOrders"]}
                onCompleted={() => {
                  setInitialStates()
                  setOpenCollapsible(false)
                }}
              />
            </div>
          </>
        )}
      </div>
    </CollapsibleContent>
  )
}

export default DeliveryInputs

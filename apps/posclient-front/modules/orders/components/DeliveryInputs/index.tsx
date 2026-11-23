import dynamic from "next/dynamic"
import OrderCancel from "@/modules/orders/components/orderCancel"
import { modeAtom, orderCollapsibleAtom } from "@/store"
import {
  activeOrderIdAtom,
  openCancelDialogAtom,
  orderNumberAtom,
  setInitialAtom,
} from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"
import { XCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CollapsibleContent } from "@/components/ui/collapsible"

const Delivery = dynamic(() => import("./Delivery"))
const BrokerSelect = dynamic(() => import("./BrokerSelect"))
const Description = dynamic(() => import("./Description"))
const DirectDiscount = dynamic(() => import("./directDiscount"))
const PreOrder = dynamic(() => import("./preOrder"))

const DeliveryInputs = ({ className }: { className?: string }) => {
  const mode = useAtomValue(modeAtom)
  const orderId = useAtomValue(activeOrderIdAtom)
  const number = useAtomValue(orderNumberAtom)
  const changeCancel = useSetAtom(openCancelDialogAtom)
  const setInitialStates = useSetAtom(setInitialAtom)
  const setOpenCollapsible = useSetAtom(orderCollapsibleAtom)

  return (
    <CollapsibleContent
      className={cn(
        "col-span-2 mb-1 max-h-[45vh] overflow-y-auto border-b bg-background",
        className
      )}
    >
      <div className="flex flex-col gap-1 px-3 py-2.5">
        <h3 className="mb-1 font-mono text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500">
          Нэмэлт мэдээлэл
        </h3>
        {mode !== "market" && (
          <>
            <Delivery />
            <PreOrder />
            <BrokerSelect />
            <Description />
          </>
        )}
        <DirectDiscount />
        {!!orderId && mode !== "market" && (
          <div className="mt-1 border-t pt-2">
            <Button
              variant="ghost"
              className="h-7 gap-1.5 rounded-sm px-2 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => changeCancel(orderId)}
            >
              <XCircleIcon className="size-3.5" />
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
        )}
      </div>
    </CollapsibleContent>
  )
}

export default DeliveryInputs

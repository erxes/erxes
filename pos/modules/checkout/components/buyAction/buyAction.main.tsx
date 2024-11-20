"use client"

import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import SettingsTrigger from "@/modules/orders/components/DeliveryInputs/trigger"
import useOrderCU from "@/modules/orders/hooks/useOrderCU"
import { configAtom } from "@/store/config.store"
import {
  activeOrderIdAtom,
  buttonTypeAtom,
  orderTypeAtom,
} from "@/store/order.store"
import { showRecieptAtom } from "@/store/progress.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { CircleCheckIcon, PrinterIcon } from "lucide-react"

import { ORDER_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import SplitButton from "@/components/ui/split-button"
import PrintProgress from "@/app/(main)/(orders)/components/progress/PrintProgress"

const OrderFinish: any = dynamic(() => import("../orderFinish"), {
  loading: () => <div />,
})

const BuyAction = () => {
  const [buttonType, setButtonType] = useAtom(buttonTypeAtom)
  const setActiveOrder = useSetAtom(activeOrderIdAtom)
  const setShowRecieptId = useSetAtom(showRecieptAtom)
  const type = useAtomValue(orderTypeAtom)
  const router = useRouter()

  const config = useAtomValue(configAtom)
  const { isActive, isPrint } = config?.kitchenScreen || {}

  const onCompleted = (_id: string, isPre?: boolean) => {
    if (buttonType === "pay") {
      router.push("/checkout?orderId=" + _id)
    } else if (
      buttonType === "kitchen" ||
      buttonType === "customer" ||
      (buttonType === "order" && !isActive && isPrint && !isPre)
    ) {
      setShowRecieptId(_id + (buttonType === "customer" ? "?customer" : ""))
    }

    return setActiveOrder(_id)
  }

  const { loading, orderCU, variables } = useOrderCU(onCompleted)

  const disabled = loading || !variables.totalAmount

  const disableOrder = disabled || ORDER_TYPES.OUT.includes(type)

  return (
    <>
      <SplitButton
        size="lg"
        onClick={() => {
          setButtonType("order")
          setTimeout(orderCU)
        }}
        loading={loading && buttonType !== "pay"}
        disabled={disableOrder}
        options={
          <>
            <DropdownMenuItem
              onClick={() => {
                setButtonType("order")
                setTimeout(orderCU)
              }}
            >
              <CircleCheckIcon size={16} className="mr-2" />
              Захиалах
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setButtonType("customer")
                setTimeout(orderCU)
              }}
            >
              <PrinterIcon size={16} className="mr-2" />
              Түр баримт хэвлэх
            </DropdownMenuItem>
          </>
        }
      >
        Захиалах
      </SplitButton>
      <div className="flex items-center col-span-2 gap-2">
        <SettingsTrigger />
        {ORDER_TYPES.SALES.includes(type) ? (
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-500/90 flex-auto"
            loading={loading && buttonType === "pay"}
            disabled={disabled}
            onClick={() => {
              setButtonType("pay")
              setTimeout(orderCU)
            }}
          >
            Төлбөр төлөх
          </Button>
        ) : (
          <OrderFinish />
        )}
      </div>
      <PrintProgress />
    </>
  )
}

export default BuyAction

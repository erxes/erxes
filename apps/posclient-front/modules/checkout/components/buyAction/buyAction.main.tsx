"use client"

import dynamic from "next/dynamic"
import SettingsTrigger from "@/modules/orders/components/DeliveryInputs/trigger"
import useOrderCU from "@/modules/orders/hooks/useOrderCU"
import { checkoutDialogOpenAtom, currentPaymentTypeAtom } from "@/store"
import { configAtom } from "@/store/config.store"
import {
  activeOrderIdAtom,
  buttonTypeAtom,
  orderTypeAtom,
  previewTotalAmountAtom,
} from "@/store/order.store"
import { showRecieptAtom } from "@/store/progress.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { CheckCircleIcon, PrinterIcon } from "lucide-react"

import { ORDER_TYPES } from "@/lib/constants"
import { formatNum } from "@/lib/utils"
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
  const total = useAtomValue(previewTotalAmountAtom)
  const setCheckoutDialogOpen = useSetAtom(checkoutDialogOpenAtom)
  const setPaymentType = useSetAtom(currentPaymentTypeAtom)

  const config = useAtomValue(configAtom)
  const { isActive, isPrint } = config?.kitchenScreen || {}

  const onCompleted = (_id: string, isPre?: boolean) => {
    if (buttonType === "pay") {
      setActiveOrder(_id)
      setPaymentType("")
      setCheckoutDialogOpen(true)
    } else if (
      buttonType === "kitchen" ||
      buttonType === "customer" ||
      (buttonType === "order" && !isActive && isPrint && !isPre)
    ) {
      setShowRecieptId(_id + (buttonType === "customer" ? "?customer" : ""))
      setActiveOrder(_id)
    } else {
      setActiveOrder(_id)
    }
  }

  const { loading, orderCU, variables } = useOrderCU(onCompleted)

  const disabled = loading || !variables.totalAmount

  const disableOrder = disabled || ORDER_TYPES.OUT.includes(type)

  return (
    <div className="col-span-2 flex items-center gap-2">
      <SettingsTrigger />
      <SplitButton
        size="sm"
        variant="outline"
        className="h-9 flex-none divide-border rounded-md border bg-background shadow-xs [&>button]:h-9 [&>button]:border-0 [&>button]:bg-transparent [&>button]:text-[13px] [&>button]:font-medium [&>button]:shadow-none [&>button:first-child]:px-3 [&>button:last-child]:w-8 [&>button:last-child]:text-muted-foreground"
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
              <CheckCircleIcon size={16} className="mr-2" />
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
      {ORDER_TYPES.SALES.includes(type) ? (
        <Button
          size="lg"
          className="h-9 min-w-0 flex-1 justify-between gap-3 rounded-md px-3 text-[13px] font-semibold"
          loading={loading && buttonType === "pay"}
          disabled={disabled}
          onClick={() => {
            setButtonType("pay")
            setTimeout(orderCU)
          }}
        >
          <span className="truncate">Төлбөр төлөх</span>
          <span className="flex-none tabular-nums opacity-90">
            {formatNum(total)}₮
          </span>
        </Button>
      ) : (
        <div className="flex min-w-0 flex-1 [&>button]:h-9">
          <OrderFinish />
        </div>
      )}
      <PrintProgress />
    </div>
  )
}

export default BuyAction

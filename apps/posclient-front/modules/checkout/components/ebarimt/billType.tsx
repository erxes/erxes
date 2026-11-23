import { useEffect } from "react"
import dynamic from "next/dynamic"
import usePrintBill from "@/modules/checkout/hooks/usePrintBill"
import useRenderEbarimt from "@/modules/checkout/hooks/useRenderBillTypes"
import { billTypeAtom } from "@/store/order.store"
import { useAtom } from "jotai"
import { Building2Icon, ReceiptTextIcon, UserIcon } from "lucide-react"

import { IBillType } from "@/types/order.types"
import { BILL_TYPES } from "@/lib/constants"
import useKeyEvent from "@/lib/useKeyEvent"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const CheckRegister: any = dynamic(() => import("./checkRegister.market"))

const BillType = () => {
  const [billType, setBillType] = useAtom(billTypeAtom)
  const { skipEbarimt, allowInnerBill } = useRenderEbarimt()
  const { printBill, loading } = usePrintBill()

  useKeyEvent(() => !skipEbarimt && setBillType("3"), "F10")

  useEffect(() => {
    if (billType === BILL_TYPES.INNER) printBill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billType])

  const showInner = allowInnerBill || skipEbarimt

  const options = [
    { value: "1", label: "Хувь хүн", Icon: UserIcon },
    { value: "3", label: "Байгууллага", Icon: Building2Icon, kbd: "F10" },
  ]

  return (
    <div className="space-y-4">
      <RadioGroup
        className="grid grid-cols-2 gap-3"
        value={(!skipEbarimt && billType) || undefined}
        onValueChange={(value) => setBillType(value as IBillType)}
        id="ebarimt"
        disabled={skipEbarimt}
      >
        {options.map(({ value, label, Icon, kbd }) => (
          <Label
            key={value}
            htmlFor={`bill-type-${value}`}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border bg-background p-3 shadow-xs transition-colors hover:border-primary/40",
              billType === value &&
                !skipEbarimt &&
                "border-primary bg-primary/5 ring-1 ring-primary",
              skipEbarimt && "cursor-not-allowed opacity-60"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-muted text-muted-foreground",
                billType === value &&
                  !skipEbarimt &&
                  "bg-primary/10 text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-auto text-sm font-semibold">{label}</span>
            {kbd && <Kbd>{kbd}</Kbd>}
            <RadioGroupItem
              value={value}
              id={`bill-type-${value}`}
              disabled={skipEbarimt}
              className="sr-only"
            />
          </Label>
        ))}
      </RadioGroup>

      {billType === "3" && <CheckRegister />}

      {showInner && (
        <Button
          variant="outline"
          className="h-10 w-full rounded-xl font-semibold"
          loading={loading}
          onClick={() => setBillType("9")}
        >
          {!loading && <ReceiptTextIcon className="h-4 w-4" />}
          Түр баримт хэвлэх
        </Button>
      )}
    </div>
  )
}

export default BillType

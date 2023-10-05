import { useEffect } from "react"
import dynamic from "next/dynamic"
import usePrintBill from "@/modules/checkout/hooks/usePrintBill"
import useRenderEbarimt from "@/modules/checkout/hooks/useRenderBillTypes"
import { billTypeAtom } from "@/store/order.store"
import { useAtom } from "jotai"

import { IBillType } from "@/types/order.types"
import { BILL_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const CheckRegister = dynamic(() => import("./checkRegister.market"))

const BillType = () => {
  const [billType, setBillType] = useAtom(billTypeAtom)
  const { skipEbarimt, allowInnerBill } = useRenderEbarimt()
  const { printBill, loading } = usePrintBill()

  useEffect(() => {
    if (billType === BILL_TYPES.INNER) printBill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billType])

  const showInner = allowInnerBill || skipEbarimt

  return (
    <>
      <RadioGroup
        className={cn(
          "flex items-center pb-4 pt-3",
          showInner ? "justify-between" : "space-x-4"
        )}
        value={(!skipEbarimt && billType) || undefined}
        onValueChange={(value) => setBillType(value as IBillType)}
        id="ebarimt"
        disabled={skipEbarimt}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="1" id="1" disabled={skipEbarimt} />
          <Label htmlFor="1">Хувь хүн</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="3" id="3" disabled={skipEbarimt} />
          <Label htmlFor="3">Байгуулга</Label>
        </div>

        {showInner && (
          <Button
            className="h-auto self-end bg-warning px-4 py-2 font-bold hover:bg-warning/90"
            loading={loading}
            onClick={() => setBillType("9")}
          >
            Түр баримт
          </Button>
        )}
      </RadioGroup>
      {billType === "3" && <CheckRegister />}
    </>
  )
}

export default BillType

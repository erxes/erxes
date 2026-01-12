import dynamic from "next/dynamic"
import usePrintBill from "@/modules/checkout/hooks/usePrintBill"
import useRenderEbarimt from "@/modules/checkout/hooks/useRenderBillTypes"
import { checkoutModalViewAtom } from "@/store"
import { billTypeAtom } from "@/store/order.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { IBillType } from "@/types/order.types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const CheckRegister: any = dynamic(() => import("./checkRegister.market"))

const ChooseBillType = () => {
  const [billType, setBillType] = useAtom(billTypeAtom)
  const { skipEbarimt, allowInnerBill } = useRenderEbarimt()
  const { printBill, loading } = usePrintBill(() => setView("ebarimt"))

  const showInner = allowInnerBill || skipEbarimt
  const setView = useSetAtom(checkoutModalViewAtom)

  const handleValueChange = (value: string) => setBillType(value as IBillType)

  return (
    <div className="p-2">
      <div className="min-h-[15rem]">
        <RadioGroup
          className="py-4 flex gap-2"
          value={billType as string}
          onValueChange={handleValueChange}
        >
          <BillType billType="1" />
          <BillType billType="3" />
          {showInner && <BillType billType="9" />}
        </RadioGroup>
        {billType === "3" && <CheckRegister />}
      </div>
      <Button
        className="w-full"
        onClick={() => {
          printBill()
        }}
        loading={loading}
      >
        Баримт хэвлэх
      </Button>
      <Button
        variant="secondary"
        className="mt-2 w-full"
        onClick={() => setView("")}
      >
        Буцах
      </Button>
    </div>
  )
}

const BillType = ({ billType }: { billType: IBillType }) => {
  const bt = useAtomValue(billTypeAtom)

  function getBillType() {
    if (billType === "1") {
      return "Хувь хүн"
    }
    return billType === "3" ? "Байгуулга" : "Түр баримт"
  }

  return (
    <Button
      className="h-16 flex-1 justify-start gap-2 relative rounded-md"
      variant="outline"
      Component="div"
    >
      <RadioGroupItem value={billType ?? ""} id={billType ?? ""} />
      {getBillType()}
      <Label
        className={cn(
          "absolute inset-[-1px]",
          bt === billType && "border-2 border-primary rounded-md "
        )}
        htmlFor={billType ?? ""}
      />
    </Button>
  )
}

export default ChooseBillType

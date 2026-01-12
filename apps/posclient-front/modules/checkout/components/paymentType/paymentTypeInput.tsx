import useHandlePayment from "@/modules/checkout/hooks/useHandlePayment"
import { useCheckNotSplit } from "@/modules/checkout/hooks/usePaymentType"
import {
  displayAmountAtom,
  modeAtom,
  paymentAmountTypeAtom as typeAtom,
} from "@/store"
import { useAtom, useAtomValue } from "jotai"
import { Percent } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"

const PaymentTypeInput = () => {
  const mode = useAtomValue(modeAtom)
  const [type, setType] = useAtom(typeAtom)
  const displayAmount = useAtomValue(displayAmountAtom)
  const { handleValueChange, notPaidAmount, currentAmount } = useHandlePayment()
  const { disableInput } = useCheckNotSplit()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleValueChange(e.target.value)

  return (
    <>
      <div
        className={cn(
          "flex items-center text-3xl font-black mb-2",
          mode === "mobile" && "text-4xl"
        )}
      >
        <Toggle
          className={cn(
            "text-3xl font-black w-11 px-2",
            mode === "mobile" && "text-4xl"
          )}
          colorMode={mode === "mobile" ? "default" : "dark"}
          pressed={type === "percent"}
          onPressedChange={(pressed) => setType(pressed ? "percent" : "amount")}
        >
          {type === "percent" ? (
            <Percent className="h-6 w-6" strokeWidth={3} />
          ) : (
            "₮"
          )}
        </Toggle>
        <Input
          className="border-none px-2 "
          focus={false}
          value={displayAmount.toLocaleString()}
          onChange={onChange}
          disabled={disableInput || type === "items"}
        />
      </div>
      <span
        className={mode === "mobile" ? "text-neutral-600" : "text-neutral-300"}
      >
        Үлдэгдэл: {(notPaidAmount - currentAmount).toLocaleString()}₮
      </span>
    </>
  )
}

export default PaymentTypeInput

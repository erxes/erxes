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

  const rest = notPaidAmount - currentAmount
  const isMobile = mode === "mobile"

  return (
    <div className={cn(!isMobile && "flex items-center justify-between gap-4")}>
      <div
        className={cn(
          "flex min-w-0 items-center text-3xl font-bold",
          isMobile ? "mb-1 text-4xl" : "flex-auto"
        )}
      >
        <Toggle
          className={cn(
            "h-11 w-11 flex-none rounded-lg px-2 text-2xl font-bold data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
            isMobile && "text-4xl"
          )}
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
          className="h-11 border-none px-2 text-3xl font-bold tabular-nums shadow-none"
          focus={false}
          value={displayAmount.toLocaleString()}
          onChange={onChange}
          disabled={disableInput || type === "items"}
        />
      </div>
      {isMobile ? (
        <span className="text-sm text-muted-foreground">
          Үлдэгдэл: {rest.toLocaleString()}₮
        </span>
      ) : (
        <div className="flex-none text-right">
          <div className="text-xs text-muted-foreground">
            {rest < 0 ? "Хариулт" : "Үлдэгдэл"}
          </div>
          <div
            className={cn(
              "text-base font-semibold tabular-nums",
              rest < 0 && "text-emerald-600"
            )}
          >
            {Math.abs(rest).toLocaleString()}₮
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentTypeInput

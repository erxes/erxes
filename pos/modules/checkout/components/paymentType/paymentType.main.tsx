import { ChangeEvent } from "react"
import { byPercentTypesAtom, currentPaymentTypeAtom } from "@/store"
import { orderTotalAmountAtom } from "@/store/order.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Percent, XIcon } from "lucide-react"

import { HARD_PAYMENT_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import Keys from "@/app/(main)/checkout/components/Keys"

import useHandlePayment from "../../hooks/useHandlePayment"
import { useCheckNotSplit } from "../../hooks/usePaymentType"

const PaymentType = () => {
  const [byPercentTypes, setByPercentTypes] = useAtom(byPercentTypesAtom)
  const setPaymentTerm = useSetAtom(currentPaymentTypeAtom)
  const totalAmount = useAtomValue(orderTotalAmountAtom)
  const {
    handleValueChange,
    handlePay,
    loading,
    currentAmount,
    notPaidAmount,
    type,
  } = useHandlePayment()
  const { disableInput } = useCheckNotSplit()
  const pressed = byPercentTypes.includes(type)

  const onPressedChange = () =>
    setByPercentTypes(
      pressed
        ? byPercentTypes.filter((paymentType) => paymentType !== type)
        : [...byPercentTypes, type]
    )

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!pressed) return handleValueChange(e.target.value)
    return handleValueChange(
      ((Number(e.target.value) / 100) * totalAmount).toString()
    )
  }

  const value = pressed ? (currentAmount / totalAmount) * 100 : currentAmount

  return (
    <div>
      <div className="flex justify-between items-center p-1 border-b border-slate-500 pb-2 mb-4">
        <div className="flex-auto">
          <div className="flex items-center text-3xl font-black mb-2">
            <Toggle
              className="text-3xl font-black w-11 px-2"
              colorMode="dark"
              pressed={pressed}
              onPressedChange={onPressedChange}
            >
              {pressed ? <Percent className="h-6 w-6" strokeWidth={3} /> : "₮"}
            </Toggle>
            <Input
              className="border-none px-2 "
              focus={false}
              value={value.toLocaleString()}
              onChange={onChange}
              disabled={disableInput}
            />
          </div>
          <span className="text-slate-300">
            Үлдэгдэл: {(notPaidAmount - currentAmount).toLocaleString()}₮
          </span>
        </div>
        <div className="flex-auto flex items-center gap-1">
          <Button
            className="bg-green-500 hover:bg-green-500/90 whitespace-nowrap font-bold"
            loading={loading}
            onClick={handlePay}
            disabled={
              HARD_PAYMENT_TYPES.includes(type) &&
              (notPaidAmount === 0 || currentAmount === 0)
            }
          >
            Гүйлгээ хийх
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="px-2 h-8 hover:bg-slate-900 hover:text-white"
            onClick={() => setPaymentTerm("")}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Keys />
    </div>
  )
}

export default PaymentType

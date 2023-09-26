import { currentPaymentTypeAtom } from "@/store"
import { useAtomValue, useSetAtom } from "jotai"
import { XIcon } from "lucide-react"

import { ALL_BANK_CARD_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Keys from "@/app/(main)/checkout/components/Keys"

import useHandlePayment from "../../hooks/useHandlePayment"
import { useCheckNotSplit } from "../../hooks/usePaymentType"
import PaymentSheet from "./paymentSheet"

const PaymentType = () => {
  const setPaymentTerm = useSetAtom(currentPaymentTypeAtom)
  const paymentTerm = useAtomValue(currentPaymentTypeAtom)
  const {
    handleValueChange,
    handlePay,
    loading,
    currentAmount,
    notPaidAmount,
  } = useHandlePayment()
  const { disableInput } = useCheckNotSplit()

  return (
    <div>
      <div className="flex justify-between items-center p-1 border-b border-slate-500 pb-2 mb-4">
        <div className="flex-auto">
          <div className="flex items-center text-3xl font-black mb-2">
            <div className="translate-y-[1px]">₮</div>
            <Input
              className="border-none px-2 "
              focus={false}
              value={currentAmount.toLocaleString()}
              onChange={(e) => handleValueChange(e.target.value)}
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
              ALL_BANK_CARD_TYPES.includes(paymentTerm) && notPaidAmount === 0
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
      <PaymentSheet />
    </div>
  )
}

export default PaymentType

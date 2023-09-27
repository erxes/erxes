import PaidType from "@/modules/checkout/components/paymentType/paidType.main"
import PaidTypes from "@/modules/checkout/components/paymentType/paidTypes"
import {
  orderNumberAtom,
  orderTotalAmountAtom,
  unPaidAmountAtom,
} from "@/store/order.store"
import { useAtomValue } from "jotai"
import { CheckCircle2Icon, CircleIcon } from "lucide-react"

const Detail = () => {
  const number = useAtomValue(orderNumberAtom)
  const unpaid = useAtomValue(unPaidAmountAtom)
  const totalAmount = useAtomValue(orderTotalAmountAtom)
  return (
    <>
      <div className="flex flex-col items-center gap-3 flex-auto pt-4">
        <h2 className="font-black text-base text-center text-slate-600 pb-5">
          Захиалын дугаар: {(number || "").split("_")[1]}
        </h2>
        <div className="h-20 flex items-center justify-center">
          {unpaid === 0 ? (
            <CheckCircle2Icon className="h-20 w-20 text-emerald-600 animate-bounce" />
          ) : (
            <CircleIcon className="h-20 w-20 text-slate-400" />
          )}
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black">{totalAmount.toLocaleString()}</h1>
          <p className="text-semibold text-slate-600">Нийт төлөх</p>
        </div>
        <div className="w-full flex flex-col items-center">
          <PaidTypes />
          <PaidType type="Үлдэгдэл дүн" amount={unpaid} />
        </div>
      </div>
    </>
  )
}

export default Detail

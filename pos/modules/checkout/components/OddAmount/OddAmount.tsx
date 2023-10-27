import { currentAmountAtom } from "@/store"
import { unPaidAmountAtom } from "@/store/order.store"
import { useAtomValue } from "jotai"

const OddAmount = () => {
  const unPaidAmount = useAtomValue(unPaidAmountAtom)
  const currentAmount = useAtomValue(currentAmountAtom)

  if (unPaidAmount >= currentAmount) return null
  return (
    <div className="flex items-center justify-between text-slate-500">
      <span>Зөрүү дүн:</span>
      <span>{(currentAmount - unPaidAmount).toLocaleString()}₮</span>
    </div>
  )
}

export default OddAmount

import { Input } from "@/components/ui/input"

import usePaymentLabel from "../../hooks/usePaymentLabel"
import CancelPayment from "./cancelPayment.market"

const PaidType = ({ type, amount }: { type: string; amount: number }) => {
  const { getLabel } = usePaymentLabel()

  return (
    <div className="mb-2 flex items-center">
      <div className="flex flex-auto">
        <div className="w-1/2 pr-1">
          <Input disabled value={getLabel(type)} />
        </div>
        <div className="w-1/2 pl-1">
          <Input value={(amount || "").toLocaleString()} disabled />
        </div>
      </div>
      <CancelPayment type={type} amount={amount} />
    </div>
  )
}

export default PaidType

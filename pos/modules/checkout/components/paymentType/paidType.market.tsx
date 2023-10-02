import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import usePaymentLabel from "../../hooks/usePaymentLabel"
import { submitClassName } from "./paymentType.market"

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
      <Button
        className={cn(submitClassName, "bg-amber-500 hover:bg-amber-500/90")}
        iconOnly={true}
      >
        <XIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default PaidType

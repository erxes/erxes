import { getTotalPaidAmountAtom, isPreAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const PreOrder = () => {
  const [isPre, setIsPre] = useAtom(isPreAtom)
  const paidAmount = useAtomValue(getTotalPaidAmountAtom)

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="isPre"
        checked={isPre}
        onCheckedChange={() => setIsPre(!isPre)}
        disabled={paidAmount > 0}
      />
      <Label htmlFor="isPre">Урьдчилсан захиалга эсэх</Label>
    </div>
  )
}

export default PreOrder

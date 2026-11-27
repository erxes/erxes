import { PanelFormRow } from "@/modules/record-side-panel"
import { getTotalPaidAmountAtom, isPreAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"
import { AlarmClockIcon } from "lucide-react"

import { Switch } from "@/components/ui/switch"

const PreOrder = () => {
  const [isPre, setIsPre] = useAtom(isPreAtom)
  const paidAmount = useAtomValue(getTotalPaidAmountAtom)

  return (
    <PanelFormRow label="Урьдчилсан" icon={AlarmClockIcon}>
      <div className="flex h-7 items-center px-2">
        <Switch
          id="isPre"
          aria-label="Урьдчилсан захиалга эсэх"
          checked={isPre}
          onCheckedChange={() => setIsPre(!isPre)}
          disabled={paidAmount > 0}
        />
      </div>
    </PanelFormRow>
  )
}

export default PreOrder

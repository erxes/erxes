import useOrderCU from "@/modules/orders/hooks/useOrderCU"
import { slotFilterAtom } from "@/store"
import { activeOrderIdAtom, slotCodeAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"

import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { LoaderText } from "@/components/ui/loader"

const SetSlot = ({ code }: { code: string }) => {
  const [activeSlot, setActiveSlot] = useAtom(slotCodeAtom)
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const [filterSlot, setFilterSlots] = useAtom(slotFilterAtom)
  const { orderCU, loading } = useOrderCU(() => {
    if (filterSlot) {
      setFilterSlots(code)
    }
  })

  const handleChoose = (checked: boolean) => {
    setActiveSlot(checked ? code : null)
    !checked && setFilterSlots(null)
    setTimeout(orderCU)
  }

  return (
    <DropdownMenuCheckboxItem
      onCheckedChange={handleChoose}
      checked={activeSlot === code}
      disabled={!activeOrderId || loading}
    >
      {!loading &&
        (activeSlot === code ? "Захиалгаас чөлөөлөх" : "Захиалгад оноох")}
      {loading && <LoaderText />}
    </DropdownMenuCheckboxItem>
  )
}

export default SetSlot

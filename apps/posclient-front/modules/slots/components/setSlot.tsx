import useOrderCU from "@/modules/orders/hooks/useOrderCU"
import { slotFilterAtom } from "@/store"
import { activeOrderIdAtom, slotCodeAtom } from "@/store/order.store"
import { useAtom, useAtomValue } from "jotai"
import { LinkIcon, UnlinkIcon } from "lucide-react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LoaderIcon } from "@/components/ui/loader"

import { SLOT_MENU_ITEM_CLASS } from "../slotStatuses"

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

  const isSet = activeSlot === code

  return (
    <DropdownMenuItem
      className={SLOT_MENU_ITEM_CLASS}
      onSelect={() => handleChoose(!isSet)}
      disabled={!activeOrderId || loading}
    >
      {loading ? <LoaderIcon /> : isSet ? <UnlinkIcon /> : <LinkIcon />}
      {isSet ? "Захиалгаас чөлөөлөх" : "Захиалгад оноох"}
    </DropdownMenuItem>
  )
}

export default SetSlot

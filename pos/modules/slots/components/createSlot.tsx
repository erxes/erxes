import { selectedTabAtom } from "@/store"
import {
  activeOrderIdAtom,
  setInitialAtom,
  slotCodeAtom,
} from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"

import { ContextMenuItem } from "@/components/ui/context-menu"

const CreateSlot = ({ code }: { code: string }) => {
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const setInitial = useSetAtom(setInitialAtom)
  const setSlot = useSetAtom(slotCodeAtom)
  const setSelectedTab = useSetAtom(selectedTabAtom)
  const handleCreate = () => {
    setInitial()
    setSlot(code)
    setSelectedTab("products")
  }

  return (
    <ContextMenuItem onClick={handleCreate} disabled={!activeOrderId}>
      Шинэ захиалга үүсгэх
    </ContextMenuItem>
  )
}

export default CreateSlot

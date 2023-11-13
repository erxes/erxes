import { selectedTabAtom } from "@/store"
import {
  activeOrderIdAtom,
  setInitialAtom,
  slotCodeAtom,
} from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"
import { PlusCircleIcon } from "lucide-react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

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
    <DropdownMenuItem
      onClick={handleCreate}
      disabled={!activeOrderId}
      className="flex items-center"
    >
      <PlusCircleIcon className="h-4 w-4 mr-2" />
      Захиалга үүсгэх
    </DropdownMenuItem>
  )
}

export default CreateSlot

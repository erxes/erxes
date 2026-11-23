import { PlusIcon } from "lucide-react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import { useCreateSlots } from "../hooks/useSlots"
import { SLOT_MENU_ITEM_CLASS } from "../slotStatuses"

const CreateSlot = ({ code }: { code: string }) => {
  const { handleCreate } = useCreateSlots({ code })

  return (
    <DropdownMenuItem onClick={handleCreate} className={SLOT_MENU_ITEM_CLASS}>
      <PlusIcon />
      Захиалга үүсгэх
    </DropdownMenuItem>
  )
}

export default CreateSlot

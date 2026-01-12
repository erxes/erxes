import { PlusCircleIcon } from "lucide-react"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import { useCreateSlots } from "../hooks/useSlots"

const CreateSlot = ({ code }: { code: string }) => {
  const { handleCreate } = useCreateSlots({ code })

  return (
    <DropdownMenuItem onClick={handleCreate} className="flex items-center">
      <PlusCircleIcon className="h-4 w-4 mr-2" />
      Захиалга үүсгэх
    </DropdownMenuItem>
  )
}

export default CreateSlot

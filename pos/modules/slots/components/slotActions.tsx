import { memo } from "react"
import { selectedTabAtom, slotFilterAtom } from "@/store"
import { slotCodeAtom } from "@/store/order.store"
import { useAtom, useSetAtom } from "jotai"
import { CheckCircle2, Circle, ListFilterIcon, XCircleIcon } from "lucide-react"

import { ISlot } from "@/types/slots.type"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import CreateSlot from "./createSlot"
import PreDates from "./preDates"

const statusIcons = {
  serving: CheckCircle2,
  available: Circle,
  reserved: XCircleIcon,
}

const SlotActions = ({
  code,
  name,
  isPreDates,
  status,
  children,
}: ISlot & {
  status?: "serving" | "available" | "reserved"
  active: boolean
  children: React.ReactNode
}) => {
  const [activeSlot, setActiveSlot] = useAtom(slotCodeAtom)
  const setSelectedTab = useSetAtom(selectedTabAtom)
  const setFilterSlots = useSetAtom(slotFilterAtom)
  const Icon = statusIcons[status || "available"]
  const handleChoose = (checked: boolean) => {
    setActiveSlot(checked ? code : null)
    checked && setSelectedTab("products")
  }
  return (
    <DropdownMenu>
      {children}
      <DropdownMenuContent className="min-w-[13rem]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center">
            {name} ({code})
          </div>
          <div className="flex items-center gap-1">
            <Icon className="h-5 w-5" />
            {status}
          </div>
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          onCheckedChange={handleChoose}
          checked={activeSlot === code}
        >
          Захиалгад оноох
        </DropdownMenuCheckboxItem>
        <CreateSlot code={code} />
        <DropdownMenuItem
          className="flex items-center"
          onClick={() => setFilterSlots(code)}
        >
          <ListFilterIcon className="h-4 w-4 mr-2" />
          Захиалга сонгох
        </DropdownMenuItem>
        <PreDates isPreDates={isPreDates} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default memo(SlotActions)

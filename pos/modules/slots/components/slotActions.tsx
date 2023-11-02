import { memo } from "react"
import { selectedTabAtom, slotFilterAtom } from "@/store"
import { slotCodeAtom } from "@/store/order.store"
import { useSetAtom } from "jotai"
import { CheckCircle2, Circle, ListFilterIcon, XCircleIcon } from "lucide-react"

import { ISlot } from "@/types/slots.type"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"

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
  const setActiveSlot = useSetAtom(slotCodeAtom)
  const setSelectedTab = useSetAtom(selectedTabAtom)
  const setFilterSlots = useSetAtom(slotFilterAtom)
  const Icon = statusIcons[status || "available"]
  const handleChoose = () => {
    setActiveSlot(code)
    setSelectedTab("products")
  }
  return (
    <ContextMenu>
      {children}
      <ContextMenuContent className="min-w-[13rem]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center">
            {name} ({code})
          </div>
          <div className="flex items-center gap-1">
            <Icon className="h-5 w-5" />
            {status}
          </div>
        </div>

        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleChoose}>Сонгох</ContextMenuItem>
        <CreateSlot code={code} />
        <ContextMenuItem
          className="flex items-center"
          onClick={() => setFilterSlots(code)}
        >
          <ListFilterIcon className="h-4 w-4 mr-1" />
          Захиалгууд
        </ContextMenuItem>
        <PreDates isPreDates={isPreDates} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default memo(SlotActions)

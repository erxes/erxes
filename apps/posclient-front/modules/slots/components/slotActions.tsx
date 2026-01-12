import { memo } from "react"
import { selectedTabAtom, slotFilterAtom } from "@/store"
import {
  activeOrderIdAtom,
  setInitialAtom,
  slotCodeAtom,
} from "@/store/order.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
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
import SetSlot from "./setSlot"

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
  children: React.ReactNode
}) => {
  const setInitialState = useSetAtom(setInitialAtom)
  const setFilterSlots = useSetAtom(slotFilterAtom)
  const Icon = statusIcons[status || "available"]

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
        <SetSlot code={code} />
        <CreateSlot code={code} />
        <DropdownMenuItem
          className="flex items-center"
          onClick={() => {
            setInitialState()
            setFilterSlots(code)
          }}
          disabled={status === "available"}
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

import { memo } from "react"
import { slotFilterAtom } from "@/store"
import { setInitialAtom } from "@/store/order.store"
import { useSetAtom } from "jotai"
import { ListFilterIcon } from "lucide-react"

import { ISlot } from "@/types/slots.type"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { SLOT_MENU_ITEM_CLASS, SlotStatus, slotStatusOf } from "../slotStatuses"
import CreateSlot from "./createSlot"
import PreDates from "./preDates"
import SetSlot from "./setSlot"

const SlotActions = ({
  code,
  name,
  isPreDates,
  status,
  children,
}: ISlot & {
  status?: SlotStatus
  children: React.ReactNode
}) => {
  const setInitialState = useSetAtom(setInitialAtom)
  const setFilterSlots = useSetAtom(slotFilterAtom)
  const { label, dotClassName, badgeClassName } = slotStatusOf(status)

  return (
    <DropdownMenu>
      {children}
      <DropdownMenuContent align="start" className="w-56 p-1">
        <div className="flex items-center gap-2 px-2 pb-2 pt-1.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{name}</p>
            <p className="font-mono text-xs text-muted-foreground">{code}</p>
          </div>
          <span
            className={cn(
              "inline-flex h-5 flex-none items-center gap-1.5 rounded-sm border px-1.5 text-xs font-medium",
              badgeClassName
            )}
          >
            <span
              className={cn("size-1.5 rounded-full", dotClassName)}
              aria-hidden="true"
            />
            {label}
          </span>
        </div>
        <DropdownMenuSeparator />
        <SetSlot code={code} />
        <CreateSlot code={code} />
        <DropdownMenuItem
          className={SLOT_MENU_ITEM_CLASS}
          onClick={() => {
            setInitialState()
            setFilterSlots(code)
          }}
          disabled={status === "available"}
        >
          <ListFilterIcon />
          Захиалга сонгох
        </DropdownMenuItem>
        <PreDates isPreDates={isPreDates} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default memo(SlotActions)

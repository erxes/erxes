import { selectedTabAtom } from "@/store"
import { activeOrderIdAtom } from "@/store/order.store"
import { format } from "date-fns"
import { useSetAtom } from "jotai"
import { CalendarDaysIcon } from "lucide-react"

import { ISlot } from "@/types/slots.type"
import { cn } from "@/lib/utils"
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { SLOT_MENU_ITEM_CLASS } from "../slotStatuses"

const PreDates = ({ isPreDates }: { isPreDates: ISlot["isPreDates"] }) => {
  const setActiveOrder = useSetAtom(activeOrderIdAtom)
  const setSelectedTab = useSetAtom(selectedTabAtom)
  if (!isPreDates?.length) {
    return null
  }
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="flex h-6 items-center px-2 py-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Урьдчилсан захиалгууд
      </DropdownMenuLabel>
      {isPreDates.map((preDate) => (
        <DropdownMenuItem
          key={preDate._id}
          className={cn(SLOT_MENU_ITEM_CLASS, "tabular-nums")}
          onClick={() => {
            setActiveOrder(preDate._id)
            setSelectedTab("products")
          }}
        >
          <CalendarDaysIcon />
          {format(new Date(preDate.dueDate), "yyyy/MM/dd HH:mm")}
        </DropdownMenuItem>
      ))}
    </>
  )
}

export default PreDates

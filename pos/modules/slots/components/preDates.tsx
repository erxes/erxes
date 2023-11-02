import { selectedTabAtom } from "@/store"
import { activeOrderIdAtom } from "@/store/order.store"
import { format } from "date-fns"
import { useSetAtom } from "jotai"
import { CalendarDaysIcon } from "lucide-react"

import { ISlot } from "@/types/slots.type"
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu"

const PreDates = ({ isPreDates }: { isPreDates: ISlot["isPreDates"] }) => {
  const setActiveOrder = useSetAtom(activeOrderIdAtom)
  const setSelectedTab = useSetAtom(selectedTabAtom)
  if (!isPreDates?.length) return null
  return (
    <>
      <ContextMenuSeparator />
      <DropdownMenuLabel>Урьдчилсан захиалгууд</DropdownMenuLabel>
      {isPreDates.map((preDate) => (
        <ContextMenuItem
          key={preDate._id}
          className="flex items-center"
          onClick={() => {
            setActiveOrder(preDate._id)
            setSelectedTab("products")
          }}
        >
          <CalendarDaysIcon className="h-4 w-4 mr-1" strokeWidth={1.8} />
          {format(new Date(preDate.dueDate), "yyyy/MM/dd HH:mm")}
        </ContextMenuItem>
      ))}
    </>
  )
}

export default PreDates

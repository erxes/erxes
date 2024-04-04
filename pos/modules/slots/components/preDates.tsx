import { selectedTabAtom } from "@/store"
import { activeOrderIdAtom } from "@/store/order.store"
import { format } from "date-fns"
import { useSetAtom } from "jotai"
import { CalendarDaysIcon } from "lucide-react"

import { ISlot } from "@/types/slots.type"
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const PreDates = ({ isPreDates }: { isPreDates: ISlot["isPreDates"] }) => {
  const setActiveOrder = useSetAtom(activeOrderIdAtom)
  const setSelectedTab = useSetAtom(selectedTabAtom)
  if (!isPreDates?.length) return null
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Урьдчилсан захиалгууд</DropdownMenuLabel>
      {isPreDates.map((preDate) => (
        <DropdownMenuItem
          key={preDate._id}
          className="flex items-center"
          onClick={() => {
            setActiveOrder(preDate._id)
            setSelectedTab("products")
          }}
        >
          <CalendarDaysIcon className="h-4 w-4 mr-2" strokeWidth={1.8} />
          {format(new Date(preDate.dueDate), "yyyy/MM/dd HH:mm")}
        </DropdownMenuItem>
      ))}
    </>
  )
}

export default PreDates

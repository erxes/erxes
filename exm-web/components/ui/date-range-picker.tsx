import { useState } from "react"
import { addDays, format } from "date-fns"
import { CalendarCheckIcon } from "lucide-react"
import { DateRangePicker } from "react-date-range"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Button } from "./button"

export function DatePickerWithRange() {
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: "selection",
    },
  ])

  return (
    <Popover>
      <PopoverTrigger asChild className="border-none">
        <Button variant="outline" className="gap-2 py-2 !text-sm">
          <CalendarCheckIcon size={20} />
          <span>{format(state[0].startDate, "dd/MM/yyyy")}</span>
          <span>to</span>
          <span>{format(state[0].endDate, "dd/MM")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DateRangePicker
          onChange={(item: any) => setState([item.selection])}
          moveRangeOnFirstSelection={false}
          months={2}
          ranges={state}
          direction="horizontal"
        />
      </PopoverContent>
    </Popover>
  )
}

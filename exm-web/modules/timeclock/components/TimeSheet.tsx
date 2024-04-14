"use client"

import { FunctionComponent, useState } from "react"
import { addDays } from "date-fns"

import { DatePickerWithRange } from "@/components/ui/date-range-picker"

interface TimeSheetProps {}

const TimeSheet: FunctionComponent<TimeSheetProps> = () => {
  return (
    <div className="flex gap-4 items-center">
      <h3 className="text-2xl font-bold">Timesheet</h3>

      <div className="border rounded-md">
        <DatePickerWithRange />
      </div>
    </div>
  )
}

export default TimeSheet

import { FunctionComponent } from "react"

import { TableOfTimeClock } from "@/components/timeclock/TableOfTimeClock"
import TimeExport from "@/components/timeclock/TimeExport"
import TimeRequests from "@/components/timeclock/TimeRequests"
import TimeSheet from "@/components/timeclock/TimeSheet"
import TodaysClock from "@/components/timeclock/TodaysClock"
import TotalHours from "@/components/timeclock/TotalHours"

interface TimeClockBoardProps {}

const TimeClockBoard: FunctionComponent<TimeClockBoardProps> = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4">
        <div className="flex-1">
          <TodaysClock />
        </div>

        <TimeRequests />
      </div>

      <div className="flex justify-between items-center border-b py-3">
        <TimeSheet />

        <TimeExport />
      </div>

      <TotalHours />

      <TableOfTimeClock />
    </div>
  )
}

export default TimeClockBoard

import { FunctionComponent } from "react"
import { TableOfTimeClock } from "@/modules/timeclock/components/TableOfTimeClock"
import TimeExport from "@/modules/timeclock/components/TimeExport"
import TimeRequests from "@/modules/timeclock/components/TimeRequests"
import TimeSheet from "@/modules/timeclock/components/TimeSheet"
import TodaysClock from "@/modules/timeclock/components/TodaysClock"
import TotalHours from "@/modules/timeclock/components/TotalHours"

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

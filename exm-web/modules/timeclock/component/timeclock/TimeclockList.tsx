import React from "react"
import { useSearchParams } from "next/navigation"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useTimeclocksList } from "../../hooks/useTimeclocksList"
import { ITimeclock } from "../../types"
import TimeClockRow from "./TimeclockRow"
import TimeclockAction from "./action/TImeclockAction"

const list = [
  "Team member",
  "Shift date",
  "Check in",
  "In device",
  "Location",
  "Check out",
  "Overnight",
  "Out device",
  "Location",
  "Action",
]

const TimeclockList = () => {
  const searchParams = useSearchParams()

  const { timeclocksMainList, timeclocksMainTotalCount } = useTimeclocksList({
    page: 1,
    perPage: 20,
    startDate: searchParams.get("startDate") as string,
    endDate: searchParams.get("endDate") as string,
  })

  return (
    <div className="h-[94vh] flex flex-col gap-3">
      <TimeclockAction />
      <Table>
        <TableHeader>
          <TableRow>
            {list.map((item, index) => (
              <TableHead key={index}>{item}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeclocksMainList.map((timeclock, index) => (
            <TimeClockRow timeclock={timeclock} key={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default TimeclockList

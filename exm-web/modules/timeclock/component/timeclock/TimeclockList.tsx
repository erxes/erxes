import React from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"

import Pagination from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useTimeclocksList } from "../../hooks/useTimeclocksList"
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

const TimeclockList = ({ queryParams }: any) => {
  const currentUser = useAtomValue(currentUserAtom)

  const { timeclocksMainList, timeclocksMainTotalCount } = useTimeclocksList({
    ...queryParams,
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
      <Pagination count={timeclocksMainTotalCount} />
    </div>
  )
}

export default TimeclockList

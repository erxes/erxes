import React from "react"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useSchedules } from "../../hooks/useSchedule"
import { ISchedule } from "../../types"
import ScheduleRow from "./ScheduleRow"

type Props = {
  queryParams: any
}

const list = [
  "User",
  "Employee ID",
  "Total days",
  "Total hours",
  "Total break",
  "Member checked",
  "Actions",
]

const Schedule = ({ queryParams }: Props) => {
  const { schedulesList, schedulesTotalCount } = useSchedules({
    page: 1,
    perPage: 20,
    scheduleStatus: "Approved",
    ...queryParams,
  })

  return (
    <div className="h-[94vh] flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            {list.map((item, index) => (
              <TableHead key={index}>{item}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedulesList.map((schedule: ISchedule, index: number) => (
            <ScheduleRow schedule={schedule} key={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default Schedule

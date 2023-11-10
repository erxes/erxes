import React, { useState } from "react"

import Pagination from "@/components/ui/pagination"
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
import ScheduleAction from "./action/ScheduleAction"

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
]

const Schedule = ({ queryParams }: Props) => {
  const [status, setStatus] = useState("Approved")

  const {
    schedulesList,
    configsList,
    scheduleConfigOrder,
    schedulesTotalCount,
    loading,
  } = useSchedules(
    {
      ...queryParams,
    },
    status
  )

  return (
    <div className="h-[94vh] flex flex-col gap-3">
      {!loading && (
        <ScheduleAction
          status={status}
          setStatus={setStatus}
          configsList={configsList}
          scheduleConfigOrder={scheduleConfigOrder}
        />
      )}
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
      <Pagination count={schedulesTotalCount} />
    </div>
  )
}

export default Schedule

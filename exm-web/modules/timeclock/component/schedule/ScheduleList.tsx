import React, { useState } from "react"

import { Calendar } from "@/components/ui/calendar"
import Loader from "@/components/ui/loader"
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
import ScheduleCalendar from "./ScheduleCalendar"
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
  const [toggleView, setToggleView] = useState(false)

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

  const shifts = schedulesList
    .map((schedule: ISchedule) => schedule.shifts)
    .flat()

  return (
    <div className="h-[94vh] mt-2 flex flex-col gap-3 ">
      {!loading && (
        <ScheduleAction
          status={status}
          setStatus={setStatus}
          configsList={configsList}
          scheduleConfigOrder={scheduleConfigOrder}
          toggleView={toggleView}
          setToggleView={setToggleView}
        />
      )}
      <div className="flex flex-col max-h-[70vh] scrollbar-hide">
        {toggleView ? (
          <ScheduleCalendar configsList={configsList} shifts={shifts} />
        ) : (
          <>
            <Table>
              <TableHeader className="sticky top-0 bg-[#f8f9fa] border-none">
                <TableRow className="border-none">
                  {list.map((item, index) => (
                    <TableHead
                      key={index}
                      className="py-5 border-none text-[#4F33AF] font-bold"
                    >
                      {item}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              {loading ? (
                <div className="absolute left-1/2">
                  <Loader />
                </div>
              ) : (
                <TableBody>
                  {schedulesList.map((schedule: ISchedule, index: number) => (
                    <ScheduleRow schedule={schedule} key={index} />
                  ))}
                </TableBody>
              )}
            </Table>
            <div className="flex items-center justify-between">
              {schedulesTotalCount <= 0 ? null : (
                <span className="text-[#B5B7C0] font-medium">
                  Showing data{" "}
                  {(queryParams.page - 1) * queryParams.perPage + 1}
                  to{" "}
                  {queryParams.page * queryParams.perPage > schedulesTotalCount
                    ? schedulesTotalCount
                    : queryParams.page * queryParams.perPage}{" "}
                  of {schedulesTotalCount} entries
                </span>
              )}

              <Pagination count={schedulesTotalCount} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Schedule

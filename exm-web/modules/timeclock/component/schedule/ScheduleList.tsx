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
import TableFooter from "../TimeclockTableFooter"
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

  const renderTableBody = () => {
    if (loading) {
      return (
        <div className="absolute left-1/2">
          <Loader />
        </div>
      )
    }

    return (
      <TableBody>
        {schedulesList.map((schedule: ISchedule, index: number) => (
          <ScheduleRow schedule={schedule} key={index} />
        ))}
      </TableBody>
    )
  }

  const renderCalendar = () => {
    if (!toggleView) {
      return null
    }

    return <ScheduleCalendar configsList={configsList} shifts={shifts} />
  }

  const renderTable = () => {
    if (toggleView) {
      return null
    }

    return (
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
          {renderTableBody()}
        </Table>
        <div className="flex items-center justify-between">
          <TableFooter
            queryParams={queryParams}
            totalCount={schedulesTotalCount}
          />
          <Pagination count={schedulesTotalCount} />
        </div>
      </>
    )
  }

  return (
    <div className="h-[94vh] mt-2 flex flex-col gap-3 ">
      <ScheduleAction
        status={status}
        setStatus={setStatus}
        configsList={configsList || []}
        scheduleConfigOrder={scheduleConfigOrder || []}
        toggleView={toggleView}
        setToggleView={setToggleView}
      />
      <div className="flex flex-col max-h-[70vh] scrollbar-hide">
        {renderCalendar()}
        {renderTable()}
      </div>
    </div>
  )
}

export default Schedule

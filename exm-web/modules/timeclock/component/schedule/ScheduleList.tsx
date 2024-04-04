import React, { useState } from "react"
import { useSearchParams } from "next/navigation"

import { Calendar } from "@/components/ui/calendar"
import Loader from "@/components/ui/loader"
import Pagination from "@/components/ui/pagination"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useSchedules } from "../../hooks/useSchedule"
import { ISchedule } from "../../types"
import EmptyTable from "../EmptyTable"
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
  const statusParam = useSearchParams().get("status")
  const viewParam = useSearchParams().get("view")

  const [status, setStatus] = useState(statusParam || "Approved")
  const [toggleView, setToggleView] = useState(
    viewParam === "calendar" ? true : false
  )

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

    if (loading) {
      return <Loader />
    }

    if (schedulesTotalCount === 0 && !toggleView) {
      return <EmptyTable />
    }

    return (
      <div className="flex overflow-y-auto">
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
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-66px)] p-9 pt-5 flex flex-col justify-between">
      <div className="flex flex-col gap-2 h-full">
        <ScheduleAction
          status={status}
          setStatus={setStatus}
          configsList={configsList || []}
          scheduleConfigOrder={scheduleConfigOrder || []}
          toggleView={toggleView}
          setToggleView={setToggleView}
        />

        {renderCalendar()}
        {renderTable()}
      </div>
      {!toggleView && (
        <div className="flex items-center justify-between mt-auto">
          <TableFooter
            queryParams={queryParams}
            totalCount={schedulesTotalCount}
          />
          <Pagination count={schedulesTotalCount} />
        </div>
      )}
    </div>
  )
}

export default Schedule

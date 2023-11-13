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

  return (
    <div className="h-[94vh] flex flex-col gap-3 ">
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
      <div className="flex max-h-[70vh] scrollbar-hide">
        {toggleView ? (
          <Calendar
            classNames={{
              months:
                "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "font-medium text-xs",
              nav: "space-x-1 flex items-center",
              nav_button:
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "absolute bottom-0 w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell:
                "text-slate-500 rounded-md w-8 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center  p-0 relative [&:has([aria-selected])]:bg-slate-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 ",
            }}
          />
        ) : (
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
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[#B5B7C0] font-medium">
          Showing data {(queryParams.page - 1) * queryParams.perPage + 1} to{" "}
          {queryParams.page * queryParams.perPage > schedulesTotalCount
            ? schedulesTotalCount
            : queryParams.page * queryParams.perPage}{" "}
          of {schedulesTotalCount} entries
        </span>
        <Pagination count={schedulesTotalCount} />
      </div>
    </div>
  )
}

export default Schedule

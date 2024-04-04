import React from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"

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

import { useTimeclocksList } from "../../hooks/useTimeclocksList"
import EmptyTable from "../EmptyTable"
import TimeclockTableFooter from "../TimeclockTableFooter"
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

  const { timeclocksMainList, timeclocksMainTotalCount, loading } =
    useTimeclocksList({
      ...queryParams,
    })

  const renderTableBody = () => {
    return (
      <TableBody>
        {timeclocksMainList.map((timeclock, index) => (
          <TimeClockRow timeclock={timeclock} key={index} />
        ))}
      </TableBody>
    )
  }

  const renderTable = () => {
    if (loading) {
      return <Loader />
    }

    if (timeclocksMainTotalCount === 0) {
      return <EmptyTable />
    }

    return (
      <div className="flex overflow-y-auto ">
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
        <TimeclockAction />
        {renderTable()}
        <div className="flex items-center justify-between mt-auto">
          <TimeclockTableFooter
            queryParams={queryParams}
            totalCount={timeclocksMainTotalCount}
          />
          <Pagination count={timeclocksMainTotalCount} />
        </div>
      </div>
    </div>
  )
}

export default TimeclockList

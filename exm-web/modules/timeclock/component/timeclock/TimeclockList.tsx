import React from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"

import Loader from "@/components/ui/loader"
import Pagination from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useTimeclocksList } from "../../hooks/useTimeclocksList"
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
    if (loading) {
      return (
        <div className="absolute left-1/2">
          <Loader />
        </div>
      )
    }

    return (
      <TableBody>
        {timeclocksMainList.map((timeclock, index) => (
          <TimeClockRow timeclock={timeclock} key={index} />
        ))}
      </TableBody>
    )
  }

  return (
    <div className="h-[94vh] mt-2 flex flex-col gap-3">
      <TimeclockAction />
      <div className="flex overflow-y-auto max-h-[70vh] scrollbar-hide">
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
      <div className="flex items-center justify-between">
        <TimeclockTableFooter
          queryParams={queryParams}
          totalCount={timeclocksMainTotalCount}
        />
        <Pagination count={timeclocksMainTotalCount} />
      </div>
    </div>
  )
}

export default TimeclockList

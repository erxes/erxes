import React, { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"
import { ChevronDown, ChevronRight } from "lucide-react"

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

import { useAbsence } from "../../hooks/useAbsence"
import EmptyTable from "../EmptyTable"
import TableFooter from "../TimeclockTableFooter"
import RequestRow from "./AbsenceRow"
import AbsenceAction from "./action/AbsenceAction"

type Props = {
  queryParams: any
}

const Request = ({ queryParams }: Props) => {
  const currentUser = useAtomValue(currentUserAtom)
  const { absenceList, absenceTypes, absenceTotalCount, loading } = useAbsence({
    ...queryParams,
  })

  const [seeDate, setSeeDates] = useState(false)

  const seeDates = (
    <div
      onClick={() => setSeeDates(!seeDate)}
      className="border-none text-[#4F33AF] font-bold cursor-pointer"
    >
      <div className="flex items-center gap-1">
        <div>{"See dates"}</div>
        {seeDate ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
    </div>
  )

  const list = [
    "Team member",
    "Date",
    "From",
    "To",
    "Total hours",
    seeDates,
    "Reason",
    "Explanation",
    "Attachment",
    "Status",
    "Note",
    "Action",
  ]

  const renderTableBody = () => {
    return (
      <TableBody>
        {absenceList.map((absence, index) => (
          <RequestRow absence={absence} seeDate={seeDate} key={index} />
        ))}
      </TableBody>
    )
  }

  const renderTable = () => {
    if (loading) {
      return <Loader />
    }

    if (absenceTotalCount === 0) {
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
      <div className="h-full flex flex-col gap-2">
        <AbsenceAction queryParams={queryParams} absenceTypes={absenceTypes} />
        {renderTable()}
        <div className="flex items-center justify-between mt-auto">
          <TableFooter
            queryParams={queryParams}
            totalCount={absenceTotalCount}
          />
          <Pagination count={absenceTotalCount} />
        </div>
      </div>
    </div>
  )
}

export default Request

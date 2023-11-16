import React, { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"
import { ChevronDown, ChevronRight } from "lucide-react"

import Loader from "@/components/ui/loader"
import Pagination from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useAbsence } from "../../hooks/useAbsence"
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
    if (loading) {
      return (
        <div className="absolute left-1/2">
          <Loader />
        </div>
      )
    }

    return (
      <TableBody>
        {absenceList.map((absence, index) => (
          <RequestRow absence={absence} seeDate={seeDate} key={index} />
        ))}
      </TableBody>
    )
  }

  return (
    <div className="h-[94vh] mt-2 flex flex-col gap-3">
      {!loading && (
        <AbsenceAction queryParams={queryParams} absenceTypes={absenceTypes} />
      )}
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
        <TableFooter queryParams={queryParams} totalCount={absenceTotalCount} />
        <Pagination count={absenceTotalCount} />
      </div>
    </div>
  )
}

export default Request

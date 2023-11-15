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

  return (
    <div className="h-[94vh] flex flex-col gap-3">
      <AbsenceAction queryParams={queryParams} absenceTypes={absenceTypes} />
      <div className="flex overflow-y-auto max-h-[70vh]">
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
              {absenceList.map((absence, index) => (
                <RequestRow absence={absence} seeDate={seeDate} key={index} />
              ))}
            </TableBody>
          )}
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[#B5B7C0] font-medium">
          Showing data {(queryParams.page - 1) * queryParams.perPage + 1} to{" "}
          {queryParams.page * queryParams.perPage > absenceTotalCount
            ? absenceTotalCount
            : queryParams.page * queryParams.perPage}{" "}
          of {absenceTotalCount} entries
        </span>
        <Pagination count={absenceTotalCount} />
      </div>
    </div>
  )
}

export default Request

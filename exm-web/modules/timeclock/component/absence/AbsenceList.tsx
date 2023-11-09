import React, { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"
import { ChevronDown, ChevronRight } from "lucide-react"

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
  const { absenceList, absenceTypes, absenceTotalCount } = useAbsence({
    page: 1,
    perPage: 20,
    ...queryParams,
  })

  const [seeDate, setSeeDates] = useState(false)

  const seeDates = (
    <TableHead
      onClick={() => setSeeDates(!seeDate)}
      style={{ cursor: "pointer" }}
    >
      <div className="flex items-center gap-1">
        <div>{"See dates"}</div>
        {seeDate ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
    </TableHead>
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
      <Table>
        <TableHeader>
          <TableRow>
            {list.map((item, index) => (
              <TableHead key={index}>{item}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {absenceList.map((absence, index) => (
            <RequestRow absence={absence} seeDate={seeDate} key={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default Request

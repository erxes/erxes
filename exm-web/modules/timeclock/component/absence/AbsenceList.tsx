import React from "react"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useAbsence } from "../../hooks/useAbsence"
import RequestRow from "./AbsenceRow"

type Props = {}

const list = [
  "Team member",
  "Date",
  "From",
  "To",
  "Total hours",
  "Reason",
  "Explanation",
  "Attachment",
  "Status",
  "Note",
  "Action",
]

const Request = (props: Props) => {
  const { absenceList, absenceTotalCount } = useAbsence(
    1,
    10,
    "Wed Nov 01 2023 00:00:00 GMT+0800 (Ulaanbaatar Standard Time)",
    "Fri Dec 01 2023 00:00:00 GMT+0800 (Ulaanbaatar Standard Time)"
  )

  return (
    <div className="h-[94vh] flex flex-col gap-3">
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
            <RequestRow absence={absence} key={index} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default Request

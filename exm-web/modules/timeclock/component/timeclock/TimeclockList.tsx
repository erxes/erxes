import React from "react"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useTimeclocks } from "../../hooks/useTimeclocks"
import TimeClockRow from "./TimeclockRow"

type Props = {}

const list = [
  "Name",
  "Position",
  "Reason",
  "Total Hours",
  "To",
  "From",
  "Date",
  "Status",
  "Attachments",
]

const TimeclockList = (props: Props) => {
  const { timelocksList, timelocksTotalCount } = useTimeclocks(
    1,
    20,
    "Sun Oct 29 2023 08:50:22 GMT+0800 (Ulaanbaatar Standard Time)",
    "Thu Nov 02 2023 08:50:22 GMT+0800 (Ulaanbaatar Standard Time)"
  )

  return (
    <div className="h-[94vh] py-5 px-10">
      {/* <Table>
        <TableHeader>
          <TableRow>
            {list.map((item, index) => (
              <TableHead key={index}>{item}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TimeClockRow timeclockList={timelocksList} />
        </TableBody>
      </Table> */}
    </div>
  )
}

export default TimeclockList

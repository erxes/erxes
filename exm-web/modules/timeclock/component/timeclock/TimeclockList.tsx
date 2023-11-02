import React from "react"

import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import TimeClockRow from "./TimeclockRow"

type Props = {}

const TimeclockList = (props: Props) => {
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

  return (
    <div className="h-[94vh] ">
      <div className="py-5 px-10">
        <Table className="p-5">
          <TableHeader>
            <TableRow>
              {list.map((item, index) => (
                <TableHead key={index}>{item}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TimeClockRow />
        </Table>
      </div>
    </div>
  )
}

export default TimeclockList

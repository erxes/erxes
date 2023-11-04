import React from "react"

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ITimeclock } from "../../types"
import TimeClockRow from "./TimeclockRow"

type Props = { timelocksList: ITimeclock[] }

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

const TimeclockList = ({ timelocksList }: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {list.map((item, index) => (
            <TableHead key={index}>{item}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {timelocksList.map((timeclock, index) => (
          <TimeClockRow timeclock={timeclock} key={index} />
        ))}
      </TableBody>
    </Table>
  )
}

export default TimeclockList

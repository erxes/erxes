import React from "react"
import dayjs from "dayjs"

import { TableCell, TableRow } from "@/components/ui/table"

type Props = {
  ticket: any
}

const FeedbackRow = ({ ticket }: Props) => {
  console.log(ticket)

  return (
    <>
      {/* <TableRow className="border-none">
        <TableCell className="py-5">
          {timeclock.user && timeclock.user.details
            ? timeclock.user.details.fullName ||
              `${timeclock.user.details.firstName} ${timeclock.user.details.lastName}`
            : timeclock.employeeUserName || timeclock.employeeId}
        </TableCell>
        <TableCell className="py-5">{shiftDate}</TableCell>
        <TableCell className="py-5">{shiftStartTime}</TableCell>
        <TableCell className="py-5">
          {timeclock.inDeviceType || returnDeviceTypes(timeclock.deviceType)[0]}
        </TableCell>
        <TableCell className="py-5">{timeclock.inDevice || "-"}</TableCell>
        <TableCell className="py-5">{shiftEndTime}</TableCell>
        <TableCell className="py-5">{overNightShift ? "O" : "-"}</TableCell>
        <TableCell className="py-5">
          {timeclock.shiftActive
            ? "-"
            : timeclock.outDeviceType ||
              returnDeviceTypes(timeclock.deviceType)[1]}
        </TableCell>
        <TableCell className="py-5">{timeclock.outDevice || "-"}</TableCell>
        <TableCell className="py-5">
          <TimeclockRowAction timeclock={timeclock} />
        </TableCell>
      </TableRow> */}
    </>
  )
}

export default FeedbackRow

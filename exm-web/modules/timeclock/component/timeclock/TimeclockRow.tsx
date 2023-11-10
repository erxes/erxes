import React from "react"
import dayjs from "dayjs"

import { TableCell, TableRow } from "@/components/ui/table"

import { ITimeclock } from "../../types"
import { returnDeviceTypes } from "../../utils"
import TimeclockRowAction from "./action/TimeclockRowAction"

type Props = {
  timeclock: ITimeclock
}

const TimeClockRow = ({ timeclock }: Props) => {
  const shiftDate =
    new Date(timeclock.shiftStart).toDateString().split(" ")[0] +
    "\t" +
    dayjs(timeclock.shiftStart).format("MM/DD/YYYY")
  const shiftStartTime = dayjs(timeclock.shiftStart).format("HH:mm")

  const shiftEndTime = timeclock.shiftEnd
    ? dayjs(timeclock.shiftEnd).format("HH:mm")
    : "-"

  const overNightShift =
    timeclock.shiftEnd &&
    new Date(timeclock.shiftEnd).toLocaleDateString() !==
      new Date(timeclock.shiftStart).toLocaleDateString()

  return (
    <>
      <TableRow>
        <TableCell className="py-4">
          {timeclock.user && timeclock.user.details
            ? timeclock.user.details.fullName ||
              `${timeclock.user.details.firstName} ${timeclock.user.details.lastName}`
            : timeclock.employeeUserName || timeclock.employeeId}
        </TableCell>
        <TableCell className="py-4">{shiftDate}</TableCell>
        <TableCell className="py-4">{shiftStartTime}</TableCell>
        <TableCell className="py-4">
          {timeclock.inDeviceType || returnDeviceTypes(timeclock.deviceType)[0]}
        </TableCell>
        <TableCell className="py-4">{timeclock.inDevice || "-"}</TableCell>
        <TableCell className="py-4">{shiftEndTime}</TableCell>
        <TableCell className="py-4">{overNightShift ? "O" : "-"}</TableCell>
        <TableCell className="py-4">
          {timeclock.shiftActive
            ? "-"
            : timeclock.outDeviceType ||
              returnDeviceTypes(timeclock.deviceType)[1]}
        </TableCell>
        <TableCell className="py-4">{timeclock.outDevice || "-"}</TableCell>
        <TableCell className="py-4">
          <TimeclockRowAction timeclock={timeclock} />
        </TableCell>
      </TableRow>
    </>
  )
}

export default TimeClockRow

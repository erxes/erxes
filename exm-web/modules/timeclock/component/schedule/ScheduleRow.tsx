import React from "react"
import dayjs from "dayjs"

import { TableCell, TableRow } from "@/components/ui/table"

import { ISchedule } from "../../types"

type Props = {
  schedule: ISchedule
}

const ScheduleRow = ({ schedule }: Props) => {
  const scheduleChecked =
    schedule.scheduleChecked || !schedule.submittedByAdmin
      ? "Танилцсан"
      : "Танилцаагүй"

  const totalDaysScheduled = new Set(
    schedule.shifts.map((shift) => dayjs(shift.shiftStart).format("MM/DD/YYYY"))
  ).size

  let totalHoursScheduled = 0
  let totalBreakInMins = 0

  schedule.shifts.map((shift) => {
    totalHoursScheduled +=
      (new Date(shift.shiftEnd).getTime() -
        new Date(shift.shiftStart).getTime()) /
      (1000 * 3600)

    totalBreakInMins += shift.lunchBreakInMins || 0
  })

  const totalBreakInHours = totalBreakInMins / 60
  if (totalHoursScheduled) {
    totalHoursScheduled -= totalBreakInHours
  }

  return (
    <>
      <TableRow>
        <TableCell className="py-4">
          {schedule.user && schedule.user.details
            ? schedule.user.details.fullName
              ? schedule.user.details.fullName
              : schedule.user.email
              ? schedule.user.email
              : "-"
            : "-"}
        </TableCell>
        <TableCell className="py-4">
          {schedule.user.employeeId ? schedule.user.employeeId : ""}
        </TableCell>
        <TableCell className="py-4">{totalDaysScheduled}</TableCell>
        <TableCell className="py-4">{totalHoursScheduled.toFixed(1)}</TableCell>
        <TableCell className="py-4">{totalBreakInHours.toFixed(1)}</TableCell>
        <TableCell className="py-4">{scheduleChecked}</TableCell>
      </TableRow>
    </>
  )
}

export default ScheduleRow

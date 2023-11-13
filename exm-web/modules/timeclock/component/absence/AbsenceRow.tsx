import React, { useState } from "react"
import dayjs from "dayjs"

import { readFile } from "@/lib/utils"
import { TableCell, TableRow } from "@/components/ui/table"

import { IAbsence, IAbsenceType } from "../../types"
import AbsenceRowAction from "./action/AbsenceRowAction"

type Props = {
  absence: IAbsence
  seeDate: boolean
}

const RequestRow = ({ absence, seeDate }: Props) => {
  const startTime = new Date(absence.startTime)
  const endTime = new Date(absence.endTime)

  const startingDate = dayjs(startTime).format("MMM/DD/YYYY")
  const startingTime = dayjs(startTime).format("HH[h] : mm[m]")

  const endingDate = dayjs(endTime).format("MMM/DD/YYYY")
  const endingTime = dayjs(endTime).format("HH[h] : mm[m]")

  const absenceTimeType = absence.absenceTimeType

  const calculateAbsenceHours = () => {
    // if check in request or request time type is by day
    if (
      absence.reason.match(/Check in request/gi) ||
      absence.reason.match(/Check out request/gi) ||
      absenceTimeType === "by day"
    ) {
      return "-"
    }

    const getTimeInHours = (
      (endTime.getTime() - startTime.getTime()) /
      3600000
    ).toFixed(1)

    return getTimeInHours
  }

  const renderAbsenceDays = () => {
    if (absenceTimeType === "by day" && seeDate) {
      return absence.requestDates.map((requestDate) => (
        <TableCell key={requestDate} className="px-2 py-0">
          {dayjs(requestDate).format("MMM/DD/YYYY")}
        </TableCell>
      ))
    }

    return <TableCell className="py-0">{"-"}</TableCell>
  }

  const renderAbsenceTimeInfo = () => {
    if (absence.reason.match(/Check in request/gi)) {
      return (
        <>
          <TableCell className="py-5">{startingDate}</TableCell>
          <TableCell className="py-5">{startingTime}</TableCell>
          <TableCell className="py-5">{"-"}</TableCell>
        </>
      )
    }
    if (absence.reason.match(/Check out request/gi)) {
      return (
        <>
          <TableCell className="py-5">{startingDate}</TableCell>
          <TableCell className="py-5">{"-"}</TableCell>
          <TableCell className="py-5">{startingTime}</TableCell>
        </>
      )
    }

    if (absenceTimeType === "by day") {
      return (
        <>
          <TableCell className="py-5">{"-"}</TableCell>
          <TableCell className="py-5">{startingDate}</TableCell>
          <TableCell className="py-5">{endingDate}</TableCell>
        </>
      )
    }
    // by hour
    return (
      <>
        <TableCell className="py-5">{startingDate}</TableCell>
        <TableCell className="py-5">{startingTime}</TableCell>
        <TableCell className="py-5">{endingTime}</TableCell>
      </>
    )
  }

  const renderStatus = () => {
    const status = absence.solved
      ? absence.status?.split("/")[1]?.trim()
      : "Pending"

    const colorClass =
      status === "Approved"
        ? "text-green-500"
        : status === "Rejected"
        ? "text-red-500"
        : status === "Pending"
        ? "text-orange-500"
        : ""

    return <div className={colorClass}>{status}</div>
  }

  return (
    <>
      <TableRow className="border-none">
        <TableCell className="py-5">
          {absence.user && absence.user.details
            ? absence.user.details.fullName
              ? absence.user.details.fullName
              : absence.user.email
              ? absence.user.email
              : "-"
            : "-"}
        </TableCell>
        {renderAbsenceTimeInfo()}
        <TableCell className="py-5">
          {absence.totalHoursOfAbsence || calculateAbsenceHours()}
        </TableCell>
        <TableCell className="py-5">{renderAbsenceDays()}</TableCell>
        <TableCell className="py-5">{absence.reason || "-"}</TableCell>
        <TableCell className="py-5">{absence.explanation || "-"}</TableCell>
        <TableCell className="py-5 max-w-[50px] truncate">
          {absence.attachment ? (
            <a
              href={readFile(absence.attachment.url)}
              download={absence.attachment.name}
            >
              {absence.attachment.name}
            </a>
          ) : (
            "-"
          )}
        </TableCell>
        <TableCell className="">{renderStatus()}</TableCell>
        <TableCell className="py-5">{absence.note || "-"}</TableCell>
        <TableCell className="py-5">
          <AbsenceRowAction absence={absence} />
        </TableCell>
      </TableRow>
    </>
  )
}

export default RequestRow

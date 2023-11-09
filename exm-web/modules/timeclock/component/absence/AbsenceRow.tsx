import React, { useState } from "react"
import dayjs from "dayjs"

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

  const startingDate = dayjs(startTime).format("MM/DD/YYYY")
  const startingTime = dayjs(startTime).format("HH:mm")

  const endingDate = dayjs(endTime).format("MM/DD/YYYY")
  const endingTime = dayjs(endTime).format("HH:mm")

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
        <div key={requestDate}>{requestDate}</div>
      ))
    }

    return <TableCell>{"-"}</TableCell>
  }

  const renderAbsenceTimeInfo = () => {
    if (absence.reason.match(/Check in request/gi)) {
      return (
        <>
          <TableCell>{startingDate}</TableCell>
          <TableCell>{startingTime}</TableCell>
          <TableCell>{"-"}</TableCell>
        </>
      )
    }
    if (absence.reason.match(/Check out request/gi)) {
      return (
        <>
          <TableCell>{startingDate}</TableCell>
          <TableCell>{"-"}</TableCell>
          <TableCell>{startingTime}</TableCell>
        </>
      )
    }

    if (absenceTimeType === "by day") {
      return (
        <>
          <TableCell>{"-"}</TableCell>
          <TableCell>{startingDate}</TableCell>
          <TableCell>{endingDate}</TableCell>
        </>
      )
    }
    // by hour
    return (
      <>
        <TableCell>{startingDate}</TableCell>
        <TableCell>{startingTime}</TableCell>
        <TableCell>{endingTime}</TableCell>
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
      <TableRow>
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
        <TableCell className="py-5">
          {absence.attachment ? absence.attachment.name : "-"}
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

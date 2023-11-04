import React, { useState } from "react"
import dayjs from "dayjs"

import { TableCell, TableRow } from "@/components/ui/table"

import { IAbsence } from "../../types"
import { returnDeviceTypes } from "../../utils"

type Props = {
  absence: IAbsence
}

const RequestRow = ({ absence }: Props) => {
  const [seeDates, setSeeDates] = useState(
    JSON.parse(localStorage.getItem("seeDates") || "false")
  )

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
    if (absenceTimeType === "by day" && seeDates) {
      return absence.requestDates.map((requestDate) => (
        <div key={requestDate}>{requestDate}</div>
      ))
    }

    return <div>{"-"}</div>
  }

  const renderAbsenceTimeInfo = () => {
    if (absence.reason.match(/Check in request/gi)) {
      return (
        <>
          <td>{startingDate}</td>
          <td>{startingTime}</td>
          <td>{"-"}</td>
        </>
      )
    }
    if (absence.reason.match(/Check out request/gi)) {
      return (
        <>
          <td>{startingDate}</td>
          <td>{"-"}</td>
          <td>{startingTime}</td>
        </>
      )
    }

    if (absenceTimeType === "by day") {
      return (
        <>
          <td>{"-"}</td>
          <td>{startingDate}</td>
          <td>{endingDate}</td>
        </>
      )
    }
    // by hour
    return (
      <>
        <td>{startingDate}</td>
        <td>{startingTime}</td>
        <td>{endingTime}</td>
      </>
    )
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
        <TableCell className="py-5"> {renderAbsenceTimeInfo()}</TableCell>
        <TableCell className="py-5">
          {absence.totalHoursOfAbsence || calculateAbsenceHours()}
        </TableCell>
        <TableCell className="py-5">{renderAbsenceDays()}</TableCell>
        <TableCell className="py-5">{absence.reason || "-"}</TableCell>
        <TableCell className="py-5">{absence.explanation || "-"}</TableCell>
        <TableCell className="py-5">-</TableCell>
        <TableCell className="py-5">-</TableCell>
        <TableCell className="py-5">{absence.note || "-"}</TableCell>
      </TableRow>
    </>
  )
}

export default RequestRow

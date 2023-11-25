import React from "react"
import dayjs from "dayjs"

import { TableCell, TableRow } from "@/components/ui/table"

type Props = {
  ticket: any
}

const FeedbackRow = ({ ticket }: Props) => {
  const matches = ticket.name.match(/\[(.*?)\]\s(.*)/)

  return (
    <>
      <TableRow className="border-none">
        <TableCell className="py-5">{matches ? matches[2] : "-"}</TableCell>
        <TableCell className="py-5 capitalize">
          {matches ? matches[1] : "-"}
        </TableCell>
        <TableCell className="py-5">
          {dayjs(ticket.createdAt).format("MMM DD YYYY")}
        </TableCell>
        <TableCell className="py-5">
          {ticket.closeDate
            ? dayjs(ticket.closeDate).format("MMM DD YYYY")
            : "-"}
        </TableCell>
        <TableCell className="py-5">{ticket?.stage?.name || "-"}</TableCell>
      </TableRow>
    </>
  )
}

export default FeedbackRow

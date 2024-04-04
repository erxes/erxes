import React, { useState } from "react"
import dayjs from "dayjs"

import { TableCell, TableRow } from "@/components/ui/table"

type Props = {
  ticket: any
  setFeedBackId: (feedbackId: string) => void
}

const FeedbackRow = ({ ticket, setFeedBackId }: Props) => {
  const matches = ticket.name.match(/\[(.*?)\]\s(.*)/)

  return (
    <>
      <TableRow
        className="border-none text-xs"
        onClick={() => setFeedBackId(ticket._id)}
      >
        <TableCell className="py-5 w-[calc(100vw/5)] truncate">
          {ticket.name ? ticket.name : "-"}
        </TableCell>
        <TableCell className="py-5 w-[calc(100vw/5)] capitalize">
          {matches ? matches[1] : "-"}
        </TableCell>
        <TableCell className="py-5 w-[calc(100vw/5)]">
          {dayjs(ticket.createdAt).format("MMM DD YYYY")}
        </TableCell>
        <TableCell className="py-5 w-[calc(100vw/5)]">
          {ticket.closeDate
            ? dayjs(ticket.closeDate).format("MMM DD YYYY")
            : "-"}
        </TableCell>
        <TableCell className="py-5 w-[calc(100vw/5)]">
          {ticket?.stage?.name || "-"}
        </TableCell>
      </TableRow>
    </>
  )
}

export default FeedbackRow

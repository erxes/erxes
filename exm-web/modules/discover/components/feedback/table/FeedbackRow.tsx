import React from "react"
import dayjs from "dayjs"

import { TableCell, TableRow } from "@/components/ui/table"

type Props = {
  ticket: any
}

const FeedbackRow = ({ ticket }: Props) => {
  const matches = ticket.name.match(/\b\w+\b/g)

  const name = matches[1]
  const type = matches[0]

  return (
    <>
      <TableRow className="border-none">
        <TableCell className="py-5">{name}</TableCell>
        <TableCell className="py-5 capitalize">{type}</TableCell>
        <TableCell className="py-5">
          {dayjs(ticket.createdAt).format("MMM DD YYYY")}
        </TableCell>
        <TableCell className="py-5">
          {ticket.closeDate
            ? dayjs(ticket.closeDate).format("MMM DD YYYY")
            : "-"}
        </TableCell>
        <TableCell className="py-5">{ticket.stage.name}</TableCell>
      </TableRow>
    </>
  )
}

export default FeedbackRow

import React from "react"

import { TableBody, TableCell, TableRow } from "@/components/ui/table"

import { useRequests } from "../../hooks/useRequest"

type Props = {}

const TimeClockRow = (props: Props) => {
  const { requestsList, requestsTotalCount, loading, error } = useRequests()

  return (
    <TableBody>
      {requestsList.map((requests, index) => (
        <TableRow key={index}>
          {Object.values(requests).map((request) => {
            return (
              <TableCell key={index} className="py-5">
                <div className={`font-md ${status}`}>{request}</div>
              </TableCell>
            )
          })}
        </TableRow>
      ))}
    </TableBody>
  )
}

export default TimeClockRow

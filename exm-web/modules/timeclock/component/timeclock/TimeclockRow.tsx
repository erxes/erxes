import React from "react"

import { TableCell, TableRow } from "@/components/ui/table"

import { ITimeclock } from "../../types"

type Props = {
  timeclockList: ITimeclock[]
}

const TimeClockRow = (props: Props) => {
  return (
    //   {requestsList.map((requests, index) => (
    //     <TableRow key={index}>
    //       {Object.values(requests).map((request) => {
    //         return (
    //           <TableCell key={index} className="py-5">
    //             <div className={`font-md ${status}`}>{request}</div>
    //           </TableCell>
    //         )
    //       })}
    //     </TableRow>
    //   ))}

    <></>
  )
}

export default TimeClockRow

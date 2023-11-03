import React from "react"

import { useReports } from "../../hooks/useReport"

type Props = {}

const Report = (props: Props) => {
  const { reportsList, reportsTotalCount } = useReports(
    1,
    20,
    "Sun Oct 29 2023 08:50:22 GMT+0800 (Ulaanbaatar Standard Time)",
    "Thu Nov 02 2023 08:50:22 GMT+0800 (Ulaanbaatar Standard Time)"
  )

  return <div>Report</div>
}

export default Report

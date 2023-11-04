import React from "react"

import { useReports } from "../../hooks/useReport"

type Props = {}

const Report = (props: Props) => {
  const { reportsList, reportsTotalCount } = useReports(
    1,
    20,
    "Wed Nov 01 2023 00:00:00 GMT+0800 (Ulaanbaatar Standard Time)",
    "Fri Dec 01 2023 00:00:00 GMT+0800 (Ulaanbaatar Standard Time)"
  )

  return <div>Report</div>
}

export default Report

import React from "react"

import { useSchedules } from "../../hooks/useSchedule"

type Props = {}

const Schedule = (props: Props) => {
  const { schedulesList, schedulesTotalCount } = useSchedules(
    1,
    20,
    "Sun Oct 29 2023 08:50:22 GMT+0800 (Ulaanbaatar Standard Time)",
    "Thu Nov 02 2023 08:50:22 GMT+0800 (Ulaanbaatar Standard Time)",
    "Approved"
  )

  return <div>Schedule</div>
}

export default Schedule

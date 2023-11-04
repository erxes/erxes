import React from "react"

import { useSchedules } from "../../hooks/useSchedule"

type Props = {}

const Schedule = (props: Props) => {
  const { schedulesList, schedulesTotalCount } = useSchedules(
    1,
    20,
    "Wed Nov 01 2023 00:00:00 GMT+0800 (Ulaanbaatar Standard Time)",
    "Fri Dec 01 2023 00:00:00 GMT+0800 (Ulaanbaatar Standard Time)",
    "Approved"
  )

  return <div>Schedule</div>
}

export default Schedule

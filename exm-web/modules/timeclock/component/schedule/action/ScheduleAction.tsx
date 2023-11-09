import React from "react"

import ScheduleRequest from "../form/ScheduleRequest"

type Props = {}

const ScheduleAction = (props: Props) => {
  return (
    <div>
      {" "}
      <div className="flex gap-2 p-0 justify-end">
        <ScheduleRequest />
      </div>
    </div>
  )
}

export default ScheduleAction

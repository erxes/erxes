import React from "react"
import {
  IScheduleConfig,
  IScheduleConfigOrder,
} from "@/modules/timeclock/types"
import Select from "react-select"

import ScheduleRequest from "../form/ScheduleRequest"

type Props = {
  status: string
  setStatus: (status: string) => void
  configsList: IScheduleConfig[]
  scheduleConfigOrder: IScheduleConfigOrder
}
const options = [
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Pending", label: "Pending" },
]

const ScheduleAction = ({
  status,
  setStatus,
  configsList,
  scheduleConfigOrder,
}: Props) => {
  return (
    <div>
      <div className="flex gap-2 p-0 justify-end">
        <Select
          defaultValue={options[0]}
          value={options.filter((option) => option.value === status)}
          options={options}
          onChange={(selectedOption) => setStatus(selectedOption?.value!)}
        />
        <ScheduleRequest
          configsList={configsList}
          scheduleConfigOrder={scheduleConfigOrder}
        />
      </div>
    </div>
  )
}

export default ScheduleAction

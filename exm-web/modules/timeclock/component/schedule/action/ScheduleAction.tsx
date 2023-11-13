import React from "react"
import {
  IScheduleConfig,
  IScheduleConfigOrder,
} from "@/modules/timeclock/types"
import { CalendarDays, Grid2x2 } from "lucide-react"
import Select from "react-select"

import { Button } from "@/components/ui/button"

import ScheduleRequest from "../form/ScheduleRequest"

type Props = {
  status: string
  setStatus: (status: string) => void
  configsList: IScheduleConfig[]
  scheduleConfigOrder: IScheduleConfigOrder
  toggleView: boolean
  setToggleView: (view: boolean) => void
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
  toggleView,
  setToggleView,
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
        {/* <Button onClick={() => setToggleView(!toggleView)}>
          {toggleView ? <CalendarDays size={16} /> : <Grid2x2 size={16} />}
        </Button> */}
      </div>
    </div>
  )
}

export default ScheduleAction

import React, { useState } from "react"
import {
  IScheduleConfig,
  IScheduleConfigOrder,
} from "@/modules/timeclock/types"
import { CalendarDays, Grid2x2 } from "lucide-react"
import Select from "react-select"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="flex gap-2 p-0 justify-end">
        <Select
          defaultValue={options[0]}
          value={options.filter((option) => option.value === status)}
          options={options}
          onChange={(selectedOption) => setStatus(selectedOption?.value!)}
        />

        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
          <DialogTrigger asChild={true}>
            <button className="px-3 py-2 bg-[#3dcc38] text-[#fff] rounded-md">
              Schedule Request
            </button>
          </DialogTrigger>
          <DialogContent className="px-5 max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Schedule Request</DialogTitle>
            </DialogHeader>
            <ScheduleRequest
              configsList={configsList}
              scheduleConfigOrder={scheduleConfigOrder}
              setOpen={setOpen}
            />
          </DialogContent>
        </Dialog>
        <Button onClick={() => setToggleView(!toggleView)}>
          {toggleView ? <Grid2x2 size={16} /> : <CalendarDays size={16} />}
        </Button>
      </div>
    </div>
  )
}

export default ScheduleAction

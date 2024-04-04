import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentParams = Object.fromEntries(searchParams)
  const queryParams = new URLSearchParams(currentParams)

  const [open, setOpen] = useState(false)

  const handleSelectChange = (selectedOption: any) => {
    setStatus(selectedOption?.value)
    queryParams.set("status", selectedOption?.value.toString())

    router.push(`?${queryParams.toString()}`, {
      scroll: false,
    })
  }

  const handleViewChange = () => {
    setToggleView(!toggleView)

    const view = toggleView ? "table" : "calendar"

    queryParams.set("view", view)

    router.push(`?${queryParams.toString()}`, {
      scroll: false,
    })
  }

  const renderSelectStatus = () => {
    return (
      <Select
        defaultValue={options[0]}
        value={options.filter((option) => option.value === status)}
        options={options}
        onChange={handleSelectChange}
      />
    )
  }

  const renderRequest = () => {
    return (
      <Dialog open={open} onOpenChange={() => setOpen(!open)}>
        <DialogTrigger asChild={true}>
          <Button className="bg-[#3dcc38] text-[#fff] rounded-md">
            Schedule Request
          </Button>
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
    )
  }

  return (
    <div>
      <div className="flex gap-2 p-0 justify-end items-center">
        {renderSelectStatus()}
        {renderRequest()}
        <Button onClick={handleViewChange}>
          {toggleView ? <Grid2x2 size={16} /> : <CalendarDays size={16} />}
        </Button>
      </div>
    </div>
  )
}

export default ScheduleAction

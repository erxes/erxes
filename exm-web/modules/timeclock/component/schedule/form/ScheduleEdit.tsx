import React, { useState } from "react"
import { useTimeLogs } from "@/modules/timeclock/hooks/useTimeLogs"
import { useTimeclocksMutation } from "@/modules/timeclock/hooks/useTimeclocksMutations"
import { ISchedule, ITimeclock, ITimelog } from "@/modules/timeclock/types"
import dayjs from "dayjs"
import { ChevronDown, ChevronUp } from "lucide-react"
import Select from "react-select"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"

type Props = {
  schedule: ISchedule
}

const ScheduleEdit = ({ schedule }: Props) => {
  const { toast } = useToast()

  const [open, setOpen] = useState(false)

  const { timeLogsPerUser } = useTimeLogs({
    userId: timeclock.user._id,
    startDate: dayjs(timeclock.shiftStart).format("MM/DD/YYYY"),
    endDate: dayjs(timeclock.shiftEnd).format("MM/DD/YYYY"),
  })

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { editTimeclock, loading } = useTimeclocksMutation({
    callBack,
  })

  const renderEditForm = () => {
    return (
      <DialogContent>
        <DialogHeader>Edit Shift</DialogHeader>
        <Label /> SHIFT START
        <div className="flex gap-2 justify-between">
          <RadioGroup
            defaultValue={shiftStartInput}
            onValueChange={(value) => setShiftStartInput(value)}
          >
            <div className="flex flex-col gap-1">
              <div className="flex gap-2 items-center">
                <RadioGroupItem value="pick" id="pick-start" />
                <label className="Label" htmlFor="pick-start">
                  Pick from time logs
                </label>
              </div>
              <div className="flex gap-2 items-center">
                <RadioGroupItem value="insert" id="insert-start" />
                <label className="Label" htmlFor="insert-start">
                  Insert custom date
                </label>
              </div>
            </div>
          </RadioGroup>

          {shiftStartInput === "pick" && (
            <Select
              className="w-full max-w-[250px]"
              placeholder="Shift start"
              options={timeLogsPerUser && generateSelectOptions()}
              onChange={onShiftStartChange}
              value={shiftStart}
            />
          )}

          {shiftStartInput === "insert" && (
            <DatePicker date={shiftStartInsert} setDate={setShiftStartInsert} />
          )}
        </div>
        <div
          className="flex items-center gap-2"
          onClick={() => setShiftEnded(!shiftEnded)}
        >
          <Label> SHIFT END </Label>
          <button>
            {shiftEnded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        {shiftEnded && (
          <div className="flex gap-2 justify-between">
            <RadioGroup
              defaultValue={shiftEndInput}
              onValueChange={(value) => setShiftEndInput(value)}
            >
              <div className="flex flex-col gap-1">
                <div className="flex gap-2 items-center">
                  <RadioGroupItem value="pick" id="pick-end" />
                  <label className="Label" htmlFor="pick-end">
                    Pick from time logs
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  <RadioGroupItem value="insert" id="insert-end" />
                  <label className="Label" htmlFor="insert-end">
                    Insert custom date
                  </label>
                </div>
              </div>
            </RadioGroup>

            {shiftEndInput === "pick" && (
              <Select
                className="w-full max-w-[250px]"
                placeholder="Shift end"
                options={timeLogsPerUser && generateSelectOptions()}
                onChange={onShiftEndChange}
                value={shiftEnd}
              />
            )}

            {shiftEndInput === "insert" && (
              <DatePicker date={shiftEndInsert} setDate={setShiftEndInsert} />
            )}
          </div>
        )}
        <Button className="font-semibold w-full rounded-md" onClick={onSubmit}>
          Edit
        </Button>
      </DialogContent>
    )
  }
  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild={true}>
        <div className="hover:bg-[#F0F0F0] p-2 rounded cursor-pointer text-[#444] text-xs">
          Edit
        </div>
      </DialogTrigger>
      {renderEditForm()}
    </Dialog>
  )
}

export default ScheduleEdit

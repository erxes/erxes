import React, { useState } from "react"
import { useTimeLogs } from "@/modules/timeclock/hooks/useTimeLogs"
import { useTimeclocksMutation } from "@/modules/timeclock/hooks/useTimeclocksMutations"
import { ITimeclock, ITimelog } from "@/modules/timeclock/types"
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
  timeclock: ITimeclock
}

const TimeclockEdit = ({ timeclock }: Props) => {
  const { toast } = useToast()

  const [open, setOpen] = useState(false)

  const [shiftStart, setShiftStart] = useState(timeclock.shiftStart)
  const [timeStart, setTimeStart] = useState("")
  const [shiftStartInsert, setShiftStartInsert] = useState<Date | undefined>(
    timeclock.shiftStart
  )

  const [inDevice, setInDevice] = useState(null)
  const [outDevice, setOutDevice] = useState(null)

  const [shiftEnd, setShiftEnd] = useState(timeclock.shiftEnd)
  const [timeEnd, setTimeEnd] = useState("")
  const [shiftEndInsert, setShiftEndInsert] = useState<Date | undefined>(
    timeclock.shiftEnd || timeclock.shiftStart
  )

  const [shiftEnded, setShiftEnded] = useState(!timeclock.shiftActive)
  const [shiftStartInput, setShiftStartInput] = useState("pick")
  const [shiftEndInput, setShiftEndInput] = useState("pick")

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

  const onShiftStartChange = (selectedTime: any) => {
    setInDevice(selectedTime.deviceName)
    setShiftStart(selectedTime.value)
  }

  const onShiftEndChange = (selectedTime: any) => {
    setOutDevice(selectedTime.deviceName)
    setShiftEnd(selectedTime.value)
  }

  const generateSelectOptions = () => {
    return timeLogsPerUser.map((timelog: ITimelog) => ({
      value: timelog.timelog,
      label: dayjs(timelog.timelog).format("MM/DD/YYYY HH:mm"),
      deviceName: timelog.deviceName,
    }))
  }

  const generateDoc = () => {
    checkInput()
    const getShiftStart =
      (shiftStartInput === "pick" ? shiftStart : shiftStartInsert) ||
      timeclock.shiftStart

    let outDeviceType
    let inDeviceType

    let inDeviceName
    let outDeviceName

    if (
      shiftStart !== timeclock.shiftStart ||
      shiftStartInsert !== timeclock.shiftStart
    ) {
      inDeviceType = shiftStartInput === "pick" ? "log" : "insert"
      inDeviceName = inDevice
    }

    if (!shiftEnded) {
      return {
        _id: timeclock._id,
        shiftStart: getShiftStart,
        shiftActive: true,
        inDevice: inDeviceName,
        inDeviceType,
      }
    }

    if (
      shiftEnd !== timeclock.shiftEnd ||
      shiftEndInsert !== timeclock.shiftEnd
    ) {
      outDeviceType = shiftEndInput === "pick" ? "log" : "insert"
      outDeviceName = outDevice
    }

    return {
      _id: timeclock._id,
      shiftStart: getShiftStart,
      shiftEnd: shiftEndInput === "pick" ? shiftEnd : shiftEndInsert,
      shiftActive: !shiftEnded,
      inDeviceType,
      inDevice: inDeviceName,
      outDeviceType,
      outDevice: outDeviceName,
    }
  }

  const checkInput = () => {
    const getShiftStart = dayjs(
      (shiftStartInput === "pick" ? shiftStart : shiftStartInsert) ||
        timeclock.shiftStart
    )

    const getShiftEnd = dayjs(
      shiftEndInput === "pick" ? shiftEnd : shiftEndInsert
    )

    if (shiftStartInput === "insert" && !getShiftStart) {
      toast({ description: "Please insert shift start" })
      return false
    }
    if (shiftEndInput === "insert" && !getShiftEnd) {
      toast({ description: "Please insert shift end" })

      return false
    }

    if (getShiftStart && getShiftEnd && getShiftEnd < getShiftStart) {
      toast({ description: "Shift end can not be sooner than shift start" })
      return false
    }

    return true
  }

  const onSubmit = () => {
    const values = generateDoc()

    if (checkInput()) {
      editTimeclock(values)
      setOpen(false)
    }
  }

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
            <>
              <DatePicker
                date={shiftStartInsert}
                setDate={setShiftStartInsert}
              />
              <input
                type="time"
                name="shiftStart"
                className="appearance-none block w-1/6 text-center border border-input hover:bg-accent hover:text-accent-foreground rounded-md px-3 outline-none"
                value={timeStart}
                onChange={(e) => {
                  setTimeStart(e.target.value)
                }}
              />
            </>
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
              <>
                <DatePicker date={shiftEndInsert} setDate={setShiftEndInsert} />
                <input
                  type="time"
                  name="shiftEnd"
                  className="appearance-none block w-1/6 text-center border border-input hover:bg-accent hover:text-accent-foreground rounded-md px-3 outline-none"
                  value={timeEnd}
                  onChange={(e) => {
                    setTimeEnd(e.target.value)
                  }}
                />
              </>
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

export default TimeclockEdit

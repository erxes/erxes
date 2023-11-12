import React, { useEffect, useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useScheduleMutation } from "@/modules/timeclock/hooks/useScheduleMutation"
import {
  IScheduleConfig,
  IScheduleConfigOrder,
} from "@/modules/timeclock/types"
import { isSameDay } from "date-fns"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import { CalendarIcon, Plus, X } from "lucide-react"
import Select from "react-select"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import ScheduleConfigOrder from "./ScheduleConfigOrder"

type Props = {
  configsList: IScheduleConfig[]
  scheduleConfigOrder: IScheduleConfigOrder
}

const ScheduleRequest = ({ configsList, scheduleConfigOrder }: Props) => {
  const currentUser = useAtomValue(currentUserAtom)
  const [open, setOpen] = useState(false)

  const callBack = (result: string) => {
    if (result) {
      setOpen(false)
    }
  }

  const { checkDuplicateScheduleShifts } = useScheduleMutation({ callBack })

  const [scheduleConfigsOrderData, setScheduleConfigsOrderData] = useState({
    userId: currentUser?._id,
    orderedList: scheduleConfigOrder
      ? scheduleConfigOrder.orderedList
      : configsList.map((s, index) => ({
          scheduleConfigId: s._id,
          order: index,
          pinned: false,
          label: `${s.shiftStart} ~ ${s.shiftEnd}\xa0\xa0\xa0(${s.scheduleName})`,
        })),
  })

  const initialSelectValue = {
    value: scheduleConfigsOrderData.orderedList[0].scheduleConfigId,
    label: scheduleConfigsOrderData.orderedList[0].label,
  }

  const [days, setDays] = useState<Date[]>([new Date()])
  const [selectedValue, setSelectedValue] = useState(initialSelectValue)
  const [selectedValues, setSelectedValues] = useState([initialSelectValue])

  const [shifts, setShifts] = useState([
    {
      scheduleConfigId: configsList[0]._id,
      shiftStart: new Date(
        dayjs(days[0]).format("YYYY-MM-DD") + " " + configsList[0].shiftStart
      ),
      shiftEnd: new Date(
        dayjs(days[0]).format("YYYY-MM-DD") + " " + configsList[0].shiftEnd
      ),
      lunchBreakInMins: configsList[0].lunchBreakInMins,
    },
  ])

  // Select Section ////////////////////////////////////////////////////////
  const renderScheduleConfigOptions = () => {
    return scheduleConfigsOrderData.orderedList.map((s) => ({
      value: s.scheduleConfigId,
      label: s.label,
    }))
  }

  const handleConfigChange = (selectedConfigValue: any) => {
    setSelectedValue(selectedConfigValue)
    setSelectedValues(Array(days.length).fill(selectedConfigValue))

    const selectedConfigId = selectedConfigValue?.value
    const selectedConfig = configsList.find(
      (config) => config._id === selectedConfigId
    )

    setShifts(
      days.map((day) => ({
        scheduleConfigId: selectedConfig?._id!,
        shiftStart: new Date(
          dayjs(day).format("YYYY-MM-DD") + " " + selectedConfig?.shiftStart!
        ),
        shiftEnd: new Date(
          dayjs(day).format("YYYY-MM-DD") + " " + selectedConfig?.shiftEnd!
        ),
        lunchBreakInMins: selectedConfig?.lunchBreakInMins!,
      }))
    )
  }

  const handleConfigsChange = (selectedConfigValue: any, index: number) => {
    const updatedValues = [...selectedValues]
    updatedValues[index] = selectedConfigValue
    setSelectedValues(updatedValues)

    const selectedConfigId = selectedConfigValue?.value
    const selectedConfig = configsList.find(
      (config) => config._id === selectedConfigId
    )

    setShifts((prevShifts) => {
      const newShifts = [...prevShifts]

      newShifts[index] = {
        scheduleConfigId: selectedConfig?._id!,
        shiftStart: new Date(
          dayjs(days[index]).format("YYYY-MM-DD") +
            " " +
            selectedConfig?.shiftStart!
        ),
        shiftEnd: new Date(
          dayjs(days[index]).format("YYYY-MM-DD") +
            " " +
            selectedConfig?.shiftEnd!
        ),
        lunchBreakInMins: selectedConfig?.lunchBreakInMins!,
      }

      return newShifts
    })
  }
  ////////////////////////////////////////////////////////////////////////

  const handleDaySelection = (selectedDays: Date[]) => {
    setSelectedValues((prevValues) => [...prevValues, selectedValue])

    const selectedConfigId = selectedValue?.value
    const selectedConfig = configsList.find(
      (config) => config._id === selectedConfigId
    )

    setShifts((prevValues) => [
      ...prevValues,
      {
        scheduleConfigId: selectedConfig?._id!,
        shiftStart: new Date(
          dayjs(selectedDays?.at(-1)).format("YYYY-MM-DD") +
            " " +
            selectedConfig?.shiftStart!
        ),
        shiftEnd: new Date(
          dayjs(selectedDays?.at(-1)).format("YYYY-MM-DD") +
            " " +
            selectedConfig?.shiftEnd!
        ),
        lunchBreakInMins: selectedConfig?.lunchBreakInMins!,
      },
    ])
  }

  // Date Section ////////////////////////////////////////////////////////
  const handleCalendarChange = (selectedDays: Date[]) => {
    console.log(selectedDays)

    setDays(selectedDays)
    handleDaySelection(selectedDays)
  }

  const handleDatePicker = (selectedDay: Date, index: number) => {
    setDays((prevDays) => {
      const newDays = [...prevDays]
      newDays[index] = selectedDay
      return newDays
    })

    setShifts((prevShifts) => {
      const newShifts = [...prevShifts]
      const existingShift = newShifts[index]

      const startTime = dayjs(existingShift.shiftStart).format("HH:mm:ss")
      const endTime = dayjs(existingShift.shiftEnd).format("HH:mm:ss")

      newShifts[index] = {
        ...existingShift,
        shiftStart: new Date(
          dayjs(selectedDay).format("YYYY-MM-DD") + " " + startTime
        ),
        shiftEnd: new Date(
          dayjs(selectedDay).format("YYYY-MM-DD") + " " + endTime
        ),
      }

      return newShifts
    })
  }
  ////////////////////////////////////////////////////////////////////////

  // Input Section ////////////////////////////////////////////////////////
  const handleInputChange = (e: any, index: number) => {
    const { name, value } = e.target

    const updatedShifts = [...shifts]

    updatedShifts[index] = {
      ...updatedShifts[index],
      [name]:
        name === "lunchBreakInMins"
          ? parseInt(value, 10) || 0
          : new Date(dayjs(days[index]).format("YYYY-MM-DD") + " " + value),
    }

    setShifts(updatedShifts)
  }
  /////////////////////////////////////////////////////////////////////////
  console.log("shifts", shifts)

  const calculateScheduledDaysAndHours = () => {
    const totalDay = days.length
    let totalHours = 0
    let totalBreak = 0

    shifts.forEach((shift) => {
      const shiftStart = dayjs(shift.shiftStart)
      const shiftEnd = dayjs(shift.shiftEnd)
      const lunchBreakInMins = shift.lunchBreakInMins

      const duration = shiftEnd.diff(shiftStart, "minute") - lunchBreakInMins

      totalHours += duration / 60
      totalBreak += lunchBreakInMins
    })

    return {
      totalDay,
      totalHours: totalHours.toFixed(2),
      totalBreak,
    }
  }

  const displayTotalDaysHoursBreakMins = () => {
    const { totalDay, totalHours, totalBreak } =
      calculateScheduledDaysAndHours()
    return (
      <div className="flex gap-3 justify-center font-bold text-[20px]">
        <div className="flex gap-2">
          <div>Days : {totalDay}</div>
        </div>
        <div className="flex gap-2">
          <div>Hours : {totalHours}</div>
        </div>
        <div className="flex gap-2">
          <div>Break : {totalBreak}</div>
        </div>
      </div>
    )
  }

  const onSubmitClick = () => {
    const { totalBreak } = calculateScheduledDaysAndHours()
    checkDuplicateScheduleShifts({
      branchIds: [],
      departmentIds: [],
      userIds: currentUser?._id,
      shifts,
      totalBreakInMins: totalBreak,
      userType: "employee",
    })
    console.log({
      branchIds: [],
      departmentIds: [],
      userIds: currentUser?._id,
      shifts,
      totalBreakInMins: totalBreak,
      userType: "employee",
    })
  }

  const renderRequestForm = () => {
    return (
      <div className="flex flex-col gap-3">
        {displayTotalDaysHoursBreakMins()}
        <ScheduleConfigOrder
          scheduleConfigsOrderData={scheduleConfigsOrderData}
          setScheduleConfigsOrderData={setScheduleConfigsOrderData}
        />
        <Select
          options={renderScheduleConfigOptions()}
          onChange={handleConfigChange}
          value={selectedValue}
        />
        <div className="flex gap-1">
          <Popover>
            <PopoverTrigger asChild={true}>
              <Button
                variant={"outline"}
                className={"w-full justify-start text-left font-normal"}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {days?.length !== 0
                  ? `${days?.length} day selected`
                  : "Choose Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="multiple"
                selected={days}
                onSelect={(selectedDays) => handleCalendarChange(selectedDays!)}
              />
            </PopoverContent>
          </Popover>
          <Button
            onClick={() => {
              const maxDate =
                days.length > 0
                  ? dayjs(
                      Math.max(...days.map((date) => dayjs(date).valueOf()))
                    )
                  : dayjs()

              handleCalendarChange([...days, maxDate.add(1, "day").toDate()])
            }}
          >
            <Plus size={16} />
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {days?.map((day, index) => (
            <div key={index} className="flex gap-1">
              <DatePicker
                date={day}
                setDate={(selectedDay) => handleDatePicker(selectedDay!, index)}
                className="w-1/6"
                disabled={days}
              />
              <Select
                options={renderScheduleConfigOptions()}
                className="w-2/6"
                onChange={(value) => handleConfigsChange(value, index)}
                value={selectedValues[index]}
              />
              <input
                type="time"
                name="shiftStart"
                className="appearance-none block w-1/6 text-center border border-input hover:bg-accent hover:text-accent-foreground rounded-md px-3 outline-none"
                value={dayjs(shifts[index].shiftStart).format("HH:mm")}
                onChange={(e) => handleInputChange(e, index)}
              />
              <input
                type="time"
                name="shiftEnd"
                className="appearance-none block w-1/6 text-center border border-input hover:bg-accent hover:text-accent-foreground rounded-md px-3 outline-none"
                value={dayjs(shifts[index].shiftEnd).format("HH:mm")}
                onChange={(e) => handleInputChange(e, index)}
              />
              <input
                type="number"
                name="lunchBreakInMins"
                min={0}
                max={60}
                className="[appearance:textfield] 
                [&::-webkit-outer-spin-button]:appearance-none 
                [&::-webkit-inner-spin-button]:appearance-none 
                w-1/12 text-center border border-input 
                hover:bg-accent 
                hover:text-accent-foreground rounded-md px-3 outline-none"
                value={shifts[index].lunchBreakInMins}
                onChange={(e) => handleInputChange(e, index)}
              />
              <Button
                onClick={() => {
                  const newDays = [...days]
                  newDays.splice(index, 1)
                  setDays(newDays)

                  const newValues = [...selectedValues]
                  newValues.splice(index, 1)
                  setSelectedValues(newValues)

                  const newShift = [...shifts]
                  newShift.splice(index, 1)
                  setShifts(newShift)
                }}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
        <Button onClick={onSubmitClick}>Submit</Button>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild={true}>
        <button className="px-3 py-2 bg-[#3dcc38] text-[#fff] rounded-md">
          Schedule Request
        </button>
      </DialogTrigger>
      <DialogContent className="px-5">
        <DialogHeader>
          <DialogTitle>Create Schedule Request</DialogTitle>
        </DialogHeader>
        {renderRequestForm()}
      </DialogContent>
    </Dialog>
  )
}

export default ScheduleRequest

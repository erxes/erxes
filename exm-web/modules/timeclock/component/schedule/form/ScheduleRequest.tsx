import React, { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useSchedules } from "@/modules/timeclock/hooks/useSchedule"
import { useScheduleMutation } from "@/modules/timeclock/hooks/useScheduleMutation"
import {
  ISchedule,
  IScheduleConfig,
  IScheduleConfigOrder,
  IScheduleDate,
  IScheduleForm,
} from "@/modules/timeclock/types"
import { compareStartAndEndTime } from "@/modules/timeclock/utils"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import { CalendarIcon, ChevronDown, ChevronUp, Pin, PinOff } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Props = {
  configsList: IScheduleConfig[]
  scheduleConfigOrder: IScheduleConfigOrder
}

const ScheduleRequest = ({ configsList, scheduleConfigOrder }: Props) => {
  const [open, setOpen] = useState(false)
  const [toggleOrder, setToggleOrder] = useState(false)
  const currentUser = useAtomValue(currentUserAtom)

  const callBack = (result: string) => {
    return result
  }

  const { scheduleConfigOrderEdit } = useScheduleMutation({ callBack })

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

  const [selectedScheduleConfigId, setScheduleConfigId] = useState(
    scheduleConfigsOrderData.orderedList[0].scheduleConfigId
  )

  const omitTypeName = (scheduleConfigOrderData: IScheduleConfigOrder) => {
    const orderData = scheduleConfigOrderData

    return {
      userId: orderData.userId,
      orderedList: orderData.orderedList.map((s) => ({
        order: s.order,
        scheduleConfigId: s.scheduleConfigId,
        pinned: s.pinned,
        label: s.label,
      })),
    }
  }

  const scheduleConfigOrderDataEdit = (scheduleConfigOrderData: any) => {
    setScheduleConfigsOrderData(scheduleConfigOrderData)
    scheduleConfigOrderEdit(omitTypeName(scheduleConfigOrderData))
  }

  const renderScheduleConfigOptions = () => {
    return scheduleConfigsOrderData.orderedList.map((s) => ({
      value: s.scheduleConfigId,
      label: s.label,
    }))
  }

  const unpinScheduleConfig = (currentConfigOrder: number) => {
    let firstUnpinnedOrderNum = scheduleConfigsOrderData.orderedList.length

    const newScheduleConfigsOrderData = scheduleConfigsOrderData

    for (const scheduleConfigsOrderItem of newScheduleConfigsOrderData.orderedList) {
      if (!scheduleConfigsOrderItem.pinned) {
        firstUnpinnedOrderNum = scheduleConfigsOrderItem.order
        break
      }
    }

    const lastPinnedOrderNum = firstUnpinnedOrderNum - 1

    for (const scheduleConfigsOrderItem of newScheduleConfigsOrderData.orderedList) {
      if (scheduleConfigsOrderItem.order < currentConfigOrder) {
        continue
      }

      if (scheduleConfigsOrderItem.order > lastPinnedOrderNum) {
        break
      }

      if (scheduleConfigsOrderItem.order === currentConfigOrder) {
        scheduleConfigsOrderItem.order = lastPinnedOrderNum
        scheduleConfigsOrderItem.pinned = false
        continue
      }
      scheduleConfigsOrderItem.order = scheduleConfigsOrderItem.order - 1
    }

    scheduleConfigOrderDataEdit({ ...newScheduleConfigsOrderData })
  }

  const pinScheduleConfig = (currentConfigOrder: number) => {
    let firstUnpinnedOrderNum = 0

    const newScheduleConfigsOrderData = scheduleConfigsOrderData

    for (const scheduleConfigsOrderItem of newScheduleConfigsOrderData.orderedList) {
      if (!scheduleConfigsOrderItem.pinned) {
        firstUnpinnedOrderNum = scheduleConfigsOrderItem.order
        break
      }
    }

    const lastPinnedOrderNum = firstUnpinnedOrderNum - 1

    for (const scheduleConfigsOrderItem of newScheduleConfigsOrderData.orderedList) {
      if (scheduleConfigsOrderItem.order > currentConfigOrder) {
        break
      }

      if (scheduleConfigsOrderItem.order <= lastPinnedOrderNum) {
        continue
      }

      if (scheduleConfigsOrderItem.order === currentConfigOrder) {
        scheduleConfigsOrderItem.order = firstUnpinnedOrderNum
        scheduleConfigsOrderItem.pinned = true
        continue
      }
      scheduleConfigsOrderItem.order = scheduleConfigsOrderItem.order + 1
    }

    scheduleConfigOrderDataEdit({ ...newScheduleConfigsOrderData })
  }

  const [days, setDays] = useState<Date[]>([new Date()])
  const [date, setDate] = useState<Date>(new Date())

  const [scheduleDates, setScheduleDates] = useState<IScheduleForm>({})

  const scheduleConfigsObject = {}

  configsList?.map((config) => {
    scheduleConfigsObject[config._id] = config
  })

  const onScheduleConfigSelectForAll = (scheduleConfig) => {
    console.log("scheduleConfig", scheduleConfig)

    const selectedScheduleConfidId = scheduleConfig.value

    Object.keys(scheduleDates).forEach((day_key) => {
      if (scheduleDates[day_key].inputChecked) {
        return
      }
      const shiftDay = scheduleDates[day_key].shiftDate

      const getShiftStart = dayjs(
        shiftDay?.toLocaleDateString() +
          " " +
          scheduleConfigsObject[selectedScheduleConfidId].shiftStart
      ).toDate()

      const getShiftEnd = dayjs(
        shiftDay?.toLocaleDateString() +
          " " +
          scheduleConfigsObject[selectedScheduleConfidId].shiftEnd
      ).toDate()

      const [getCorrectShiftStart, getCorrectShiftEnd, overNightShift] =
        compareStartAndEndTime(
          scheduleDates,
          day_key,
          getShiftStart,
          getShiftEnd
        )
      scheduleDates[day_key].shiftStart = getCorrectShiftStart
      scheduleDates[day_key].shiftEnd = getCorrectShiftEnd
      scheduleDates[day_key].overnightShift = overNightShift
      scheduleDates[day_key].scheduleConfigId = selectedScheduleConfidId
    })

    setScheduleDates({ ...scheduleDates })
  }

  const displayTotalDaysHoursBreakMins = () => {
    let totalBreakMins = 0

    for (const scheduledDateIdx of Object.keys(days)) {
      totalBreakMins += days[scheduledDateIdx].lunchBreakInMins || 0
    }

    return (
      <div>
        <div>Total days {calculateScheduledDaysAndHours()[0]}</div>
        <div>Total hours {calculateScheduledDaysAndHours()[1]}</div>
        <div>Total break {(totalBreakMins / 60).toFixed(1)}</div>
      </div>
    )
  }

  const pickSubset = Object.values(scheduleDates).map((shift) => {
    return {
      _id: shift._id,
      shiftStart: shift.shiftStart,
      shiftEnd: shift.shiftEnd,
      scheduleConfigId: shift.inputChecked ? null : shift.scheduleConfigId,
      lunchBreakInMins: shift.lunchBreakInMins,
    }
  })

  const calculateScheduledDaysAndHours = () => {
    const totalDays = Object.keys(scheduleDates).length
    let totalHours = 0

    pickSubset.forEach((shift) => {
      totalHours +=
        (shift.shiftEnd.getTime() - shift.shiftStart.getTime()) / (1000 * 3600)
    })

    let totalBreakMins = 0

    for (const scheduledDateIdx of Object.keys(scheduleDates)) {
      totalBreakMins += scheduleDates[scheduledDateIdx].lunchBreakInMins || 0
    }

    return [
      totalDays,
      (totalHours - totalBreakMins / 60).toFixed(1),
      totalBreakMins,
    ]
  }

  const onSubmitClick = () => {
    // checkDuplicateScheduleShifts({
    //   branchIds: [],
    //   departmentIds: [],
    //   userIds: currentUser?._id,
    //   shifts: pickSubset,
    //   totalBreakInMins: calculateScheduledDaysAndHours()[2],
    //   userType: "employee",
    // })
    console.log({
      branchIds: [],
      departmentIds: [],
      userIds: currentUser?._id,
      shifts: pickSubset,
      totalBreakInMins: calculateScheduledDaysAndHours()[2],
      userType: "employee",
    })
  }

  const renderRequestForm = () => {
    return (
      <div className="flex flex-col gap-3">
        {displayTotalDaysHoursBreakMins()}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setToggleOrder(!toggleOrder)}
            className="flex gap-2 items-center"
          >
            <div className="flex gap-2 items-center">
              Select schedule configs order
              {toggleOrder ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>
          </button>
          {toggleOrder && (
            <div className="flex flex-col gap-2 px-3">
              {scheduleConfigsOrderData.orderedList
                .sort((a, b) => a.order - b.order)
                .map((s: any) => (
                  <div
                    key={s.order}
                    className="flex justify-between items-center"
                  >
                    <div>{s.label}</div>
                    {s.pinned ? (
                      <Pin
                        fill="purple"
                        onClick={() => unpinScheduleConfig(s.order)}
                        size={16}
                      />
                    ) : (
                      <Pin
                        onClick={() => pinScheduleConfig(s.order)}
                        size={16}
                      />
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
        <Select
          options={renderScheduleConfigOptions()}
          onChange={onScheduleConfigSelectForAll}
          value={selectedScheduleConfigId}
        />
        <div className="flex gap-2">
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
              <Calendar mode="multiple" selected={days} onSelect={setDays} />
            </PopoverContent>
          </Popover>
          <Button
            onClick={() => {
              setDays((prevDate: Date[]) => [
                ...prevDate,
                dayjs(prevDate.at(-1)).add(1, "day").toDate(),
              ])
            }}
          >
            +
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {days?.map((day, index) => (
            <div key={index} className="flex gap-1">
              <DatePicker
                date={day}
                setDate={(selectedDate) =>
                  handleDateChange(selectedDate, index)
                }
                className="w-[150px]"
              />
              <Select
                options={renderScheduleConfigOptions()}
                onChange={onScheduleConfigSelectForAll}
                className="w-[200px]"
                value={selectedScheduleConfigId}
              />
            </div>
          ))}
        </div>
        <button onClick={onSubmitClick}>Submit</button>
      </div>
    )
  }

  const handleDateChange = (selectedDate: Date, index: number) => {
    setDays((prevDays) => {
      const newDays = [...prevDays]
      newDays[index] = selectedDate
      return newDays
    })
  }

  const [selectedConfig, setSelectedConfig] = useState(configsList)

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

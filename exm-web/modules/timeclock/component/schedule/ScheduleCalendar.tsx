import React from "react"
import { Day, DayPicker, DayProps } from "react-day-picker"

import { IScheduleConfig, IShift } from "../../types"

type Props = {
  shifts: IShift[]
  configsList: IScheduleConfig[]
}

const ScheduleCalendar = ({ shifts, configsList }: Props) => {
  const dayContent = (days: DayProps) => {
    const selectedShift = shifts.find(
      (shift) => new Date(shift.shiftStart).getDate() === days.date.getDate()
    )

    if (!selectedShift) {
      return <Day {...days} />
    }

    const selectedConfig = configsList.find(
      (config) => config._id === selectedShift.scheduleConfigId
    )

    const isSameMonth =
      selectedShift &&
      new Date(selectedShift.shiftStart).getMonth() === days.date.getMonth()

    return (
      <>
        <Day {...days} />
        {selectedShift && isSameMonth && (
          <ul className="ml-3 mt-6 list-none">
            <li className="font-semibold truncate">
              {selectedConfig?.scheduleName}
            </li>
            <li>{new Date(selectedShift.shiftStart).toLocaleTimeString()}</li>
            <li>{new Date(selectedShift.shiftEnd).toLocaleTimeString()}</li>
          </ul>
        )}
      </>
    )
  }

  return (
    <DayPicker
      weekStartsOn={1}
      showOutsideDays
      classNames={{
        root: "m-0 border border-gray-300 rounded-md",
        months: "flex flex-col",
        caption:
          "flex p-4 border-b items-center justify-between bg-gray-100 rounded-t-md",
        caption_label: "font-bold text-lg text-gray-800",
        nav_button:
          "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-75 transition-opacity duration-300",
        table: "w-full border-collapse border-0",
        head_cell: "py-3 text-gray-600 w-8 font-normal text-sm",
        cell: "relative h-24 border-t border-r border-gray-300 rounded-md hover:shadow-md transition-all duration-300",
        day: "absolute top-0 h-8 w-8 p-3 font-normal text-gray-700 cursor-pointer transition-all duration-300",
        day_selected: "bg-blue-400",
        day_outside: "text-gray-500",
      }}
      components={{
        Day: (days) => {
          return <div>{dayContent(days)}</div>
        },
      }}
    />
  )
}

export default ScheduleCalendar

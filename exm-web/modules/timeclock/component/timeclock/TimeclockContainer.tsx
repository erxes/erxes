import React, { useState } from "react"
import { DateRange } from "react-day-picker"

import { DatePicker } from "@/components/ui/date-picker"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import SelectBranches from "@/components/select/SelectBranches"
import SelectDepartments from "@/components/select/SelectDepartments"
import SelectUsers from "@/components/select/SelectUsers"

import { useTimeclocks } from "../../hooks/useTimeclocks"
import SideBar from "../sidebar/SideBar"
import TimeclockList from "./TimeclockList"

type Props = {}

const TimeclockContainer = (props: Props) => {
  const { timelocksList, timelocksTotalCount } = useTimeclocks(
    1,
    20,
    "Wed Nov 01 2023 00:00:00 GMT+0800 (Ulaanbaatar Standard Time)",
    "Fri Dec 01 2023 00:00:00 GMT+0800 (Ulaanbaatar Standard Time)"
  )

  const actionBar = () => {
    return (
      <div className="flex gap-2">
        <button className="py-2 px-3 bg-[#673fbd] text-[#fff] rounded-md">
          Ectract all data
        </button>
        <button className="py-2 px-3 bg-[#3dcc38] text-[#fff] rounded-md">
          Start Shift
        </button>
      </div>
    )
  }

  return (
    <div className="h-[94vh] py-5 px-10 flex flex-col gap-3">
      <div className="flex justify-between">
        <SideBar />
        {actionBar()}
      </div>
      <TimeclockList timelocksList={timelocksList} />
    </div>
  )
}

export default TimeclockContainer

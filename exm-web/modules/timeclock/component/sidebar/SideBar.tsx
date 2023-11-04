import React, { useState } from "react"
import { DateRange } from "react-day-picker"

import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import SelectBranches from "@/components/select/SelectBranches"
import SelectDepartments from "@/components/select/SelectDepartments"
import SelectUsers from "@/components/select/SelectUsers"

type Props = {}

const SideBar = (props: Props) => {
  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>()
  const [branchIds, setBranchIds] = useState([] as string[])
  const [departmentIds, setDepartmentIds] = useState([] as string[])
  const [userIds, setUserIds] = useState([] as string[])

  const datePicker = () => {
    return (
      <div className="">
        <DatePickerWithRange date={selectedDate} setDate={setSelectedDate} />
      </div>
    )
  }

  const selectBranches = () => {
    return (
      <div>
        <SelectBranches branchIds={branchIds} onChange={setBranchIds} />
      </div>
    )
  }

  const selectDeparments = () => {
    return (
      <div>
        <SelectDepartments
          departmentIds={departmentIds}
          onChange={setDepartmentIds}
        />
      </div>
    )
  }

  const selectUsers = () => {
    return (
      <div>
        <SelectUsers userIds={userIds} onChange={setUserIds} />
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {datePicker()}
      {selectBranches()}
      {selectDeparments()}
      {selectUsers()}
    </div>
  )
}

export default SideBar

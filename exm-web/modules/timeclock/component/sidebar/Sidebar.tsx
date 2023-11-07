import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"

import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import SelectBranches from "@/components/select/SelectBranches"
import SelectDepartments from "@/components/select/SelectDepartments"
import SelectUsers from "@/components/select/SelectUsers"

type Props = {
  startDate: any
  endDate: any
  branch: any
  department: any
  user: any
}

const NOW = new Date()
// get 1st of the next Month
const startOfNextMonth = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 1)
// get 1st of this month
const startOfThisMonth = new Date(NOW.getFullYear(), NOW.getMonth(), 1)

const SideBar = ({ startDate, endDate, branch, department, user }: Props) => {
  const router = useRouter()

  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>({
    from: startOfThisMonth,
    to: startOfNextMonth,
  })

  const [branchIds, setBranchIds] = useState<string[] | []>(branch)
  const [departmentIds, setDepartmentIds] = useState<string[] | []>(department)
  const [userIds, setUserIds] = useState<string[] | []>(user)

  useEffect(() => {
    router.push(
      `?startDate=${selectedDate?.from}&endDate=${selectedDate?.to}
        ${branchIds.length !== 0 ? `&branchIds=${branchIds} ` : ""}
        ${departmentIds.length !== 0 ? `&departmentIds=${departmentIds} ` : ""}
        ${userIds.length !== 0 ? `&userIds=${userIds} ` : ""}
      `,
      {
        scroll: false,
      }
    )
  }, [selectedDate?.from, selectedDate?.to, branchIds, departmentIds, userIds])

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
    <div className="flex gap-3 w-full">
      {datePicker()}
      {selectBranches()}
      {selectDeparments()}
      {selectUsers()}
    </div>
  )
}

export default SideBar

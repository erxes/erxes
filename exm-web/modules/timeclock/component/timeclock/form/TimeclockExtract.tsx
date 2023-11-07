import React, { useState } from "react"
import { useTimeclocksMutation } from "@/modules/timeclock/hooks/useTimeclocksMutations"
import { DateRange } from "react-day-picker"
import Select from "react-select"

import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import SelectBranches from "@/components/select/SelectBranches"
import SelectDepartments from "@/components/select/SelectDepartments"
import SelectUsers from "@/components/select/SelectUsers"

type Props = {}

const TimeclockExtract = (props: Props) => {
  const { toast } = useToast()

  const [open, setOpen] = useState(false)

  const [branchIds, setBranchIds] = useState([] as string[])
  const [departmentIds, setDepartmentIds] = useState([] as string[])
  const [userIds, setUserIds] = useState([] as string[])

  const [extractType, setExtractType] = useState<any>("All team members")
  const [selectedDate, setSelectedDate] = useState<DateRange | undefined>({
    from: new Date(Date.now()),
    to: new Date(Date.now()),
  })

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { extractAllMsSqlData } = useTimeclocksMutation({ callBack })

  const options = [
    { value: "All team members", label: "All team members" },
    { value: "Choose team members", label: "Choose team members" },
  ]

  const checkDateRange = (start: Date, end: Date) => {
    if ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) > 8) {
      toast({
        description: "Please choose date range within 8 days",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const extractAllData = () => {
    const startDate = new Date(selectedDate?.from as Date)
    const endDate = new Date(selectedDate?.to as Date)

    if (checkDateRange(startDate, endDate)) {
      extractAllMsSqlData(startDate, endDate, {
        branchIds: branchIds as string[],
        departmentIds: departmentIds as string[],
        userIds: userIds as string[],
        extractAll: extractType === "All team members",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild={true}>
        <Button className="py-2 px-3 bg-[#673fbd] text-[#fff] rounded-md">
          Extract all data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extract all data</DialogTitle>
        </DialogHeader>

        <div className="h-full w-full flex flex-col gap-2">
          <DatePickerWithRange
            date={selectedDate}
            setDate={setSelectedDate}
            className="w-[100px]"
          />
          <Select
            defaultValue={options[0]}
            value={options.filter((option) => option.value === extractType)}
            options={options}
            onChange={(selectedOption) =>
              setExtractType(selectedOption && selectedOption.value)
            }
          />

          <div
            className={`w-full flex flex-col gap-2 ${
              extractType === "All team members" && "hidden"
            }`}
          >
            <SelectBranches branchIds={branchIds} onChange={setBranchIds} />
            <SelectDepartments
              departmentIds={departmentIds}
              onChange={setDepartmentIds}
            />

            <SelectUsers userIds={userIds} onChange={setUserIds} />
          </div>

          <Button
            className="py-[10px] px-3 bg-[#673fbd] text-[#fff] rounded-md"
            onClick={extractAllData}
          >
            Extract all data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TimeclockExtract

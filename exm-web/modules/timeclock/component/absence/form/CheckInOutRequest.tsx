import React, { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAbsenceMutation } from "@/modules/timeclock/hooks/useAbsenceMutation"
import { useTimeclocksMutation } from "@/modules/timeclock/hooks/useTimeclocksMutations"
import { IAttachment } from "@/modules/types"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
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

type Props = {}

const options = [
  { value: "Check in", label: "Check In" },
  { value: "Check out", label: "Check Out" },
]

const CheckInOutRequest = (props: Props) => {
  const currentUser = useAtomValue(currentUserAtom)
  const [open, setOpen] = useState(false)

  const [checkInOutType, setCheckInOutType] = useState<any>("Check in")
  const [checkInOutDate, setCheckInOutDate] = useState<Date | undefined>(
    new Date()
  )

  const callBack = (result: string) => {
    return
  }

  const { checkInOutRequest, loading } = useAbsenceMutation({ callBack })

  const onSubmit = () => {
    checkInOutRequest(checkInOutType, currentUser?._id!, checkInOutDate!)
  }

  const renderRequestForm = () => {
    return (
      <DialogContent className="max-w-lg">
        <DialogHeader>Create Check In/Out Request</DialogHeader>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <DatePicker
              date={checkInOutDate}
              setDate={setCheckInOutDate}
              className="w-full"
            />
            {/* <input
              type="time"
              defaultValue={time}
              onChange={(e) => setTime(e.target.value)}
            /> */}
          </div>

          <Select
            defaultValue={options[0]}
            value={options.filter((option) => option.value === checkInOutType)}
            options={options}
            onChange={(selectedOption) =>
              setCheckInOutType(selectedOption && selectedOption.value)
            }
          />
        </div>

        <Button className="font-semibold w-full rounded-md" onClick={onSubmit}>
          Submit
        </Button>
      </DialogContent>
    )
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild={true}>
        <button className="px-3 py-2 bg-[#6569df] text-[#fff] rounded-md">
          Create Check In/Out Request
        </button>
      </DialogTrigger>
      {renderRequestForm()}
    </Dialog>
  )
}

export default CheckInOutRequest

import React, { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAbsenceMutation } from "@/modules/timeclock/hooks/useAbsenceMutation"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import { Undo2 } from "lucide-react"
import Select from "react-select"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

  const [backTo, setBackTo] = useState(false)
  const [time, setTime] = useState(dayjs().format("HH:mm"))

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const timePart = time.split(":")

  checkInOutDate?.setHours(Number(timePart[0]))
  checkInOutDate?.setMinutes(Number(timePart[1]))

  const { checkInOutRequest, loading } = useAbsenceMutation({ callBack })

  const onSubmit = () => {
    checkInOutRequest(checkInOutType, currentUser?._id!, checkInOutDate!)
  }

  const renderRequestForm = () => {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Check In/Out Request</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <>
            {backTo ? (
              <div className="flex items-center text-center border border-input hover:bg-accent hover:text-accent-foreground rounded-md py-2.5 px-5 outline-none justify-around">
                <Undo2 size={15} onClick={() => setBackTo(false)} />
                <input
                  type="time"
                  name="shiftStart"
                  className="w-full text-center bg-transparent outline-none"
                  defaultValue={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            ) : (
              <DatePicker
                date={checkInOutDate}
                setDate={(date) => {
                  setCheckInOutDate(date)
                  setBackTo(true)
                }}
                className="w-full"
              />
            )}
          </>
          <Select
            defaultValue={options[0]}
            value={options.filter((option) => option.value === checkInOutType)}
            options={options}
            onChange={(selectedOption) =>
              setCheckInOutType(selectedOption && selectedOption.value)
            }
          />
        </div>

        <Button
          className="font-semibold w-full rounded-md"
          onClick={onSubmit}
          disabled={loading}
        >
          Submit
        </Button>
      </DialogContent>
    )
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild={true}>
        <Button className="bg-[#6569df] text-[#fff] rounded-md">
          Create Check In/Out Request
        </Button>
      </DialogTrigger>
      {renderRequestForm()}
    </Dialog>
  )
}

export default CheckInOutRequest

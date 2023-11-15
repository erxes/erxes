import React, { memo, useEffect, useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useTimeclocksMutation } from "@/modules/timeclock/hooks/useTimeclocksMutations"
import { isCurrentUserAdmin } from "@/modules/timeclock/utils"
import { useAtomValue } from "jotai"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import SelectUsers from "@/components/select/SelectUsers"

const SelectUsersMemoized = memo(SelectUsers)
const TimeclockShift = () => {
  const currentUser = useAtomValue(currentUserAtom)

  const [open, setOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  )

  const [shiftStarted, setShiftStarted] = useState(false)

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
      setShiftStarted(false)
    }
  }

  const { startClockTime, stopClockTime, loading } = useTimeclocksMutation({
    callBack,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  const startClock = () => {
    startClockTime(currentUser?._id!)
  }

  const stopClock = () => {
    stopClockTime(currentUser?._id!, "shiftId")
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild={true}>
        <button className="px-3 py-2 bg-[#3dcc38] text-[#fff] rounded-md">
          Start Shift
        </button>
      </DialogTrigger>
      <DialogContent className="px-5 max-w-lg">
        <DialogHeader>
          <DialogTitle>Start Shift</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col">
          <div className="flex font-bold text-[80px] py-10 justify-between">
            <div>{currentTime.split(" ")[0]}</div>
            <div>{currentTime.split(" ")[1]}</div>
          </div>
          <Button
            className="whitespace-nowrap"
            onClick={shiftStarted ? stopClock : startClock}
            disabled={loading}
          >
            {shiftStarted ? "Clock out" : "Clock in"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TimeclockShift

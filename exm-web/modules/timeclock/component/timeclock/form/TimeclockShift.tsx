import React, { useEffect, useState } from "react"
import { useTimeclocksMutation } from "@/modules/timeclock/hooks/useTimeclocksMutations"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import SelectUsers from "@/components/select/SelectUsers"

type Props = {}

const TimeclockShift = (props: Props) => {
  const [open, setOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  )
  const [userId, setUserId] = useState("")
  const [userIds, setUserIds] = useState([] as string[])
  const [shiftStarted, setShiftStarted] = useState(false)

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { startClockTime, stopClockTime } = useTimeclocksMutation({ callBack })

  // const returnTotalUserOptions = () => {
  //   const totalUserOptions: string[] = []

  //   for (const dept of departments) {
  //     totalUserOptions.push(...dept.userIds)
  //   }

  //   for (const branch of branches) {
  //     totalUserOptions.push(...branch.userIds)
  //   }

  //   if (currentUser) {
  //     totalUserOptions.push(currentUser._id)
  //   }

  //   return totalUserOptions
  // }

  // const filterParams = isCurrentUserAdmin(currentUser)
  //   ? {}
  //   : {
  //       ids: returnTotalUserOptions(),
  //       excludeIds: false,
  //     }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    return function cleanup() {
      clearInterval(timer)
    }
  }, [])

  // const onTeamMemberSelect = (memberId) => {
  //   setUserId(memberId)
  // }

  const startClock = () => {
    startClockTime(userId)
  }

  const stopClock = () => {
    stopClockTime(userId, "shiftId")
  }

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
      <DialogTrigger asChild={true}>
        <button className="px-3 bg-[#3dcc38] text-[#fff] rounded-md">
          Start Shift
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Shift</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex font-bold text-center text-[82px] py-10 justify-between">
            <div>{currentTime.split(" ")[0]}</div>
            <div>{currentTime.split(" ")[1]}</div>
          </div>
          <div className="flex justify-between">
            <SelectUsers userIds={userIds} onChange={setUserIds} />
            <Button
              className="whitespace-nowrap"
              onClick={shiftStarted ? stopClock : startClock}
            >
              {shiftStarted ? "Clock out" : "Clock in"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TimeclockShift

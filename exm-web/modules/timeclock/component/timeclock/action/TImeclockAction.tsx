import React from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"

import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"

import TimeclockShift from "../form/TimeclockShift"

const TimeclockAction = () => {
  const currentUser = useAtomValue(currentUserAtom)

  return (
    <div className="flex gap-2 p-0 justify-end">
      <TimeclockShift />
    </div>
  )
}

export default TimeclockAction

import React from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { useAtomValue } from "jotai"

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

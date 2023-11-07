import React from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { isCurrentUserAdmin } from "@/modules/timeclock/utils"
import { useAtomValue } from "jotai"

import TimeclockExtract from "../form/TimeclockExtract"
import TimeclockShift from "../form/TimeclockShift"

type Props = {}

const TimeclockAction = (props: Props) => {
  const currentUser = useAtomValue(currentUserAtom)

  return (
    <div className="flex gap-2 p-0">
      {isCurrentUserAdmin(currentUser) && <TimeclockExtract />}
      <TimeclockShift />
    </div>
  )
}

export default TimeclockAction

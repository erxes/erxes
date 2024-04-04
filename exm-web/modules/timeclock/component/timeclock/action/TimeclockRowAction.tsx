import React from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import { MoreVertical } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { ITimeclock } from "../../../types"
import TimeclockDelete from "../form/TimeclockDelete"
import TimeclockEdit from "../form/TimeclockEdit"

type Props = {
  timeclock: ITimeclock
}

const TimeclockRowAction = ({ timeclock }: Props) => {
  const currentUser = useAtomValue(currentUserAtom)
  const user = timeclock.user || ({} as IUser)
  return (
    <Popover>
      <PopoverTrigger asChild={true}>
        <button>
          <MoreVertical size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="end">
        {currentUser?.isOwner || currentUser?._id === user._id ? (
          <TimeclockEdit timeclock={timeclock} />
        ) : null}
        {currentUser?.isOwner || currentUser?._id === user._id ? (
          <TimeclockDelete id={timeclock._id} />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export default TimeclockRowAction

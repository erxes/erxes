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

import { ISchedule, ITimeclock } from "../../../types"
import ScheduleDelete from "../form/ScheduleDelete"
import ScheduleEdit from "../form/ScheduleEdit"

type Props = {
  schedule: ISchedule
}

const ScheduleRowAction = ({ schedule }: Props) => {
  const currentUser = useAtomValue(currentUserAtom)
  const user = schedule.user || ({} as IUser)
  return (
    <Popover>
      <PopoverTrigger asChild={true}>
        <button>
          <MoreVertical size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="end">
        {currentUser?.isOwner || currentUser?._id === user._id ? (
          <ScheduleEdit schedule={schedule} />
        ) : null}
        {currentUser?.isOwner || currentUser?._id === user._id ? (
          <ScheduleDelete id={schedule._id} />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export default ScheduleRowAction

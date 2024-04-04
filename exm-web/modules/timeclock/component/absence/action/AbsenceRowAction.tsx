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

import { IAbsence, IAbsenceType } from "../../../types"
import AbcenseDelete from "../form/AbsenceDelete"

type Props = {
  absence: IAbsence
}

const AbsenceRowAction = ({ absence }: Props) => {
  const currentUser = useAtomValue(currentUserAtom)
  const user = absence.user || ({} as IUser)
  return (
    <Popover>
      <PopoverTrigger asChild={true}>
        <button>
          <MoreVertical size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="end">
        {currentUser?.isOwner || currentUser?._id === user._id ? (
          <AbcenseDelete id={absence._id} />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export default AbsenceRowAction

"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import { CheckCheckIcon, ChevronDown, HeartIcon, X } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import useFeedMutation from "../hooks/useFeedMutation"
import { IFeed } from "../types"

const EventDropDown = ({ event }: { event: IFeed }) => {
  const callBack = () => {
    return
  }

  const { eventAction } = useFeedMutation({
    callBack,
  })

  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const checkUserGoingStatus = event?.eventData?.goingUserIds.includes(
    currentUser._id
  )
  const checkUserInterestedStatus =
    event?.eventData?.interestedUserIds.includes(currentUser._id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full">
        <div
          className={`${
            checkUserGoingStatus
              ? "bg-success-foreground text-white"
              : checkUserInterestedStatus
              ? "bg-primary text-white"
              : "bg-[#EAEAEA]"
          } text-[14px] pr-2 rounded-lg flex items-center w-full justify-between`}
          onClick={() => eventAction(event._id, "interested")}
        >
          {checkUserGoingStatus ? (
            <div className="flex items-center cursor-pointer gap-2 px-3 py-2">
              <CheckCheckIcon size={15} /> Going
            </div>
          ) : checkUserInterestedStatus ? (
            <div className="flex items-center cursor-pointer gap-2 px-3 py-2">
              <HeartIcon size={15} /> Interested
            </div>
          ) : (
            <div className="flex items-center cursor-pointer gap-2 px-3 py-2">
              <X size={15} /> Not interested
            </div>
          )}
          <ChevronDown size={18} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-0 shadow-none p-0 flex-col">
        <div
          className="flex items-center cursor-pointer gap-2 px-3 py-2 hover:bg-[#F0F0F0]"
          onClick={() => eventAction(event._id, "interested")}
        >
          <HeartIcon size={15} /> Interested
        </div>
        <div
          className="flex items-center cursor-pointer gap-2 px-3 py-2 hover:bg-[#F0F0F0]"
          onClick={() => eventAction(event._id, "going")}
        >
          <CheckCheckIcon size={15} /> Going
        </div>
        <div
          className="flex items-center cursor-pointer gap-2 px-3 py-2 hover:bg-[#F0F0F0]"
          onClick={() => eventAction(event._id, "neither")}
        >
          <X size={15} /> Not interested
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default EventDropDown

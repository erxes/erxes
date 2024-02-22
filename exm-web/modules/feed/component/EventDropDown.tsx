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

  const style = "flex items-center cursor-pointer gap-2 px-3 py-2"

  const renderOptions = (type: string) => {
    const Icon =
      type === "interested" ? HeartIcon : type === "going" ? CheckCheckIcon : X

    const colored =
      (type === "interested" && checkUserInterestedStatus) ||
      (type === "going" && checkUserGoingStatus) ||
      (type === "neither" &&
        !checkUserGoingStatus &&
        !checkUserInterestedStatus)

    return (
      <div
        className={`${style} hover:bg-[#F0F0F0] capitalize ${
          colored && "text-primary"
        }`}
        onClick={() => eventAction(event._id, type)}
      >
        <Icon size={15} /> {type}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          className={`${
            checkUserGoingStatus
              ? "bg-success-foreground text-white"
              : checkUserInterestedStatus
              ? "bg-primary-light text-white"
              : "bg-[#EAEAEA]"
          } text-[14px] rounded-lg flex items-center w-full justify-between`}
          onClick={() => eventAction(event._id, "interested")}
        >
          {checkUserGoingStatus ? (
            <div className={style}>
              <CheckCheckIcon size={15} /> Going
            </div>
          ) : checkUserInterestedStatus ? (
            <div className={style}>
              <HeartIcon size={15} /> Interested
            </div>
          ) : (
            <div className={style}>
              <X size={15} /> Not reacted
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="shadow-none p-0 flex-col">
        {renderOptions("interested")}
        {renderOptions("going")}
        {renderOptions("neither")}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default EventDropDown

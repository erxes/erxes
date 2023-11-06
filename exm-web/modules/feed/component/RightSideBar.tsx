"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import {
  CheckCheckIcon,
  ChevronDown,
  ClockIcon,
  HeartIcon,
  MapPinIcon,
  X,
} from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "@/components/ui/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUsers } from "@/components/hooks/useUsers"

import RightNavbar from "../../navbar/component/RightNavbar"
import { useEvents } from "../hooks/useEvent"
import useFeedMutation from "../hooks/useFeedMutation"

const RightSideBar = () => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const { events } = useEvents()
  const { users } = useUsers({})
  const callBack = () => {
    return
  }

  const { eventAction } = useFeedMutation({
    callBack,
  })

  const today = dayjs(new Date()).format("YYYY-MM-DD")

  const todayEvents =
    events &&
    events.map((e) => {
      if (
        dayjs(e?.eventData?.startDate).format("YYYY-MM-DD") <= today &&
        today <= dayjs(e?.eventData?.endDate).format("YYYY-MM-DD")
      ) {
        return e
      }

      return null
    })

  const checkedTodaysEvent = (todayEvents || []).filter(
    (e) =>
      (e?.eventData?.visibility === "private" &&
        e?.recipientIds.includes(currentUser._id)) ||
      e?.eventData?.visibility === "public"
  )

  return (
    <div>
      <RightNavbar />

      <ScrollArea className="h-[calc(100vh-65px)] bg-[#F8F9FA]">
        <div className="pb-4 pr-4">
          <CardHeader className="text-black font-bold text-lg pl-0">
            Today's events
          </CardHeader>
          {((checkedTodaysEvent && checkedTodaysEvent) || []).map(
            (item: any) => {
              if (item === null) {
                return null
              }

              const checkUserGoingStatus =
                item?.eventData.goingUserIds.includes(currentUser._id)
              const checkUserInterestedStatus =
                item?.eventData.interestedUserIds.includes(currentUser._id)

              const goingUsers = users.filter((user) =>
                item?.eventData.goingUserIds.includes(user._id)
              )

              return (
                <Card key={item._id} className="border-0 mb-2">
                  <CardContent className="pt-4">
                    {item.images && item.images.length > 0 && (
                      <div className="w-full h-[150px] mb-2 event-card-image-shadow rounded-[9px]">
                        <Image
                          src={item.images[0].url}
                          alt="event photo"
                          width={500}
                          height={500}
                          className="w-full h-full object-cover rounded-[9px]"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-[16px] mb-2">
                        {item.title}
                      </h3>
                      <div className="flex items-center mb-1 text-[#484848] mb-2">
                        <MapPinIcon size={16} className="mr-1" />
                        {item.eventData?.where || ""}
                      </div>

                      <div className="text-[#484848] text-xs mt-1 text-[14px]">
                        <div className="flex items-center text-[13px] text-[#484848]">
                          <ClockIcon size={16} className="mr-1" />
                          {dayjs(item.eventData?.startDate).format(
                            "MM/DD/YY h:mm A"
                          )}{" "}
                          ~{" "}
                          {dayjs(item.eventData?.endDate).format(
                            "MM/DD/YY h:mm A"
                          )}
                        </div>
                        {goingUsers.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            <div id="going users" className="flex -space-x-1">
                              {goingUsers.slice(0, 5).map((user) => (
                                <Image
                                  src={
                                    user.details && user.details.avatar
                                      ? user.details.avatar
                                      : "/avatar-colored.svg"
                                  }
                                  alt="avatar"
                                  key={user._id}
                                  width={100}
                                  height={100}
                                  className="inline-block w-6 h-6 rounded-full object-cover ring-1 ring-primary "
                                />
                              ))}
                            </div>
                            {goingUsers.length > 5 && (
                              <div>+ {goingUsers.length - 5} going</div>
                            )}
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="w-full">
                          <div
                            className={`${
                              checkUserGoingStatus || checkUserInterestedStatus
                                ? "bg-primary text-white"
                                : "bg-[#EAEAEA]"
                            } text-[14px] pr-2 rounded-lg flex items-center w-full justify-between mt-3`}
                            onClick={() => eventAction(item._id, "interested")}
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
                            onClick={() => eventAction(item._id, "interested")}
                          >
                            <HeartIcon size={15} /> Interested
                          </div>
                          <div
                            className="flex items-center cursor-pointer gap-2 px-3 py-2 hover:bg-[#F0F0F0]"
                            onClick={() => eventAction(item._id, "going")}
                          >
                            <CheckCheckIcon size={15} /> Going
                          </div>
                          <div
                            className="flex items-center cursor-pointer gap-2 px-3 py-2 hover:bg-[#F0F0F0]"
                            onClick={() => eventAction(item._id, "neither")}
                          >
                            <X size={15} /> Not interested
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )
            }
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default RightSideBar

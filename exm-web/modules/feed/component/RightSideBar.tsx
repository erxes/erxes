"use client"

import { useEffect } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import { ClockIcon, MapPinIcon } from "lucide-react"
import { useInView } from "react-intersection-observer"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "@/components/ui/image"
import Loader from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUsers } from "@/components/hooks/useUsers"

import RightNavbar from "../../navbar/component/RightNavbar"
import { useEvents } from "../hooks/useEvent"
import EventDropDown from "./EventDropDown"

const RightSideBar = () => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const { events, handleLoadMore, loading, totalCount } = useEvents()
  const { users } = useUsers({})

  const { ref, inView } = useInView({
    threshold: 0,
  })

  useEffect(() => {
    if (inView) {
      handleLoadMore()
    }
  }, [inView, handleLoadMore])

  if (loading) {
    return <Loader />
  }

  const today = dayjs(new Date()).format("YYYY-MM-DD")

  const todayEvents =
    events &&
    events.filter((e) => {
      if (
        dayjs(e?.eventData?.startDate).format("YYYY-MM-DD") <= today &&
        today <= dayjs(e?.eventData?.endDate).format("YYYY-MM-DD")
      ) {
        return e
      }
    })

  const checkedTodaysEvent = (todayEvents || []).filter(
    (e) =>
      (e?.eventData?.visibility === "private" &&
        e?.recipientIds.includes(currentUser._id)) ||
      e?.eventData?.visibility === "public"
  )

  const renderLoadMore = () => {
    if (!loading && totalCount === events.length) {
      return null
    }

    return (
      <div ref={ref}>
        <Loader />
      </div>
    )
  }

  return (
    <div>
      <RightNavbar />

      <CardHeader className="text-black font-bold text-lg pl-0 bg-[#F8F9FA]">
        Today's events
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-125px)] bg-[#F8F9FA]">
        <div className="pb-4 pr-4">
          {((checkedTodaysEvent && checkedTodaysEvent) || []).map(
            (item: any) => {
              if (item === null) {
                return null
              }

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

                      <div className="text-[#484848] text-xs mt-1 text-[14px] mb-3">
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
                      <EventDropDown event={item} />
                    </div>
                  </CardContent>
                </Card>
              )
            }
          )}
          {renderLoadMore()}
        </div>
      </ScrollArea>
    </div>
  )
}

export default RightSideBar

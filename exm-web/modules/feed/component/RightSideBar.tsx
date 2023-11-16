"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useAtomValue } from "jotai"
import { ClockIcon, MapPinIcon } from "lucide-react"
import { useInView } from "react-intersection-observer"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "@/components/ui/image"
import Loader from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUsers } from "@/components/hooks/useUsers"

import RightNavbar from "../../navbar/component/RightNavbar"
import { useEvents } from "../hooks/useEvent"
import EventDropDown from "./EventDropDown"

dayjs.extend(relativeTime)

const RightSideBar = () => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const { events, handleLoadMore, loading, totalCount } = useEvents()
  const { users } = useUsers({})
  const [date, setDate] = useState(new Date())

  const router = useRouter()
  const searchParams = useSearchParams()

  const type = searchParams.get("contentType")
  const dateFilter = searchParams.get("dateFilter")

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

  const onClickEvent = (id: string) => {
    return (window.location.href = `detail?contentType=event&id=${id}`)
  }

  const renderTodaysEvents = () => {
    if (!checkedTodaysEvent || checkedTodaysEvent.length === 0) {
      return (
        <div className="pb-4 pr-4">
          <Card className="border-0 mb-2">
            <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center">
              <Image
                src="https://office.erxes.io/images/actions/19.svg"
                alt="event photo"
                width={500}
                height={500}
                className="w-[70%] h-[70%] object-contain rounded-[9px]"
              />
              <p className="text-[#5E5B5B] mt-4">There is no event for today</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="pb-4 pr-4">
        {(checkedTodaysEvent || []).map((item: any) => {
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
                  <h3
                    className="font-semibold text-[16px] mb-2 cursor-pointer"
                    onClick={() => onClickEvent(item._id)}
                  >
                    {item.title}
                  </h3>
                  <div
                    className="flex items-center mb-1 text-[#484848] mb-2 cursor-pointer"
                    onClick={() => onClickEvent(item._id)}
                  >
                    <MapPinIcon size={16} className="mr-1" />
                    {item.eventData?.where || ""}
                  </div>

                  <div className="text-[#484848] text-xs mt-1 text-[14px] mb-3">
                    <div
                      className="flex items-center text-[13px] text-[#484848] cursor-pointer"
                      onClick={() => onClickEvent(item._id)}
                    >
                      <ClockIcon size={16} className="mr-1" />
                      {dayjs(item.eventData?.startDate).format(
                        "MM/DD/YY h:mm A"
                      )}{" "}
                      ~{" "}
                      {dayjs(item.eventData?.endDate).format("MM/DD/YY h:mm A")}
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
        })}
        {renderLoadMore()}
      </div>
    )
  }

  const renderRightSidebar = () => {
    if (type === "publicHoliday") {
      return (
        <ScrollArea className="h-[calc(100vh-60px)]">
          <CardHeader className="text-black font-bold text-lg pl-0">
            Select Calendar
          </CardHeader>
          <Calendar
            className="bg-white mr-4 rounded-lg py-[30px] flex justify-center"
            mode="single"
            selected={date}
            onSelect={(e) => setDate(e || new Date())}
          />

          <Button
            className="mt-6 bg-primary-light"
            onClick={() =>
              router.push(
                `/?contentType=publicHoliday&dateFilter=${dayjs(date).format(
                  "MMM DD YYYY"
                )}`
              )
            }
          >
            Apply
          </Button>
          {dateFilter && (
            <Button
              className="mt-6 ml-6 bg-[#BFBFBF]"
              onClick={() => router.push(`/?contentType=publicHoliday`)}
            >
              Cancel
            </Button>
          )}
          <CardHeader className="text-black font-bold text-lg pl-0">
            Today's events
          </CardHeader>
          {renderTodaysEvents()}
        </ScrollArea>
      )
    }

    return (
      <>
        <CardHeader className="text-black font-bold text-lg pl-0">
          Today's events
        </CardHeader>
        <ScrollArea className="h-[calc(100vh-125px)]">
          {renderTodaysEvents()}
        </ScrollArea>
      </>
    )
  }

  return (
    <div className="bg-[#F8F9FA]">
      <RightNavbar />
      {renderRightSidebar()}
    </div>
  )
}

export default RightSideBar

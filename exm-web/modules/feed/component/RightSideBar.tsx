"use client"

import Image from "next/image"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import { ClockIcon, MapPinIcon, UsersIcon } from "lucide-react"

import { readFile } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import LoadingPost from "@/components/ui/loadingPost"

import { useEvents } from "../hooks/useEvent"

const RightSideBar = () => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const { events, loading } = useEvents()

  const today = dayjs(new Date()).format("YYYY-MM-DD")

  if (loading) {
    return <LoadingPost />
  }

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

  const checkedTodaysEvent = (todayEvents || []).map((e) => {
    if (
      (e?.eventData?.visibility === "private" &&
        e?.recipientIds.includes(currentUser._id)) ||
      e?.eventData?.visibility === "public"
    ) {
      return e
    }

    return null
  })

  return (
    <div className="p-4">
      <div>
        <div className="flex items-center">
          <Image
            src={
              currentUser.details && currentUser.details.avatar
                ? readFile(currentUser?.details?.avatar)
                : "/user.png"
            }
            alt="User Profile"
            width={500}
            height={500}
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3 mt-2">
            <div className="text-sm font-bold text-gray-700 mb-1 flex flex-col">
              {currentUser?.details.fullName ||
                currentUser?.username ||
                currentUser?.email}
              <span className="text-xs font-medium">
                {currentUser?.username}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 mt-4">
        {((checkedTodaysEvent && checkedTodaysEvent) || []).map((item: any) => {
          if (item === null) {
            return null
          }

          return (
            <Card key={item._id} className="border-0 mb-2">
              <CardHeader className="text-[#444] font-semibold">
                Today's events
              </CardHeader>
              <CardContent className="px-4">
                {item.images && item.images.length > 0 && (
                  <div className="">
                    <img src={readFile(item.images[0].url)} alt="event-img" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <div className="text-[#444]">{item.eventData.where}</div>

                  <div className="text-[#444] text-xs mt-1">
                    <div className="flex items-center mb-2">
                      <ClockIcon size={16} className="mr-1" />
                      {dayjs(item.eventData?.startDate).format(
                        "MM/DD/YYYY h:mm A"
                      )}{" "}
                      ~{" "}
                      {dayjs(item.eventData?.endDate).format(
                        "MM/DD/YYYY h:mm A"
                      )}
                    </div>
                    <div className="flex items-center mb-2">
                      <UsersIcon size={16} className="mr-1" />
                      <b>{item.eventData?.goingUserIds.length}</b>&nbsp;Going
                      •&nbsp;
                      <b>{item.eventData?.interestedUserIds?.length}</b>
                      &nbsp;Interested
                    </div>

                    <div className="flex items-center mb-2">
                      <MapPinIcon size={16} className="mr-1" />
                      {item.eventData?.where || ""}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default RightSideBar

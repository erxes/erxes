"use client"

import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import { ClockIcon, MapPinIcon, UsersIcon } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "@/components/ui/image"
import { ScrollArea } from "@/components/ui/scroll-area"

import RightNavbar from "../../navbar/component/RightNavbar"
import { useEvents } from "../hooks/useEvent"

const RightSideBar = () => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const { events } = useEvents()

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
    <div>
      <RightNavbar />

      <ScrollArea className="h-[calc(100vh-100px)] bg-[#F8F9FA]">
        <div className="p-2 mt-4">
          {((checkedTodaysEvent && checkedTodaysEvent) || []).map(
            (item: any) => {
              if (item === null) {
                return null
              }

              return (
                <Card key={item._id} className="border-0 mb-2">
                  <CardHeader className="text-[#644BB9] font-bold text-lg">
                    Today's events
                  </CardHeader>
                  <CardContent className="px-4">
                    <div className="flex items-center mb-1">
                      <MapPinIcon size={16} className="mr-1" />
                      {item.eventData?.where || ""}
                    </div>
                    {item.images && item.images.length > 0 && (
                      <div className="w-full h-[150px]">
                        <Image
                          src={item.images[0].url}
                          alt="event photo"
                          width={500}
                          height={500}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
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
                          <b>{item.eventData?.goingUserIds.length}</b>
                          &nbsp;Going •&nbsp;
                          <b>{item.eventData?.interestedUserIds?.length}</b>
                          &nbsp;Interested
                        </div>
                      </div>
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

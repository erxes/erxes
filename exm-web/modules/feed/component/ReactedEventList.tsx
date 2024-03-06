"use client"

import dynamic from "next/dynamic"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"

import LoadingCard from "@/components/ui/loading-card"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useUserEvents } from "../hooks/useUserEvents"

const EventItem = dynamic(() => import("./EventItem"))

const ReactedEventList = () => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const { events, loading } = useUserEvents({ userId: currentUser._id })

  const goingEvents = events.goingEvents
  const interestedEvents = events.interestedEvents

  const goingEventList = () => {
    return (
      <div className="border border-exm p-4 max-w-[880px] w-full rounded-lg">
        <div className="flex justify-between font-semibold w-full text-base mb-4">
          <div>Going</div>
        </div>
        <div className="rounded-sm border border-exm">
          {goingEvents.map((event: any, index: number) => (
            <EventItem postId={event._id} key={index} myEvent={true} />
          ))}
        </div>
      </div>
    )
  }

  const interestedEventList = () => {
    return (
      <div className="border border-exm p-4 max-w-[880px] w-full rounded-lg">
        <div className="flex justify-between font-semibold w-full text-base mb-4">
          <div>Interested</div>
        </div>
        <div className="max-w-[880px] w-full flex flex-wrap gap-4">
          {interestedEvents.map((event: any, index: number) => (
            <EventItem postId={event._id} key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <ScrollArea className="h-screen">
        <LoadingCard />
      </ScrollArea>
    )
  }

  return (
    <div className="h-[calc(100vh-124px)] overflow-auto w-full flex flex-col items-center gap-4 relative pb-4 px-4">
      {goingEventList()}
      {interestedEventList()}

      {loading && (
        <>
          <LoadingCard />
        </>
      )}
    </div>
  )
}

export default ReactedEventList

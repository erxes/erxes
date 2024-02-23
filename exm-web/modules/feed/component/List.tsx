"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import { useInView } from "react-intersection-observer"

import LoadingCard from "@/components/ui/loading-card"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useFeeds } from "../hooks/useFeed"
import { useUserEvents } from "../hooks/useUserEvents"
import { IFeed } from "../types"

const PostItem = dynamic(() => import("./PostItem"))
const EventItem = dynamic(() => import("./EventItem"))
const ReactedEventList = dynamic(() => import("./ReactedEventList"))

const FeedForm = dynamic(() => import("../component/form/FeedForm"))

const List = ({ contentType }: { contentType: string }) => {
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const { feeds, feedsCount, loading, handleLoadMore } = useFeeds(contentType)
  const { events } = useUserEvents({ userId: currentUser._id })
  const [seeAllEvent, setSeeAllEvent] = useState(false)

  const datas = feeds || []

  const pinnedList = datas.filter((data) => data.isPinned)
  const normalList = datas.filter((data) => !data.isPinned)

  const showList = (items: IFeed[]) => {
    if (contentType === "event") {
      return (
        <div className="max-w-[880px] w-full flex flex-wrap gap-4">
          {items.map((filteredItem: any, index) => (
            <EventItem postId={filteredItem._id} key={index} />
          ))}
        </div>
      )
    }

    return items.map((filteredItem: any) => (
      <PostItem postId={filteredItem._id} key={filteredItem._id} />
    ))
  }

  const userEvent = () => {
    if (contentType !== "event") {
      return null
    } else {
      const myEvents = events.goingEvents.concat(events.interestedEvents)

      return (
        <div className="border border-exm p-4 max-w-[880px] w-full rounded-lg">
          <div className="flex justify-between font-semibold w-full text-base mb-4">
            <div>Your event</div>
            <div
              className="text-primary cursor-pointer"
              onClick={() => setSeeAllEvent(true)}
            >
              See All
            </div>
          </div>
          <div className="rounded-sm border border-exm">
            {myEvents.slice(2).map((event: any, index: number) => (
              <EventItem postId={event._id} key={index} myEvent={true} />
            ))}
          </div>
        </div>
      )
    }
  }

  useEffect(() => {
    if (inView) {
      handleLoadMore()
    }
  }, [inView, handleLoadMore])

  if (loading) {
    return (
      <ScrollArea className="h-screen">
        <FeedForm contentType={contentType} />
        <LoadingCard />
      </ScrollArea>
    )
  }

  if (contentType === "event" && seeAllEvent) {
    return (
      <div className="h-[calc(100vh-124px)] overflow-auto w-full flex flex-col items-center gap-4 relative pb-4 px-4 mt-4">
        <ReactedEventList />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-124px)] overflow-auto w-full flex flex-col items-center gap-4 relative pb-4 px-4">
      <FeedForm contentType={contentType} />
      {userEvent()}
      {pinnedList.length > 0 && showList(pinnedList)}
      {showList(normalList)}

      {loading && (
        <>
          <LoadingCard />
        </>
      )}

      {!loading && feeds.length < feedsCount && (
        <div ref={ref}>
          <LoadingCard />
        </div>
      )}
    </div>
  )
}

export default List

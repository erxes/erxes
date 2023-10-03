"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useAtomValue } from "jotai"
import { useInView } from "react-intersection-observer"

import LoadingCard from "@/components/ui/loading-card"
import { ScrollArea } from "@/components/ui/scroll-area"

import { useFeeds } from "../hooks/useFeed"
import { IFeed } from "../types"
import PostItem from "./PostItem"

const FeedForm = dynamic(() => import("../component/form/FeedForm"))

const List = ({ contentType }: { contentType: string }) => {
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { feeds, feedsCount, loading, handleLoadMore } = useFeeds(contentType)

  const datas = feeds || []

  let pinnedList
  let normalList

  if (contentType === "event") {
    pinnedList = datas.filter(
      (data) =>
        data.isPinned &&
        ((data.eventData?.visibility === "private" &&
          data.recipientIds.includes(currentUser?._id)) ||
          data.eventData?.visibility === "public")
    )
    normalList = datas.filter(
      (data) =>
        !data.isPinned &&
        ((data.eventData?.visibility === "private" &&
          data.recipientIds.includes(currentUser?._id)) ||
          data.eventData?.visibility === "public")
    )
  } else {
    pinnedList = datas.filter((data) => data.isPinned)
    normalList = datas.filter((data) => !data.isPinned)
  }

  const showList = (items: IFeed[]) => {
    return items.map((filteredItem: any) => (
      <PostItem postId={filteredItem._id} key={filteredItem._id} />
    ))
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

  return (
    <ScrollArea className="h-[94vh]">
      <FeedForm contentType={contentType} />
      {showList(pinnedList)}
      {showList(normalList)}

      {loading && (
        <>
          <LoadingCard type="chatlist" />
        </>
      )}

      {!loading && feeds.length < feedsCount && (
        <div ref={ref}>
          <LoadingCard />
        </div>
      )}
    </ScrollArea>
  )
}

export default List

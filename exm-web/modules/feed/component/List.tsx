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

const PostItem = dynamic(() => import("./PostItem"))
const EventItem = dynamic(() => import("./EventItem"))

const FeedForm = dynamic(() => import("../component/form/FeedForm"))

const List = ({ contentType }: { contentType: string }) => {
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { feeds, feedsCount, loading, handleLoadMore } = useFeeds(contentType)

  const datas = feeds || []

  const pinnedList = datas.filter((data) => data.isPinned)
  const normalList = datas.filter((data) => !data.isPinned)

  const showList = (items: IFeed[]) => {
    if (contentType === "event") {
      return items.map((filteredItem: any, index) => (
        <EventItem postId={filteredItem._id} key={index} />
      ))
    }

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

  const renderForm = () => {
    return <FeedForm contentType={contentType} />
  }

  return (
    <div className="h-[calc(100vh-68px)] overflow-auto w-full flex flex-col items-center gap-4 relative pb-4 px-4">
      {renderForm()}
      {showList(pinnedList)}
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
      <div className="fixed bottom-0 right-0">hi</div>
    </div>
  )
}

export default List

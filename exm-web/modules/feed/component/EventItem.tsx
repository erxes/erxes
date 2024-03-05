"use client"

import { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useFeedDetail } from "@/modules/feed/hooks/useFeedDetail"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import { Calendar, MapPinIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import Image from "@/components/ui/image"
import LoadingCard from "@/components/ui/loading-card"

import { useComments } from "../hooks/useComment"
import { useReactionQuery } from "../hooks/useReactionQuery"
import EventDropDown from "./EventDropDown"
import FeedActions from "./FeedActions"
import FeedDetail from "./FeedDetail"

const EventItem = ({
  postId,
  myEvent,
}: {
  postId: string
  myEvent?: boolean
}): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [commentOpen, setCommentOpen] = useState(false)
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)
  const [detailOpen, setDetailOpen] = useState(false)

  const { feed, loading } = useFeedDetail({ feedId: postId })
  const {
    comments,
    commentsCount,
    loading: commentLoading,
    handleLoadMore,
  } = useComments(postId)
  const { emojiReactedUser, loadingReactedUsers } = useReactionQuery({
    feedId: postId,
  })

  if (loading || loadingReactedUsers) {
    return <LoadingCard />
  }

  const user = feed.createdUser || ({} as IUser)
  const userDetail = user.details

  const urlRegex = /(https?:\/\/[^\s]+)/g

  let updatedDescription = ""

  if (feed.description) {
    const matches = feed.description.match(urlRegex)

    if (matches) {
      updatedDescription = matches.reduce(
        (prevDescription: string, link: string) =>
          prevDescription.replace(link, ""),
        feed.description
      )
    } else {
      updatedDescription = feed.description
    }
  }

  const renderEventInfo = () => {
    const { eventData } = feed

    const endSameDay =
      dayjs(eventData?.startDate).format("MMM DD, YYYY") ===
      dayjs(eventData?.endDate).format("MMM DD, YYYY")

    return (
      <div className="text-[#5E5B5B] mb-2">
        <div className="flex items-center mb-2">
          <Calendar size={18} className="mr-1" />
          {dayjs(eventData?.startDate).format("MM/DD/YY HH:mm")} ~{" "}
          {endSameDay
            ? dayjs(eventData?.endDate).format("HH:mm")
            : dayjs(eventData?.endDate).format("MM/DD/YY HH:mm")}
        </div>
        <div className="flex items-center mb-2">
          <MapPinIcon size={18} className="mr-1" />
          <span className="w-[calc(100%-22px)] truncate">
            {eventData?.where || ""}
          </span>
        </div>
      </div>
    )
  }

  const renderImage = () => {
    if (!feed.images || feed.images.length === 0) {
      return null
    }

    return (
      <Image
        alt="image"
        src={feed.images[0].url || ""}
        width={500}
        height={150}
        className={`object-cover w-full h-full`}
      />
    )
  }

  if (myEvent) {
    return (
      <FeedDetail
        setDetailOpen={setDetailOpen}
        setCommentOpen={setCommentOpen}
        setOpen={setOpen}
        detailOpen={detailOpen}
        feed={feed}
        updatedDescription={updatedDescription}
        currentUser={currentUser}
        setEmojiOpen={setEmojiOpen}
        emojiOpen={emojiOpen}
        commentsCount={commentsCount}
        commentOpen={commentOpen}
        emojiReactedUser={emojiReactedUser}
        commentLoading={commentLoading}
        comments={comments}
        handleLoadMore={handleLoadMore}
        open={open}
        userDetail={userDetail}
        myEvent={myEvent}
      />
    )
  }

  return (
    <>
      <Card className="lg:w-[calc(100%/3-2rem)] w-[calc(100%/2-2rem)] border border-exm flex-1 rounded-lg shrink-0">
        <CardContent className="p-0 relative">
          <div className="overflow-hidden rounded-lg h-[150px] w-full shrink-0 rounded-bl-none rounded-br-none ">
            {renderImage()}
          </div>
          <FeedActions
            feed={feed}
            open={open}
            setOpen={setOpen}
            isDetail={false}
          />
          <div className="px-4 py-3 ">
            <div className="overflow-x-hidden">
              <p className="text-black font-semibold mb-2 text-lg">
                {feed.title}
              </p>
              <p className="text-[#222] mb-2 truncate w-full">
                {updatedDescription}
              </p>
              {renderEventInfo()}
            </div>
            <div className="w-full shrink-0 flex gap-3">
              <EventDropDown event={feed} />
              <FeedDetail
                setDetailOpen={setDetailOpen}
                setCommentOpen={setCommentOpen}
                setOpen={setOpen}
                detailOpen={detailOpen}
                feed={feed}
                updatedDescription={updatedDescription}
                currentUser={currentUser}
                setEmojiOpen={setEmojiOpen}
                emojiOpen={emojiOpen}
                commentsCount={commentsCount}
                commentOpen={commentOpen}
                emojiReactedUser={emojiReactedUser}
                commentLoading={commentLoading}
                comments={comments}
                handleLoadMore={handleLoadMore}
                open={open}
                userDetail={userDetail}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default EventItem

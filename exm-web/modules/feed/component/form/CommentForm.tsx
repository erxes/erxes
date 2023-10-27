"use client"

import { useState } from "react"
import { IUser } from "@/modules/auth/types"
import dayjs from "dayjs"
import {
  ClockIcon,
  HeartIcon,
  MapPinIcon,
  SendHorizontal,
  UserIcon,
  UsersIcon,
} from "lucide-react"

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "@/components/ui/image"
import LoadingCard from "@/components/ui/loading-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { AttachmentWithPreview } from "@/components/AttachmentWithPreview"

import { useComments } from "../../hooks/useComment"
import { useReactionMutaion } from "../../hooks/useReactionMutation"
import { IFeed } from "../../types"
import CommentItem from "../CommentItem"

const CommentForm = ({
  feed,
  currentUserId,
  emojiReactedUser,
  emojiCount,
}: {
  feed: IFeed
  currentUserId: string
  emojiReactedUser: string[]
  emojiCount: number
}) => {
  const { reactionMutation, commentMutation } = useReactionMutaion({})

  const { comments, commentsCount, loading, handleLoadMore } = useComments(
    feed._id
  )

  const [comment, setComment] = useState("")

  const user = feed.createdUser || ({} as IUser)
  const userDetail = user.details

  const textareaStyle = {
    minHeight: "50px",
    height: `${Math.max(50, comment.split("\n").length * 20)}px`,
    maxHeight: "300px",
  }

  const idExists = emojiReactedUser.some(
    (item: any) => item._id === currentUserId
  )

  const urlRegex = /(https?:\/\/[^\s]+)/g

  let links: string[] = []
  let updatedDescription = ""

  if (feed.description) {
    const matches = feed.description.match(urlRegex)

    if (matches) {
      updatedDescription = matches.reduce(
        (prevDescription: string, link: string) =>
          prevDescription.replace(link, ""),
        feed.description
      )

      links = matches
    } else {
      updatedDescription = feed.description
    }
  }

  if (loading) {
    return <LoadingCard />
  }

  const handleInputChange = (e: any) => {
    setComment(e.target.value)
  }

  const onSubmit = () => {
    if (comment) {
      commentMutation(feed._id, comment)
    } else {
      return toast({
        description: `Please enter comment`,
      })
    }

    setComment("")
  }

  const onEnterPress = (e: any) => {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault()
      onSubmit()
    }
  }

  const reactionAdd = () => {
    reactionMutation(feed._id)
  }

  const renderEventInfo = () => {
    const { eventData } = feed

    return (
      <div className="text-[#444]">
        <div className="flex items-center mb-2">
          <ClockIcon size={18} className="mr-1" />
          {dayjs(eventData?.startDate).format("MM/DD/YYYY h:mm A")} ~{" "}
          {dayjs(eventData?.endDate).format("MM/DD/YYYY h:mm A")}
        </div>
        <div className="flex items-center mb-2">
          <UsersIcon size={18} className="mr-1" />
          <b>{eventData?.goingUserIds.length}</b>&nbsp;Going •&nbsp;
          <b>{eventData?.interestedUserIds?.length}</b>&nbsp;Interested
        </div>
        <div className="flex items-center mb-2">
          <UserIcon size={18} className="mr-1" />
          Event by{" "}
          {feed?.createdUser?.details?.fullName ||
            feed?.createdUser?.username ||
            feed?.createdUser?.email}
        </div>
        <div className="flex items-center mb-2">
          <MapPinIcon size={18} className="mr-1" />
          {eventData?.where || ""}
        </div>
      </div>
    )
  }

  const renderComments = () => {
    return comments.map((item: any, i: number) => (
      <CommentItem key={i} comment={item} currentUserId={currentUserId} />
    ))
  }

  return (
    <DialogContent className="">
      <DialogHeader>
        <DialogTitle>{feed?.title || ""}</DialogTitle>
      </DialogHeader>
      <div className="flex items-center ">
        <Image
          src={userDetail?.avatar || "/avatar-colored.svg"}
          alt="User Profile"
          width={100}
          height={100}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <div className="text-sm font-bold text-gray-700 mb-1">
            {userDetail?.fullName || userDetail?.username || userDetail?.email}
          </div>
          <div className="text-xs text-[#666] font-normal">
            {dayjs(feed.createdAt).format("MM/DD/YYYY h:mm A")}{" "}
            <span className="text-green-700 font-bold text-sm ml-1">{`#${feed.contentType}`}</span>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[650px]">
        <div className="my-1 overflow-x-hidden">
          <p className="text-[#666]">{updatedDescription}</p>
        </div>

        {feed.contentType === "event" && renderEventInfo()}

        {links.map((link, index) => {
          return (
            <iframe
              key={index}
              width="640"
              height="390"
              src={String(link)
                .replace("watch?v=", "embed/")
                .replace("youtu.be/", "youtube.com/embed/")
                .replace("share/", "embed/")}
              title="Video"
              allowFullScreen={true}
            />
          )
        })}

        <div className="border-b pb-2">
          {feed.images && feed.images.length > 0 && (
            <AttachmentWithPreview images={feed.images} className="" />
          )}
          <div
            className="cursor-pointer flex items-center mr-4 mt-1"
            onClick={reactionAdd}
          >
            <HeartIcon
              size={20}
              className="mr-1"
              fill={`${idExists ? "#FF0000" : "white"}`}
              color={`${idExists ? "#FF0000" : "black"}`}
            />
            <span className="font-bold text-base">{emojiCount}</span>
          </div>
        </div>

        {renderComments()}

        {commentsCount > 0 && (
          <div className="flex items-center justify-between mt-2">
            <p
              className="cursor-pointer text-[#444] hover:underline underline-offset-2"
              onClick={handleLoadMore}
            >
              {commentsCount !== comments.length ? "View more comments" : ""}
            </p>

            <p className="text-[#444] mr-2" onClick={handleLoadMore}>
              {comments.length} / {commentsCount}
            </p>
          </div>
        )}

        {loading && <LoadingCard />}
      </ScrollArea>

      <div className="flex items-center px-2 rounded-2xl border">
        <textarea
          value={comment}
          onKeyDown={onEnterPress}
          onChange={handleInputChange}
          placeholder="Type a message..."
          style={textareaStyle}
          className="resize-none rounded-2xl px-4 pt-4 w-full  focus:outline-none"
        />
        <label onClick={onSubmit} className="mr-2">
          <SendHorizontal size={18} />
        </label>
      </div>
    </DialogContent>
  )
}

export default CommentForm

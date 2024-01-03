"use client"

import { useState } from "react"
import { IUser } from "@/modules/auth/types"
import dayjs from "dayjs"
import {
  ClockIcon,
  MapPinIcon,
  SendHorizontal,
  ThumbsUp,
  UserIcon,
  UsersIcon,
} from "lucide-react"

import { CardFooter } from "@/components/ui/card"
import { DialogContent } from "@/components/ui/dialog"
import Image from "@/components/ui/image"
import LoadingCard from "@/components/ui/loading-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { FilePreview } from "@/components/FilePreview"

import { useReactionMutaion } from "../../hooks/useReactionMutation"
import { IComment, IFeed } from "../../types"
import CommentItem from "../CommentItem"

const CommentForm = ({
  feed,
  currentUserId,
  emojiReactedUser,
  emojiCount,
  comments,
  commentsCount,
  loading,
  handleLoadMore,
}: {
  feed: IFeed
  currentUserId: string
  emojiReactedUser: string[]
  emojiCount: number
  comments: IComment[]
  commentsCount: number
  loading: boolean
  handleLoadMore: () => void
}) => {
  const { reactionMutation, commentMutation } = useReactionMutaion({})

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

  const renderEmojiCount = () => {
    if (emojiCount === 0 || !emojiCount) {
      return null
    }

    let text

    if (idExists) {
      text = `You ${
        emojiCount - 1 === 0 ? "" : ` and ${emojiCount - 1} others`
      }  liked this`
    } else {
      text = emojiCount
    }

    return (
      <div className="flex mt-4">
        <div className="bg-primary-light rounded-full w-[22px] h-[22px] flex items-center justify-center text-white mr-2">
          <ThumbsUp size={12} fill="#fff" />
        </div>
        <div className="text-[#5E5B5B]">{text} </div>
      </div>
    )
  }

  return (
    <DialogContent className="max-w-2xl w-[42rem] p-[15px]">
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
          </div>
        </div>
      </div>

      <ScrollArea className="h-[60vh]">
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
              className="rounded-lg mt-4"
            />
          )
        })}

        <div className="border-b pb-2">
          {feed.images && feed.images.length > 0 && (
            <div className="mt-4">
              <FilePreview
                attachments={feed.images}
                fileUrl={feed.images[0].url}
                fileIndex={0}
                grid={true}
              />
            </div>
          )}
          {renderEmojiCount()}
        </div>
        <CardFooter className="border-b p-0 justify-between">
          <div
            className="cursor-pointer flex items-center py-2 px-4 hover:bg-[#F0F0F0]"
            onClick={reactionAdd}
          >
            <ThumbsUp
              size={20}
              className="mr-1"
              fill={`${idExists ? "#8771D5" : "white"}`}
              color={`${idExists ? "#8771D5" : "black"}`}
            />
            <div className={`${idExists ? "text-primary" : "text-black"}`}>
              Like
            </div>
          </div>
        </CardFooter>
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

      <div className="flex items-center px-2 rounded-2xl bg-[#F5F6FF]">
        <textarea
          value={comment}
          onKeyDown={onEnterPress}
          onChange={handleInputChange}
          placeholder="Type a message..."
          style={textareaStyle}
          className="resize-none rounded-2xl px-4 pt-4 w-full focus:outline-none bg-[#F5F6FF]"
        />
        <label onClick={onSubmit} className="mr-2">
          <SendHorizontal size={18} className="text-primary" />
        </label>
      </div>
    </DialogContent>
  )
}

export default CommentForm

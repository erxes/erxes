"use client"

import { IUser } from "@/modules/auth/types"
import dayjs from "dayjs"
import {
  ClockIcon,
  HeartIcon,
  MapPinIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react"

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "@/components/ui/image"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AttachmentWithPreview } from "@/components/AttachmentWithPreview"
import { ImageWithPreview } from "@/components/ImageWithPreview"

import { useReactionMutaion } from "../../hooks/useReactionMutation"
import { IFeed } from "../../types"

const CommentForm = ({
  feed,
  currentId,
  emojiReactedUser,
  emojiCount,
}: {
  feed: IFeed
  currentId: string
  emojiReactedUser: string[]
  emojiCount: number
}) => {
  const { reactionMutation, commentMutation, deleteComment } =
    useReactionMutaion()

  const user = feed.createdUser || ({} as IUser)
  const userDetail = user.details

  const idExists = emojiReactedUser.some((item: any) => item._id === currentId)

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

  return (
    <DialogContent className="">
      <DialogHeader>
        <DialogTitle>{feed?.title || ""}</DialogTitle>
      </DialogHeader>
      <div className="flex items-center">
        <Image
          src={userDetail?.avatar || "/user.png"}
          alt="User Profile"
          width={100}
          height={100}
          className="w-10 h-10 rounded-full"
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

      <ScrollArea className="overflow-auto h-[650px]">
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

        <div className="flex items-start mt-2">
          <Image
            src={userDetail?.avatar || "/user.png"}
            alt="User Profile"
            width={100}
            height={100}
            className="w-10 h-10 rounded-full shrink-0"
          />
          <div className="ml-3 bg-[#F8F9FA] p-1 rounded-lg">
            <div className="text-sm font-bold text-gray-700">
              {userDetail?.fullName ||
                userDetail?.username ||
                userDetail?.email}
            </div>
            <p>sda</p>
            {/* <div className="text-xs text-[#666] font-normal">
              {dayjs(feed.createdAt).format("MM/DD/YYYY h:mm A")}
            </div> */}
          </div>
        </div>
      </ScrollArea>

      <Input />
    </DialogContent>
  )
}

export default CommentForm

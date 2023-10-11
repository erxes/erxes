"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useFeedDetail } from "@/modules/feed/hooks/useFeedDetail"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  ExternalLinkIcon,
  HeartIcon,
  MapPinIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinIcon,
  StarIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react"

import { readFile } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "@/components/ui/image"
import LoadingCard from "@/components/ui/loading-card"
import LoadingPost from "@/components/ui/loadingPost"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ImageWithPreview } from "@/components/ImageWithPreview"

import useFeedMutation from "../hooks/useFeedMutation"
import { useReactionMutaion } from "../hooks/useReactionMutation"
import { useReactionQuery } from "../hooks/useReactionQuery"
import CommentForm from "./form/CommentForm"

const BravoForm = dynamic(() => import("./form/BravoForm"))
const EventForm = dynamic(() => import("./form/EventForm"))
const HolidayForm = dynamic(() => import("./form/HolidayForm"))
const PostForm = dynamic(() => import("./form/PostForm"))

const PostItem = ({ postId }: { postId: string }): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [commentOpen, setCommentOpen] = useState(false)
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { feed, loading } = useFeedDetail({ feedId: postId })
  const { emojiCount, emojiReactedUser, loadingReactedUsers } =
    useReactionQuery({
      feedId: postId,
    })

  const {
    deleteFeed,
    pinFeed,
    eventAction,
    loading: mutationLoading,
  } = useFeedMutation({
    callBack,
  })
  const { reactionMutation } = useReactionMutaion({
    callBack,
  })

  if (loading) {
    return <LoadingCard />
  }

  if (loadingReactedUsers) {
    return <div />
  }

  const user = feed.createdUser || ({} as IUser)
  const userDetail = user.details

  const idExists = emojiReactedUser.some(
    (item: any) => item._id === currentUser._id
  )

  const isGoing = feed.eventData?.goingUserIds.includes(currentUser._id)

  const isInterest = feed.eventData?.interestedUserIds.includes(currentUser._id)

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

  const handleEventAction = (type: string) => {
    eventAction(feed._id, type)
  }

  const editAction = () => {
    const renderForm = () => {
      switch (feed.contentType) {
        case "post":
          return <PostForm feed={feed} setOpen={setOpen} />
        case "publicHoliday":
          return <HolidayForm feed={feed} setOpen={setOpen} />
        case "welcome":
          return null
        case "bravo":
          return <BravoForm feed={feed} setOpen={setOpen} />
        case "event":
          return <EventForm feed={feed} setOpen={setOpen} />
      }
    }

    return (
      <>
        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
          <DialogTrigger asChild={true}>
            <div className="text-black flex items-center">
              <PencilIcon size={16} className="mr-1" /> Edit
            </div>
          </DialogTrigger>

          {open ? renderForm() : null}
        </Dialog>
      </>
    )
  }

  const renderComment = () => {
    return (
      <>
        <Dialog
          open={commentOpen}
          onOpenChange={() => setCommentOpen(!commentOpen)}
        >
          <DialogTrigger asChild={true} id="delete-form">
            <div className="cursor-pointer flex items-center pt-2">
              <MessageCircleIcon size={20} className="mr-1" color="black" />
            </div>
          </DialogTrigger>

          {commentOpen && (
            <CommentForm
              feed={feed}
              currentUserId={currentUser._id}
              emojiReactedUser={emojiReactedUser}
              emojiCount={emojiCount}
            />
          )}
        </Dialog>
      </>
    )
  }

  const deleteAction = () => {
    const renderDeleteForm = () => {
      return (
        <DialogContent>
          {mutationLoading ? <LoadingPost text={"Deleting"} /> : null}

          <div className="flex flex-col items-center justify-center">
            <AlertTriangleIcon size={30} color={"#6569DF"} /> Are you sure?
          </div>

          <DialogFooter className="flex flex-col items-center justify-center sm:justify-center sm:space-x-2">
            <Button
              className="font-semibold rounded-full bg-[#F2F2F2] hover:bg-[#F2F2F2] text-black"
              onClick={() => setFormOpen(false)}
            >
              No, Cancel
            </Button>

            <Button
              type="submit"
              className="font-semibold rounded-full"
              onClick={() => deleteFeed(feed._id)}
            >
              Yes, I am
            </Button>
          </DialogFooter>
        </DialogContent>
      )
    }

    return (
      <>
        <Dialog open={formOpen} onOpenChange={() => setFormOpen(!formOpen)}>
          <DialogTrigger asChild={true} id="delete-form">
            <div className="text-black flex items-center">
              <TrashIcon size={16} className="mr-1" />
              Delete
            </div>
          </DialogTrigger>

          {renderDeleteForm()}
        </Dialog>
      </>
    )
  }

  const renderFeedActions = () => {
    if (feed.contentType === "welcome") {
      return null
    }

    return (
      <Popover>
        <PopoverTrigger asChild={true}>
          <div className="p-2 bg-white rounded-full">
            <MoreHorizontalIcon size={16} />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-3">
          {currentUser.isOwner || currentUser._id === user._id ? (
            <div className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-[#444] text-xs">
              {editAction()}
            </div>
          ) : null}

          {currentUser.isOwner || currentUser._id === user._id ? (
            <div className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-[#444] text-xs">
              {deleteAction()}
            </div>
          ) : null}

          {feed.contentType === "event" &&
          new Date(feed.eventData?.endDate || "") < new Date() ? null : (
            <div
              className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-[#444] text-xs flex items-center"
              onClick={() => pinFeed(feed._id)}
            >
              <PinIcon size={16} className="mr-1" />
              <span className="text-black font-medium">
                {feed.isPinned ? "UnPin" : "Pin"}
              </span>
            </div>
          )}
        </PopoverContent>
      </Popover>
    )
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
    <>
      <Card className="max-w-2xl mx-auto my-4 border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
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
                  {userDetail?.fullName ||
                    userDetail?.username ||
                    userDetail?.email}
                </div>
                <div className="text-xs text-[#666] font-normal">
                  {dayjs(feed.createdAt).format("MM/DD/YYYY h:mm A")}{" "}
                  <span className="text-green-700 font-bold text-sm ml-1">{`#${feed.contentType}`}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center cursor-pointer">
              {feed.contentType === "event" && (
                <>
                  <div
                    className={`cursor-pointer flex items-center p-2 ${
                      isGoing ? "bg-[#6569DF]" : "bg-[#F0F0F0]"
                    } mr-1 rounded-lg`}
                    onClick={() => handleEventAction("going")}
                  >
                    <CheckCircle2Icon
                      size={16}
                      className="mr-1"
                      color={`${isGoing ? "white" : "black"}`}
                    />
                    <span
                      className={`${
                        isGoing ? "text-white" : "text-black"
                      } text-xs`}
                    >
                      Going
                    </span>
                  </div>

                  <div
                    className={`cursor-pointer flex items-center p-2 ${
                      isInterest ? "bg-[#6569DF]" : "bg-[#F0F0F0]"
                    } mr-1 rounded-lg`}
                    onClick={() => handleEventAction("interested")}
                  >
                    <StarIcon
                      size={16}
                      className="mr-1"
                      color={`${isInterest ? "white" : "black"}`}
                    />
                    <span
                      className={`${
                        isInterest ? "text-white" : "text-black"
                      } text-xs`}
                    >
                      Interest
                    </span>
                  </div>
                </>
              )}

              {feed.isPinned && <PinIcon size={18} color={"#FF0000"} />}
              {renderFeedActions()}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-4">
            <div className="text-sm font-semibold text-slate-800 overflow-x-hidden">
              <b className="text-[#444] text-base font-bold">{feed.title}</b>
            </div>
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
          </div>

          {(feed.attachments || []).map((a, index) => {
            return (
              <a key={index} href={readFile(a.url)}>
                <div className="flex items-center border-y text-sm font-semibold text-[#444] p-2.5">
                  {a.name} <ExternalLinkIcon size={18} />
                </div>
              </a>
            )
          })}

          {feed.images && feed.images.length > 0 && (
            <ImageWithPreview images={feed.images} className="mt-2" />
          )}
        </CardContent>

        <CardFooter className="border-t mt-5 pb-2">
          <div
            className="cursor-pointer flex items-center pt-2 mr-4"
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
          {renderComment()}
        </CardFooter>
      </Card>
    </>
  )
}

export default PostItem

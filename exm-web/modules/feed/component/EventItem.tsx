"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useFeedDetail } from "@/modules/feed/hooks/useFeedDetail"
import { isNonNullObject } from "@apollo/client/utilities"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import {
  AlertTriangleIcon,
  Calendar,
  ExternalLinkIcon,
  MapPinIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
  PencilIcon,
  PinIcon,
  PinOff,
  ThumbsUp,
  TrashIcon,
  UserIcon,
} from "lucide-react"

import { readFile } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import LoadingCard from "@/components/ui/loading-card"
import LoadingPost from "@/components/ui/loadingPost"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FilePreview } from "@/components/FilePreview"

import { useComments } from "../hooks/useComment"
import useFeedMutation from "../hooks/useFeedMutation"
import { useReactionMutaion } from "../hooks/useReactionMutation"
import { useReactionQuery } from "../hooks/useReactionQuery"
import CommentItem from "./CommentItem"
import EventDropDown from "./EventDropDown"
import EventUsersAvatar from "./EventUsersAvatar"
import CommentForm from "./form/CommentForm"

const EventForm = dynamic(() => import("./form/EventForm"))

const EventItem = ({ postId }: { postId: string }): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [seeMore, setSeeMore] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [commentOpen, setCommentOpen] = useState(false)
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { feed, loading } = useFeedDetail({ feedId: postId })
  const {
    comments,
    commentsCount,
    loading: commentLoading,
    handleLoadMore,
  } = useComments(feed._id)
  const { emojiCount, emojiReactedUser, loadingReactedUsers } =
    useReactionQuery({
      feedId: postId,
    })

  const {
    deleteFeed,
    pinFeed,
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

  const idExists = emojiReactedUser.some(
    (item: any) => item._id === currentUser._id
  )

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

  const reactionAdd = () => {
    reactionMutation(feed._id)
  }

  const editAction = () => {
    const renderForm = () => {
      return <EventForm feed={feed} setOpen={setOpen} />
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
              Comment
            </div>
          </DialogTrigger>

          {commentOpen && (
            <CommentForm
              feed={feed}
              comments={comments}
              commentsCount={commentsCount}
              loading={commentLoading}
              handleLoadMore={handleLoadMore}
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
            <div className="text-destructive flex items-center">
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
    if (currentUser._id !== feed.createdUser?._id) {
      return null
    }

    return (
      <Popover>
        <PopoverTrigger asChild={true}>
          <div className="p-2 bg-white rounded-full">
            <MoreVerticalIcon size={16} />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-3">
          {new Date(feed.eventData?.endDate || "") < new Date() ? null : (
            <div
              className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-[#444] text-xs flex items-center"
              onClick={() => pinFeed(feed._id)}
            >
              {feed.isPinned ? (
                <PinOff size={16} className="mr-1 text-black" />
              ) : (
                <PinIcon size={16} className="mr-1 text-black" />
              )}
              <span className="text-black font-medium">
                {feed.isPinned ? "UnPin" : "Pin"}
              </span>
            </div>
          )}
          <div className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-[#444] text-xs">
            {editAction()}
          </div>
          <div className="hover:bg-[#F0F0F0] p-2 rounded-md cursor-pointer text-xs">
            {deleteAction()}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  const renderEventInfo = () => {
    const { eventData } = feed

    return (
      <div className="text-[#5E5B5B]">
        <div className="flex items-center mb-2">
          <Calendar size={18} className="mr-1" />
          {dayjs(eventData?.startDate).format("MM/DD/YY h:mm A")} ~{" "}
          {dayjs(eventData?.endDate).format("MM/DD/YY h:mm A")}
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
        {eventData && <EventUsersAvatar eventData={eventData} />}
        {(feed.attachments || []).map((a, index) => {
          return (
            <a key={index} href={readFile(a.url)}>
              <div className="flex items-center bg-primary-light text-sm font-medium text-white attachment-shadow px-2.5 py-[5px] justify-between w-full rounded-lg rounded-tr-none mt-4">
                {a.name} <ExternalLinkIcon size={18} />
              </div>
            </a>
          )
        })}
      </div>
    )
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

  const renderImage = () => {
    if (!feed.images || feed.images.length === 0) {
      return null
    }

    return (
      <div className="overflow-hidden rounded-[10px] h-[150px] w-[150px] mr-[20px] shrink-0">
        <FilePreview
          attachments={[feed.images[0]]}
          fileUrl={feed.images[0].url}
          fileIndex={0}
        />
      </div>
    )
  }

  const renderSeeMore = () => {
    if (seeMore || updatedDescription.length < 60) {
      return null
    }

    return (
      <span
        className="text-primary cursor-pointer"
        onClick={() => setSeeMore(true)}
      >
        {" "}
        see more...
      </span>
    )
  }

  const renderComments = () => {
    if (!comments || comments.length === 0) {
      return null
    }

    return (
      <div className="border-t mt-3">
        <CommentItem comment={comments[0]} currentUserId={currentUser._id} />
      </div>
    )
  }

  return (
    <>
      <Card className="max-w-[56rem] mx-auto my-4 border-0 p-4">
        <CardContent className="p-0 flex items-start justify-between">
          <div className="flex">
            {renderImage()}
            <div>
              <div className="overflow-x-hidden">
                <p className="text-black font-semibold mb-2">{feed.title}</p>
                <p className="text-[#222] mb-2">
                  <span
                    className={`${
                      seeMore ? "max-h-fit" : "max-h-[40px]"
                    } flex overflow-hidden`}
                  >
                    {updatedDescription}
                  </span>
                  {renderSeeMore()}
                </p>
              </div>
              {renderEventInfo()}
            </div>
          </div>
          <div className="w-[205px] shrink-0 flex">
            <EventDropDown event={feed} />
            {renderFeedActions()}
          </div>
        </CardContent>

        {renderEmojiCount()}
        <CardFooter className="border-t mt-5 pb-0 justify-between">
          <div
            className="cursor-pointer flex items-center pt-2 mr-4"
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
          {renderComment()}
        </CardFooter>
        {renderComments()}
      </Card>
    </>
  )
}

export default EventItem

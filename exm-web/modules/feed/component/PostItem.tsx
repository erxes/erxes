"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useFeedDetail } from "@/modules/feed/hooks/useFeedDetail"
import dayjs from "dayjs"
import { useAtomValue } from "jotai"
import {
  AlertTriangleIcon,
  ExternalLinkIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinIcon,
  PinOff,
  ThumbsUp,
  TrashIcon,
} from "lucide-react"

import { readFile } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { FilePreview } from "@/components/FilePreview"
import { useUsers } from "@/components/hooks/useUsers"

import { useComments } from "../hooks/useComment"
import useFeedMutation from "../hooks/useFeedMutation"
import { useReactionMutaion } from "../hooks/useReactionMutation"
import { useReactionQuery } from "../hooks/useReactionQuery"
import { useTeamMembers } from "../hooks/useTeamMembers"
import CommentItem from "./CommentItem"
import UsersList from "./UsersList"
import CommentForm from "./form/CommentForm"

const BravoForm = dynamic(() => import("./form/BravoForm"))
const HolidayForm = dynamic(() => import("./form/HolidayForm"))
const PostForm = dynamic(() => import("./form/PostForm"))

const PostItem = ({ postId }: { postId: string }): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [commentOpen, setCommentOpen] = useState(false)
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

  const callBack = (result: string) => {
    if (result === "success") {
      setOpen(false)
    }
  }

  const { feed, loading } = useFeedDetail({ feedId: postId })
  const { users } = useUsers({})
  const { departments, loading: departmentLoading } = useTeamMembers({})

  const {
    comments,
    commentsCount,
    loading: commentLoading,
    handleLoadMore,
  } = useComments(postId)
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

  const searchParams = useSearchParams()
  const dateFilter = searchParams.get("dateFilter")

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
            <div className="cursor-pointer flex items-center py-3 px-4 hover:bg-[#F0F0F0]">
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
              emojiReactedUser={emojiReactedUser.map((u) => u._id)}
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
    if (feed.contentType === "welcome") {
      return null
    }

    if (currentUser._id !== feed.createdUser?._id) {
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

  const renderCreatedDate = () => {
    if (feed.createdAt) {
      const postCreationDate: any = new Date(feed.createdAt)
      const currentDate: any = new Date()
      const differenceInMilliseconds = currentDate - postCreationDate
      const monthsDifference =
        differenceInMilliseconds / (1000 * 60 * 60 * 24 * 30.44)

      if (feed.contentType === "publicHoliday") {
        return dayjs(feed.createdAt).format("• MMM DD")
      }

      if (monthsDifference >= 2) {
        return dayjs(feed.createdAt).format("MM/DD/YYYY h:mm A")
      }

      return dayjs(feed.createdAt).fromNow()
    }
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
      <div className="flex mt-4 justify-between text-[#5E5B5B] items-center">
        <Dialog open={emojiOpen} onOpenChange={() => setEmojiOpen(!emojiOpen)}>
          <DialogTrigger asChild={true}>
            <div className="flex cursor-pointer items-center">
              <div className="bg-primary-light rounded-full w-[22px] h-[22px] flex items-center justify-center text-white mr-2">
                <ThumbsUp size={12} fill="#fff" />
              </div>
              <div>{text}</div>
            </div>
          </DialogTrigger>
          <DialogContent className="p-0 gap-0 max-w-md">
            <DialogHeader className="border-b p-4">
              <DialogTitle className="flex justify-around">People</DialogTitle>
            </DialogHeader>
            <UsersList users={emojiReactedUser} />
          </DialogContent>
        </Dialog>
        <div>{commentsCount} comments</div>
      </div>
    )
  }

  const renderAttachments = () => {
    if (!feed.attachments || feed.attachments.length === 0) {
      return null
    }

    return (
      <div className="flex flex-wrap gap-3 mt-4">
        {(feed.attachments || []).map((a, index) => {
          return (
            <a key={index} href={readFile(a.url)} className="w-1/2 flex-1">
              <div className="flex bg-[#EAEAEA] text-sm font-medium text-[#444] attachment-shadow px-2.5 py-[5px] justify-between w-full rounded-[6px] rounded-tr-none">
                <span className="truncate w-[calc(100%-50px)]">{a.name}</span>{" "}
                <ExternalLinkIcon size={18} />
              </div>
            </a>
          )
        })}
      </div>
    )
  }

  const renderImages = () => {
    if (!feed.images || feed.images.length === 0) {
      return null
    }

    return (
      <div className="mt-4">
        <FilePreview
          attachments={feed.images}
          fileUrl={feed.images[0].url}
          fileIndex={0}
          grid={true}
        />
      </div>
    )
  }

  if (feed.contentType === "publicHoliday") {
    const date = new Date(feed.createdAt ? feed.createdAt : "")
    if (dateFilter && !date.toString().includes(dateFilter)) {
      return <></>
    }
  }
  const renderComments = () => {
    if (!comments || comments.length === 0) {
      return null
    }

    return (
      <div className="border-t pb-4">
        <CommentItem comment={comments[0]} currentUserId={currentUser._id} />
      </div>
    )
  }

  const renderRecipientUsers = () => {
    if (feed.recipientIds.length === 0 || !feed.recipientIds) {
      return null
    }

    if(departmentLoading) {
      return <div />
    }

    const recipientUsers = users.filter((u) =>
      feed.recipientIds.includes(u._id)
    )

    const recipientDepartments = departments.filter((u) =>
      feed.recipientIds.includes(u._id)
    )

    const more = () => {
      if (recipientUsers.length + recipientDepartments.length < 3) {
        return null
      }

      return (
        <>
          {" "}
          and {recipientUsers.length + recipientDepartments.length - 2} more
          people
        </>
      )
    }

    return (
      <Dialog open={emojiOpen} onOpenChange={() => setEmojiOpen(!emojiOpen)}>
        <DialogTrigger asChild={true}>
          <span className="cursor-pointer">
            <span className="text-[#5E5B5B] font-medium">&nbsp;with </span>
            {recipientUsers.slice(0, 2).map((item, index) => {
              return (
                <span key={Math.random()}>
                  {item?.details?.fullName || item?.username || item?.email}
                  {index + 1 !==
                    recipientUsers.length + recipientDepartments.length && ", "}
                </span>
              )
            })}
            {recipientUsers.length < 2 &&
              recipientDepartments
                .slice(0, recipientUsers.length || 2)
                .map((item, index) => {
                  return (
                    <span key={Math.random()}>
                      {item.title}
                      {index + 1 !==
                        recipientUsers.length + recipientDepartments.length &&
                        ", "}
                    </span>
                  )
                })}
            {more()}
          </span>
        </DialogTrigger>
        <DialogContent className="p-0 gap-0 max-w-md">
          <DialogHeader className="border-b p-4">
            <DialogTitle className="flex justify-around">People</DialogTitle>
          </DialogHeader>
          <UsersList
            users={recipientUsers}
            departments={recipientDepartments}
          />
        </DialogContent>
      </Dialog>
    )
  }

  const renderHolidayType = () => {
    if (feed.contentType !== "publicHoliday") {
      return null
    }
    if (!feed.category) {
      return null
    }
    const bgColor =
      feed.category === "ceremony"
        ? "bg-primary"
        : feed.category === "birthday"
        ? "bg-[#AC43C6]"
        : "bg-success-foreground"

    return (
      <div className={`text-white capitalize ${bgColor} px-3 py-1 rounded-lg`}>
        {feed.category}
      </div>
    )
  }

  return (
    <>
      <Card className="w-full mx-auto my-4 border-0 p-4 pb-0">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src={userDetail?.avatar || "/avatar-colored.svg"}
                alt="User Profile"
                width={100}
                height={100}
                className="w-10 h-10 rounded-full object-cover border border-primary"
              />
              <div
                className={`ml-3 ${
                  feed.contentType === "publicHoliday" &&
                  "flex items-center gap-3"
                }`}
              >
                <div className="text-sm font-bold text-gray-700">
                  {userDetail?.fullName ||
                    userDetail?.username ||
                    userDetail?.email}
                  {feed.contentType === "bravo" && renderRecipientUsers()}
                </div>
                {renderHolidayType()}
                <div className="text-xs text-[#666] font-normal">
                  {renderCreatedDate()}{" "}
                </div>
              </div>
            </div>

            <div className="flex items-center cursor-pointer">
              {renderFeedActions()}
              {feed.isPinned && <PinIcon size={18} color={"#FF0000"} />}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-hidden">
            <p className="text-black">{updatedDescription}</p>
          </div>
          {links.map((link, index) => {
            return (
              <iframe
                key={index}
                width="860"
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

          {renderAttachments()}
          {renderImages()}
          {renderEmojiCount()}
        </CardContent>

        <CardFooter className="border-t mt-5 p-0 justify-between">
          <div
            className="cursor-pointer flex items-center py-3 px-4 hover:bg-[#F0F0F0]"
            onClick={reactionAdd}
          >
            <ThumbsUp
              size={20}
              className="mr-1"
              fill={`${idExists ? "#6569DF" : "white"}`}
              color={`${idExists ? "#6569DF" : "black"}`}
            />
            <div
              className={`${idExists ? "text-primary-light" : "text-black"}`}
            >
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

export default PostItem

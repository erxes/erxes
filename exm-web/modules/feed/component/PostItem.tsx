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
import { AttachmentWithPreview } from "@/components/AttachmentWithPreview"
import { ImageGrid } from "@/components/ImageGrid"
import { useUsers } from "@/components/hooks/useUsers"

import { useComments } from "../hooks/useComment"
import useFeedMutation from "../hooks/useFeedMutation"
import { useReactionMutaion } from "../hooks/useReactionMutation"
import { useReactionQuery } from "../hooks/useReactionQuery"
import { useTeamMembers } from "../hooks/useTeamMembers"
import CommentItem from "./CommentItem"
import UsersList from "./UsersList"
import CommentForm from "./form/CommentForm"
import FormAttachments from "./form/FormAttachments"

const BravoForm = dynamic(() => import("./form/BravoForm"))
const PostForm = dynamic(() => import("./form/PostForm"))
const FeedForm = dynamic(() => import("./form/FeedForm"))

const PostItem = ({ postId }: { postId: string }): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
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
      return <FeedForm contentType={feed.contentType || "post"} />
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
    if (commentLoading) {
      return <LoadingCard />
    }

    return (
      commentOpen && (
        <>
          {comments.map((item: any, i: number) => (
            <CommentItem
              key={i}
              comment={item}
              currentUserId={currentUser._id}
            />
          ))}
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
        </>
      )
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

    const onClickHandler = () => {
      setDetailOpen(true)
      setCommentOpen(true)
    }

    return (
      <div className="flex my-3 justify-between text-[#475467] items-center px-4">
        <Dialog open={emojiOpen} onOpenChange={() => setEmojiOpen(!emojiOpen)}>
          <DialogTrigger asChild={true}>
            <div className="flex cursor-pointer items-center">
              <div className="bg-primary rounded-full w-[22px] h-[22px] flex items-center justify-center text-white mr-2">
                <ThumbsUp size={12} />
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
        <div className="cursor-pointer" onClick={() => onClickHandler()}>
          {commentsCount} comments
        </div>
      </div>
    )
  }

  const renderAttachments = () => {
    if (!feed.attachments || feed.attachments.length === 0) {
      return null
    }

    return <FormAttachments type="postItem" attachments={feed.attachments} />
  }

  const renderImages = () => {
    if (!feed.images || feed.images.length === 0) {
      return null
    }

    return (
      <div onClick={() => setDetailOpen(!detailOpen)}>
        <ImageGrid attachments={feed.images} />
      </div>
    )
  }

  const renderRecipientUsers = () => {
    if (feed.recipientIds.length === 0 || !feed.recipientIds) {
      return null
    }

    if (departmentLoading) {
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
            {recipientUsers.slice(0, 2).map((item) => {
              return (
                <span key={Math.random()}>
                  @{item?.details?.fullName || item?.username || item?.email}
                  &nbsp;
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

  const renderPostHeader = () => {
    return (
      <div className="flex  justify-between px-4 pt-2">
        <div className="flex items-center">
          <Image
            src={userDetail?.avatar || "/avatar-colored.svg"}
            alt="User Profile"
            width={100}
            height={100}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-2">
            <div className="text-base font-bold text-gray-700 flex items-center gap-[8px]">
              {userDetail?.fullName ||
                userDetail?.username ||
                userDetail?.email}
              <span className="text-[18px] text-[#98A2B3]">∙</span>
              <span
                className={`uppercase flex ${contentTypeBgColor} text-sm text-white px-2 py-1 rounded-full gap-[4px] items-center`}
              >
                {feed.isPinned && <PinIcon size={15} color={"#fff"} />}
                {feed.contentType}
              </span>
              {feed.contentType === "bravo" && renderRecipientUsers()}
            </div>
            <div className="text-xs text-[#666] font-normal">
              {renderCreatedDate()}{" "}
            </div>
          </div>
        </div>

        <div className="flex  cursor-pointer">{renderFeedActions()}</div>
      </div>
    )
  }

  const renderPostFooter = () => {
    return (
      <CardFooter className="border-t p-0 text-[#475467]">
        <div
          className="cursor-pointer flex items-center py-3 px-4"
          onClick={reactionAdd}
        >
          <ThumbsUp
            size={20}
            className="mr-1"
            color={`${idExists ? "#5B38CA" : "#475467"}`}
          />
          <div className={`${idExists ? "text-primary" : "text-[#475467]"}`}>
            Like
          </div>
        </div>
        <div
          className="cursor-pointer flex items-center py-3 px-4"
          onClick={() => setCommentOpen(!commentOpen)}
        >
          <MessageCircleIcon size={20} className="mr-1" color="#475467" />
          Comment
        </div>
      </CardFooter>
    )
  }

  const renderDetail = () => {
    const dialogHandler = () => {
      setDetailOpen(!detailOpen)
      setCommentOpen(false)
    }

    return (
      <Dialog open={detailOpen} onOpenChange={() => dialogHandler()}>
        <DialogTrigger asChild={true}>{renderImages()}</DialogTrigger>
        <DialogContent className="p-0 gap-0 max-w-[65%] bg-0 overflow-hidden">
          <div className="flex min-h-[60vh] h-[60vh]">
            <AttachmentWithPreview
              images={feed.images || []}
              indexProp={0}
              className="w-[calc(100%-430px)]"
            />
            <div className="w-[430px] px-4 relative bg-white">
              <div className=" h-[calc(100%-70px)] overflow-auto">
                {renderPostHeader()}
                <p className="text-black px-4 py-3">{updatedDescription}</p>
                {renderAttachments()}
                {renderEmojiCount()}
                {renderPostFooter()}
                {renderComment()}
              </div>
              <div className="absolute bottom-0 w-full pr-7">
                <CommentForm
                  feedId={feed._id}
                  avatar={currentUser.details.avatar}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const contentTypeBgColor =
    feed.contentType === "bravo" ? "bg-[#32D583]" : "bg-[#0BA5EC]"

  return (
    <>
      <Card className="max-w-[880px] w-full mx-auto border-exm border pt-[12px]">
        <CardHeader className="p-0">{renderPostHeader()}</CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-hidden px-4 py-[12px]">
            <p className="text-black">{updatedDescription}</p>
          </div>
          {links.map((link, index) => {
            return (
              <iframe
                key={index}
                width="880"
                height="390"
                src={String(link)
                  .replace("watch?v=", "embed/")
                  .replace("youtu.be/", "youtube.com/embed/")
                  .replace("share/", "embed/")}
                title="Video"
                allowFullScreen={true}
                className="w-full"
              />
            )
          })}

          {renderAttachments()}
          {renderDetail()}
          {renderEmojiCount()}
        </CardContent>
        {renderPostFooter()}
        {commentOpen && (
          <div className="px-4">
            {renderComment()}
            <CommentForm
              feedId={feed._id}
              avatar={currentUser.details.avatar}
            />
          </div>
        )}
      </Card>
    </>
  )
}

export default PostItem

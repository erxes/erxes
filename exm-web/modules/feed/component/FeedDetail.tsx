import { IUser } from "@/modules/auth/types"
import { MapPinIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { AttachmentWithPreview } from "@/components/AttachmentWithPreview"
import { ImageGrid } from "@/components/ImageGrid"

import EventDropDown from "./EventDropDown"
import EventUsersAvatar from "./EventUsersAvatar"
import FeedComment from "./FeedComment"
import EmojiCount from "./FeedEmojiCount"
import PostFooter from "./FeedFooter"
import PostHeader from "./FeedHeader"
import CommentForm from "./form/CommentForm"
import FormAttachments from "./form/FormAttachments"

export default function FeedDetail({
  setDetailOpen,
  setCommentOpen,
  setOpen,
  detailOpen,
  feed,
  updatedDescription,
  currentUser,
  setEmojiOpen,
  emojiOpen,
  commentsCount,
  commentOpen,
  emojiReactedUser,
  commentLoading,
  comments,
  handleLoadMore,
  open,
  userDetail,
}: {
  setDetailOpen: (state: boolean) => void
  handleLoadMore: () => void
  setEmojiOpen: (state: boolean) => void
  setCommentOpen: (state: boolean) => void
  setOpen: (state: boolean) => void
  detailOpen: boolean
  commentOpen: boolean
  commentLoading: boolean
  emojiOpen: boolean
  feed: any
  updatedDescription: string
  currentUser: IUser
  commentsCount: number
  emojiReactedUser: any[]
  comments: any[]
  open: boolean
  userDetail: any
}) {
  const dialogHandler = () => {
    setDetailOpen(!detailOpen)
    setCommentOpen(false)
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

  const renderTrigger = () => {
    if (feed.contentType === "event") {
      return <Button className="rounded-lg px-3 h-auto">View Details</Button>
    } else {
      return renderImages()
    }
  }

  const content = () => {
    if (feed.contentType === "event") {
      const { eventData, title } = feed
      
      return (
        <div className="px-4 py-3 flex flex-col gap-2">
          <h3 className="font-semibold text-[30px]">{title}</h3>
          <b>About this event:</b>
          <div className="flex bg-[#E0E2FF] rounded-[24px] px-3 py-[6px] text-primary gap-2 items-center">
            <div className="bg-primary rounded-full flex justify-center items-center w-[25px] h-[25px]">
              <MapPinIcon size={15} color="#fff" />
            </div>
            {eventData.where}
          </div>
          <p className="text-[#475467] ">{updatedDescription}</p>
          {eventData && <EventUsersAvatar eventData={eventData} />}
          <p className="text-[#475467]">
            {eventData.goingUserIds.length} going ~{" "}
            {eventData.interestedUserIds.length} interested
          </p>
          <EventDropDown event={feed} />
        </div>
      )
    }

    return <p className="text-black px-4 py-3">{updatedDescription}</p>
  }

  return (
    <Dialog open={detailOpen} onOpenChange={() => dialogHandler()}>
      <DialogTrigger asChild={true}>{renderTrigger()}</DialogTrigger>
      <DialogContent className="p-0 gap-0 max-w-[65%] bg-0 overflow-hidden">
        <div className="flex min-h-[60vh] h-[60vh]">
          <AttachmentWithPreview
            images={feed.images || []}
            indexProp={0}
            className="w-[calc(100%-430px)]"
          />
          <div className="w-[430px] px-4 relative bg-white">
            <div className=" h-[calc(100%-70px)] overflow-auto">
              <PostHeader
                feed={feed}
                userDetail={userDetail}
                open={open}
                setOpen={setOpen}
                isDetail={true}
              />
              {content()}
              <FormAttachments
                type="postItem"
                attachments={feed.attachments || []}
              />
              <EmojiCount
                postId={feed._id}
                setCommentOpen={setCommentOpen}
                setDetailOpen={setDetailOpen}
                setEmojiOpen={setEmojiOpen}
                emojiOpen={emojiOpen}
                commentsCount={commentsCount}
                commentOpen={commentOpen}
              />
              <PostFooter
                setOpen={setOpen}
                setCommentOpen={setCommentOpen}
                commentOpen={commentOpen}
                feedId={feed._id}
                emojiReactedUser={emojiReactedUser}
              />
              <FeedComment
                commentLoading={commentLoading}
                commentOpen={commentOpen}
                comments={comments}
                commentsCount={commentsCount}
                handleLoadMore={handleLoadMore}
                currentUserId={currentUser._id}
              />
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

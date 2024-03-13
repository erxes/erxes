"use client"

import { useState } from "react"
import { currentUserAtom } from "@/modules/JotaiProiveder"
import { IUser } from "@/modules/auth/types"
import { useFeedDetail } from "@/modules/feed/hooks/useFeedDetail"
import { useAtomValue } from "jotai"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import LoadingCard from "@/components/ui/loading-card"

import { useComments } from "../hooks/useComment"
import { useReactionQuery } from "../hooks/useReactionQuery"
import FeedBackground from "./FeedBackground"
import FeedComment from "./FeedComment"
import FeedDetail from "./FeedDetail"
import EmojiCount from "./FeedEmojiCount"
import PostFooter from "./FeedFooter"
import PostHeader from "./FeedHeader"
import CommentForm from "./form/CommentForm"
import FormAttachments from "./form/FormAttachments"

const PostItem = ({ postId }: { postId: string }): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [commentOpen, setCommentOpen] = useState(false)
  const currentUser = useAtomValue(currentUserAtom) || ({} as IUser)

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

  return (
    <>
      <Card className="max-w-[880px] w-full mx-auto border-exm border pt-[12px]">
        <CardHeader className="p-0">
          <PostHeader
            feed={feed}
            userDetail={userDetail}
            open={open}
            setOpen={setOpen}
            isDetail={false}
          />
        </CardHeader>
        <CardContent className="p-0">
          {(!feed.background || feed.background.color === "") && (
            <div className="overflow-x-hidden px-4 py-[12px]">
              <p className="text-black">{updatedDescription}</p>
            </div>
          )}
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

          {feed.background && feed.background.color !== "" && (
            <FeedBackground
              bg={feed.background}
              description={updatedDescription}
            />
          )}

          <FormAttachments
            type="postItem"
            attachments={feed.attachments || []}
          />
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
          <EmojiCount
            postId={postId}
            setCommentOpen={setCommentOpen}
            setDetailOpen={
              (feed.images || []).length > 0 ? setDetailOpen : undefined
            }
            setEmojiOpen={setEmojiOpen}
            emojiOpen={emojiOpen}
            commentsCount={commentsCount}
            commentOpen={commentOpen}
          />
        </CardContent>
        <PostFooter
          setOpen={setOpen}
          setCommentOpen={setCommentOpen}
          commentOpen={commentOpen}
          feedId={feed._id}
          emojiReactedUser={emojiReactedUser}
        />
        {commentOpen && (
          <div className="px-4">
            <FeedComment
              commentLoading={commentLoading}
              commentOpen={commentOpen}
              comments={comments}
              commentsCount={commentsCount}
              handleLoadMore={handleLoadMore}
              currentUserId={currentUser._id}
            />
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

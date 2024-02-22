import LoadingCard from "@/components/ui/loading-card"

import CommentItem from "./CommentItem"

export default function FeedComment({
  commentLoading,
  commentOpen,
  comments,
  commentsCount,
  handleLoadMore,
  currentUserId
}: {
  commentLoading: boolean
  commentOpen: boolean
  comments: any[]
  commentsCount: number
  handleLoadMore: () => void
  currentUserId: string
}) {

  if (commentLoading) {
    return <LoadingCard />
  }

  return (
    commentOpen ? (
      <>
        {comments.map((item: any, i: number) => (
          <CommentItem key={i} comment={item} currentUserId={currentUserId} />
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
    ) : null
  )
}

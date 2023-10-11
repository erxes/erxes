import { useMutation } from "@apollo/client"

import { mutations } from "../graphql"

export interface IUsePosts {
  loadingReaction: boolean
  reactionMutation: (contentId: string) => void
  commentMutation: (contentId: string, comment: string) => void
  deleteComment: (contentId: string) => void
}

export const useReactionMutaion = (): IUsePosts => {
  const [reactionAdd, { loading: loadingReaction }] = useMutation(
    mutations.emojiReact,
    {
      refetchQueries: ["emojiCount", "emojiReactedUsers"],
    }
  )

  const reactionMutation = (contentId: string) => {
    reactionAdd({
      variables: { contentId, contentType: "exmFeed", type: "heart" },
    })
  }

  const [commentAdd, { loading: loadingComment }] = useMutation(
    mutations.commentAdd,
    {
      refetchQueries: ["comments", "commentCount"],
    }
  )

  const [commentRemove, { loading: loadingCommentDelete }] = useMutation(
    mutations.commentRemove,
    {
      refetchQueries: ["comments", "commentCount"],
    }
  )

  const commentMutation = (contentId: string, comment: string) => {
    commentAdd({
      variables: { contentId, contentType: "exmFeed", comment },
    })
  }

  const deleteComment = (contentId: string) => {
    commentRemove({
      variables: { _id: contentId },
    })
  }

  return {
    reactionMutation,
    commentMutation,
    deleteComment,
    loadingReaction,
  }
}

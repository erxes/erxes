import { useQuery } from "@apollo/client"

import { queries } from "../graphql"
import { IComment } from "../types"

export interface IUsePosts {
  loading: boolean
  comments: IComment[]
  commentsCount: number
  handleLoadMore: () => void
}

export const useComments = (contentId: string): IUsePosts => {
  const { data, loading, fetchMore } = useQuery(queries.comments, {
    variables: {
      contentId,
      contentType: "exmFeed",
      limit: 10,
    },
  })

  const handleLoadMore = () => {
    const commentLength = data.comments.list.length || 0

    fetchMore({
      variables: {
        skip: commentLength,
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) {
          return prev
        }

        const fetchedComment = fetchMoreResult.comments.list || []

        const prevComment = prev.comments.list || []

        if (fetchedComment) {
          return {
            ...prev,
            comments: {
              ...prev.comments,
              list: [...prevComment, ...fetchedComment],
            },
          }
        }
      },
    })
  }

  const comments = (data || {}).comments ? (data || {}).comments.list : []
  const commentsCount = (data || {}).comments
    ? (data || {}).comments.totalCount
    : 0

  return {
    loading,
    comments,
    commentsCount,
    handleLoadMore,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20

import { useQuery } from "@apollo/client"

import { queries } from "../graphql"
import { IFeed } from "../types"

export interface IUsePosts {
  loading: boolean
  feeds: IFeed[]
  feedsCount: number
  handleLoadMore: () => void
}

export const useFeeds = (contentType: string): IUsePosts => {
  const { data, loading, fetchMore } = useQuery(queries.feed, {
    variables: {
      contentTypes: [contentType],
      limit: 10,
    },
  })

  const handleLoadMore = () => {
    const feedLength = data.exmFeed.list.length || 0

    fetchMore({
      variables: {
        skip: feedLength,
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) {
          return prev
        }

        const fetchedExmFeed = fetchMoreResult.exmFeed.list || []

        const prevExmFeed = prev.exmFeed.list || []

        if (fetchedExmFeed) {
          return {
            ...prev,
            exmFeed: {
              ...prev.exmFeed,
              list: [...prevExmFeed, ...fetchedExmFeed],
            },
          }
        }
      },
    })
  }

  const feeds = (data || {}).exmFeed ? (data || {}).exmFeed.list : []
  const feedsCount = (data || {}).exmFeed ? (data || {}).exmFeed.totalCount : 0

  return {
    loading,
    feeds,
    feedsCount,
    handleLoadMore,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20

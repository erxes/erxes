import { useQuery } from "@apollo/client"

import { queries } from "../graphql"
import { IFeed } from "../types"

export interface IUsePosts {
  loading: boolean
  totalCount: number
  events: IFeed[]
  handleLoadMore: () => void
}

export const useEvents = (): IUsePosts => {
  const { data, loading, fetchMore } = useQuery(queries.feed, {
    variables: {
      contentTypes: "event",
      limit: 20,
      skip: 0,
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

        const fetchedEvent = fetchMoreResult.exmFeed.list || []
        const prevEvent = prev.exmFeed.list || []

        if (fetchedEvent) {
          return {
            ...prev,
            exmFeed: {
              ...prev.exmFeed,
              list: [...prevEvent, ...fetchedEvent],
            },
          }
        }
      },
    })
  }

  const events = (data || {}).exmFeed ? (data || {}).exmFeed.list : []
  const totalCount = (data || {}).exmFeed ? (data || {}).exmFeed.totalCount : 0

  return {
    loading,
    handleLoadMore,
    events,
    totalCount,
  }
}

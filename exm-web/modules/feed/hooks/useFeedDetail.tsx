import { useQuery } from "@apollo/client"

import { queries } from "../graphql"
import { IFeed } from "../types"

export interface IUseFeedDetail {
  loading: boolean
  feed: IFeed
}

export const useFeedDetail = ({
  feedId,
}: {
  feedId: string
}): IUseFeedDetail => {
  const { data, loading } = useQuery(queries.exmFeedDetail, {
    variables: {
      _id: feedId,
    },
  })

  const feed = (data || {}).exmFeedDetail || {}

  return {
    loading,
    feed,
  }
}

export const FETCH_MORE_PER_PAGE: number = 20

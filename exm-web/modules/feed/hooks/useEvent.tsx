import { useQuery } from "@apollo/client"

import { queries } from "../graphql"
import { IFeed } from "../types"

export interface IUsePosts {
  loading: boolean
  events: IFeed[]
}

export const useEvents = (): IUsePosts => {
  const { data, loading } = useQuery(queries.feed, {
    variables: {
      contentTypes: "event",
    },
  })

  const events = (data || {}).exmFeed ? (data || {}).exmFeed.list : []

  return {
    loading,
    events,
  }
}
